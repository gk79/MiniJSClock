import { readFileSync, writeFileSync } from 'node:fs'

// One-time source acquisition helper. Input is cities15000.txt extracted from the official ZIP.
const [source, destination] = process.argv.slice(2)
if (!source || !destination)
  throw new Error('Usage: node scripts/normalize-geonames.mjs SOURCE DESTINATION')
const columns = [0, 1, 2, 7, 8, 14, 17]
const lines = readFileSync(source, 'utf8').trimEnd().split('\n')
const output = lines.map((line, index) => {
  const fields = line.replace(/\r$/, '').split('\t')
  if (fields.length !== 19) throw new Error(`Source line ${index + 1}: expected 19 columns`)
  return columns.map((column) => fields[column]).join('\t')
})
writeFileSync(destination, `${output.join('\n')}\n`)
