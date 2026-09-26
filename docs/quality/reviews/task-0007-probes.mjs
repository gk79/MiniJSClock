import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../../../', import.meta.url))
const require = createRequire(root + 'package.json')
const ts = require('typescript')
const transpile = (path) =>
  ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText
const url = (code) => 'data:text/javascript;base64,' + Buffer.from(code).toString('base64')
const alarmUrl = url(transpile(root + 'src/alarms.ts'))
const d = await import(alarmUrl)
const config = await import(
  url(transpile(root + 'src/config.ts').replace("from './alarms'", `from '${alarmUrl}'`))
)
const catalog = JSON.parse(readFileSync(root + 'src/cityCatalog.json', 'utf8'))
const zones = [...new Set(catalog.map((c) => c.timeZone))]
const ids = new Set(catalog.map((c) => c.geonameId))
const ny = 5128581
const base = {
  version: 3,
  selectedCityIds: [ny],
  presentationMode: 'digital',
  timeFormat: '24h',
  alarms: [],
}
let parserChecks = 0
const check = (value, status) => {
  assert.equal(config.parseConfig(JSON.stringify(value), ids).status, status, JSON.stringify(value))
  parserChecks++
}
for (const version of [1, 2, 3])
  check(
    version === 1
      ? { version, selectedCityIds: [ny] }
      : version === 2
        ? { version, selectedCityIds: [ny], presentationMode: 'analog', timeFormat: '12h' }
        : { ...base, version },
    'ok',
  )
for (const version of ['3', '4', null, true, false, 0, -1, 3.1, 4.1, 9007199254740992, [], {}])
  check({ ...base, version }, 'invalid')
for (const version of [4, 99, Number.MAX_SAFE_INTEGER]) check({ version }, 'unsupported')
for (const time of ['00:00', '23:59', '08:15'])
  check({ ...base, alarms: [{ cityId: ny, recurrence: 'daily', time }] }, 'ok')
for (const time of [
  '24:00',
  '08:60',
  '8:00',
  '08:00:00',
  '08:00\n',
  '08:00\r',
  ' 08:00',
  '08:00 ',
  '08:00\u2028',
  null,
  42,
])
  check({ ...base, alarms: [{ cityId: ny, recurrence: 'daily', time }] }, 'invalid')
for (const instant of [
  '2026-02-29T00:00:00.000Z',
  '2026-01-01T24:00:00.000Z',
  '2026-01-01T12:00:01.000Z',
  '2026-01-01T12:00:00.001Z',
  '2026-01-01T12:00:00Z',
  '2026-01-01T12:00:00.000+00:00',
  '0000-01-01T00:00:00.000Z',
  '+010000-01-01T00:00:00.000Z',
  null,
])
  check({ ...base, alarms: [{ cityId: ny, recurrence: 'once', instant }] }, 'invalid')
for (const alarm of [
  { cityId: ny, recurrence: 'daily', instant: '2026-01-01T00:00:00.000Z' },
  { cityId: ny, recurrence: 'once', time: '08:00' },
  { cityId: ny, recurrence: 'daily', time: '08:00', extra: 0 },
  { cityId: 1850147, recurrence: 'daily', time: '08:00' },
])
  check({ ...base, alarms: [alarm] }, 'invalid')
check(
  {
    ...base,
    alarms: [
      { cityId: ny, recurrence: 'daily', time: '08:00' },
      { cityId: ny, recurrence: 'once', instant: '2026-01-01T00:00:00.000Z' },
    ],
  },
  'invalid',
)
const matrix = [
  ['America/New_York', '2026-03-08', '02:00', []],
  ['America/New_York', '2026-03-08', '03:00', ['2026-03-08T07:00:00.000Z']],
  [
    'America/New_York',
    '2026-11-01',
    '01:00',
    ['2026-11-01T05:00:00.000Z', '2026-11-01T06:00:00.000Z'],
  ],
  ['Australia/Lord_Howe', '2026-10-04', '02:15', []],
  [
    'Australia/Lord_Howe',
    '2026-04-05',
    '01:30',
    ['2026-04-04T14:30:00.000Z', '2026-04-04T15:00:00.000Z'],
  ],
  ['Asia/Kathmandu', '2026-09-26', '00:00', ['2026-09-25T18:15:00.000Z']],
  ['Pacific/Apia', '2011-12-30', '00:00', []],
  ['Pacific/Kiritimati', '2026-09-26', '23:59', ['2026-09-26T09:59:00.000Z']],
  ['Pacific/Pago_Pago', '2026-09-26', '00:00', ['2026-09-26T11:00:00.000Z']],
  ['+23:59', '2026-09-26', '00:00', ['2026-09-25T00:01:00.000Z']],
  ['-23:59', '2026-09-26', '23:59', ['2026-09-27T23:58:00.000Z']],
  ['UTC', '0001-01-01', '00:00', ['0001-01-01T00:00:00.000Z']],
  ['UTC', '9999-12-31', '23:59', ['9999-12-31T23:59:00.000Z']],
]
for (const [zone, day, time, expected] of matrix)
  assert.deepEqual(d.resolveCivilMinute(zone, day, time), expected)
