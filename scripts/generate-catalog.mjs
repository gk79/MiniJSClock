import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { regenerate } from './catalog.mjs'

const source = 'data/geonames/cities15000.normalized.tsv'
const curation = 'data/geonames/curation.v1.json'
const output = 'src/cityCatalog.json'
try {
  const provenance = JSON.parse(readFileSync('data/geonames/provenance.json', 'utf8'))
  const actualHash = createHash('sha256').update(readFileSync(source)).digest('hex')
  if (actualHash !== provenance.normalizedInputSha256)
    throw new Error('Pinned normalized input SHA-256 mismatch')
  regenerate(source, curation, output, process.argv[2] === '--check')
  console.log(`${process.argv[2] === '--check' ? 'Checked' : 'Generated'} ${output}`)
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
