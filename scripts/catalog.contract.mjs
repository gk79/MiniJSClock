import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { generateCatalog, parseSource, regenerate, selectCatalog } from './catalog.mjs'

const row = (
  id,
  feature = 'PPL',
  country = 'AA',
  population = 100,
  zone = 'Europe/Warsaw',
  name = `City ${id}`,
) => [id, name, name, feature, country, population, zone].join('\t')
const source = (...rows) => `${rows.join('\n')}\n`
const curation = (manualInclude = [], manualExclude = []) => ({
  version: 1,
  manualInclude,
  manualExclude,
})

test('mandatory capitals, manual inclusion, exclusion, population and ID tie break, cap, order', () => {
  const rows = [
    row(99, 'PPLC', 'AA', 1),
    row(98, 'PPL', 'AA', 1000),
    row(1, 'PPL', 'BB', 100),
    row(2, 'PPL', 'BB', 100),
    row(3, 'PPL', 'CC', 900),
    row(4, 'PPL', 'DD', 800),
  ]
  const selected = selectCatalog(parseSource(source(...rows)), curation([4], [3]), 4)
  assert.deepEqual(
    selected.map((city) => city.geonameId),
    [1, 4, 98, 99],
  )
  assert.deepEqual(Object.keys(selected[0]), [
    'geonameId',
    'name',
    'asciiName',
    'countryCode',
    'timeZone',
  ])

  const capped = [row(100, 'PPLC', 'AA', 1), row(101, 'PPL', 'AA', 999999)]
  for (let id = 1; id <= 10; id++) capped.push(row(id, 'PPL', 'AA', id))
  capped.push(row(200, 'PPL', 'BB', 1))
  assert.equal(
    selectCatalog(parseSource(source(...capped)), curation([1, 2, 3, 4, 5, 6, 7, 8, 9]), 11).find(
      (city) => city.geonameId === 101,
    ),
    undefined,
  )
})

test('invalid source records fail instead of being repaired', () => {
  for (const bad of [
    '1\ttoo few',
    row(1, 'PPL', 'A', 1),
    row(1, 'PPL', 'AA', -1),
    row(1, 'PPL', 'AA', 1, 'Invalid/Zone'),
    row(1, 'PPL', 'AA', 1, ''),
    row(1, 'PPL', 'AA', 1, 'Europe/Warsaw', ''),
    row('nope'),
  ])
    assert.throws(() => parseSource(source(bad)))
  assert.throws(() => parseSource(source(row(1), row(1))), /duplicate/)
  assert.throws(() => parseSource(row(1)), /newline/)
})

test('invalid, duplicate and overlapping curation IDs fail', () => {
  const records = parseSource(source(row(1), row(2)))
  assert.throws(() => selectCatalog(records, curation([3]), 1), /unknown/)
  assert.throws(() => selectCatalog(records, curation(['1']), 1), /invalid/)
  assert.throws(() => selectCatalog(records, curation([1, 1]), 1), /duplicate/)
  assert.throws(() => selectCatalog(records, curation([1], [1]), 1), /Overlapping/)
  assert.throws(
    () => selectCatalog(records, { version: 2, manualInclude: [], manualExclude: [] }, 1),
    /version/,
  )
})

test('mandatory-capital exclusion, oversized mandatory set and insufficient pool fail', () => {
  const records = parseSource(source(row(1, 'PPLC'), row(2, 'PPLC'), row(3)))
  assert.throws(() => selectCatalog(records, curation([], [1]), 2), /mandatory PPLC/)
  assert.throws(() => selectCatalog(records, curation(), 1), /exceeds/)
  assert.throws(() => selectCatalog(records, curation(), 4), /Insufficient/)
})

test('safe structural serialization and byte-identical regeneration with drift failure', () => {
  const name = 'A"\\n<script>'
  const output = generateCatalog(
    source(row(1, 'PPLC', 'AA', 1, 'Europe/Warsaw', name)),
    curation(),
    1,
  )
  assert.equal(JSON.parse(output)[0].name, name)
  assert.ok(!output.includes(name))

  const dir = mkdtempSync(join(tmpdir(), 'catalog-test-'))
  try {
    const artifact = join(dir, 'catalog.json')
    const input = 'data/geonames/cities15000.normalized.tsv'
    const rules = 'data/geonames/curation.v1.json'
    regenerate(input, rules, artifact)
    const first = readFileSync(artifact)
    regenerate(input, rules, artifact)
    assert.deepEqual(readFileSync(artifact), first)
    regenerate(input, rules, artifact, true)
    writeFileSync(artifact, Buffer.concat([first, Buffer.from('drift')]))
    assert.throws(() => regenerate(input, rules, artifact, true), /differs/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