const dates = []
for (let year = 2026; year <= 2040; year++)
  for (let month = 1; month <= 12; month++)
    dates.push(`${year}-${String(month).padStart(2, '0')}-15T12:00:00.000Z`)
for (const year of ['2099', '2100', '2400', '9998', '9999'])
  for (const month of ['01', '07', '12']) dates.push(`${year}-${month}-15T12:00:00.000Z`)
let min = Infinity,
  max = -Infinity,
  offsetChecks = 0,
  roundTrips = 0
for (const zone of zones) {
  const f = new Intl.DateTimeFormat('en-GB', {
    timeZone: zone,
    calendar: 'gregory',
    numberingSystem: 'latn',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  for (const instant of dates) {
    const parts = Object.fromEntries(
      f.formatToParts(new Date(instant)).map((p) => [p.type, p.value]),
    )
    const civil = `${parts.year.padStart(4, '0')}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}.000Z`
    const offset = Date.parse(civil) - Date.parse(instant)
    assert.ok(Math.abs(offset) <= 86400000, `${zone} ${instant} ${offset}`)
    assert.ok(offset % 60000 === 0)
    min = Math.min(min, offset)
    max = Math.max(max, offset)
    offsetChecks++
  }
  for (const instant of ['2026-09-26T00:00:00.000Z', '9999-12-30T23:59:00.000Z']) {
    const civil = d.civilInputAt(new Date(instant), zone)
    assert.ok(
      d.resolveCivilMinute(zone, civil.day, civil.time).includes(instant),
      `${zone}: ${instant}`,
    )
    roundTrips++
  }
}
const daily = { cityId: ny, recurrence: 'daily', time: '01:30' }
const zoneMap = new Map([[ny, 'America/New_York']])
for (const [start, end, want] of [
  ['2026-11-01T05:29:59.999Z', '2026-11-01T05:30:00Z', '2026-11-01T05:30:00.000Z'],
  ['2026-11-01T05:30:00Z', '2026-11-01T06:30:00Z', null],
  ['2026-10-01T00:00:00Z', '2026-11-01T07:00:00Z', '2026-11-01T05:30:00.000Z'],
]) {
  const r = d.evaluateAlarms([daily], zoneMap, new Date(start), new Date(end))
  assert.deepEqual(
    r.due.map((e) => e.instant),
    want ? [want] : [],
  )
  assert.deepEqual(r.nextAlarms, [daily])
}
console.log(
  JSON.stringify({
    parserChecks,
    resolverCases: matrix.length,
    catalogCities: catalog.length,
    zones: zones.length,
    offsetChecks,
    offsetHours: [min / 3600000, max / 3600000],
    roundTrips,
    intervalChecks: 3,
    runtime: process.version,
    icu: process.versions.icu,
    tz: process.versions.tz,
  }),
)

// This observation reproduces R2; it is not an accepted contract expectation.
const outside = new Date('+010000-01-01T04:59:00.000Z')
const civil = d.civilInputAt(outside, 'America/New_York')
assert.deepEqual(civil, { day: '9999-12-31', time: '23:59' })
console.log(
  JSON.stringify({
    boundaryCivil: civil,
    actualInstant: outside.toISOString(),
    observed: d.configureOnce(
      ny,
      'America/New_York',
      civil.day,
      civil.time,
      new Date('2026-09-26T12:00:00Z'),
    ),
  }),
)
