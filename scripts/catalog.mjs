import { readFileSync, writeFileSync } from 'node:fs'

const idPattern = /^[1-9][0-9]*$/
const populationPattern = /^(0|[1-9][0-9]*)$/
const countryPattern = /^[A-Z]{2}$/

export function parseSource(text) {
  if (!text.endsWith('\n')) throw new Error('Source must end with a newline')
  const records = new Map()
  const lines = text.slice(0, -1).split('\n')
  if (lines.length === 1 && !lines[0]) throw new Error('Source is empty')
  for (const [index, line] of lines.entries()) {
    const fields = line.split('\t')
    if (fields.length !== 7) throw new Error(`Source line ${index + 1}: expected 7 columns`)
    const [idText, name, asciiName, featureCode, countryCode, populationText, timeZone] = fields
    const context = `Source line ${index + 1}`
    if (!idPattern.test(idText) || !Number.isSafeInteger(Number(idText))) {
      throw new Error(`${context}: invalid geonameId`)
    }
    const geonameId = Number(idText)
    if (records.has(geonameId)) throw new Error(`${context}: duplicate geonameId ${geonameId}`)
    if (!name.trim() || !asciiName.trim()) throw new Error(`${context}: empty name or asciiName`)
    if (!/^[A-Z0-9]+$/.test(featureCode)) throw new Error(`${context}: invalid feature code`)
    if (!countryPattern.test(countryCode)) throw new Error(`${context}: invalid countryCode`)
    if (!populationPattern.test(populationText) || !Number.isSafeInteger(Number(populationText))) {
      throw new Error(`${context}: invalid population`)
    }
    if (!timeZone) {
      throw new Error(`${context}: invalid IANA timeZone ${JSON.stringify(timeZone)}`)
    }
    try {
      new Intl.DateTimeFormat('en-US', { timeZone })
    } catch {
      throw new Error(`${context}: invalid timeZone ${JSON.stringify(timeZone)}`)
    }
    records.set(geonameId, {
      geonameId,
      name,
      asciiName,
      featureCode,
      countryCode,
      population: Number(populationText),
      timeZone,
    })
  }
  return records
}

export function selectCatalog(records, curation, target = 400) {
  if (
    curation?.version !== 1 ||
    !Array.isArray(curation.manualInclude) ||
    !Array.isArray(curation.manualExclude)
  ) {
    throw new Error('Curation must have version 1 and manualInclude/manualExclude arrays')
  }
  const validateIds = (ids, label) => {
    const seen = new Set()
    for (const id of ids) {
      if (!Number.isSafeInteger(id) || id <= 0 || !records.has(id)) {
        throw new Error(`${label}: invalid or unknown geonameId ${JSON.stringify(id)}`)
      }
      if (seen.has(id)) throw new Error(`${label}: duplicate geonameId ${id}`)
      seen.add(id)
    }
    return seen
  }
  const include = validateIds(curation.manualInclude, 'manualInclude')
  const exclude = validateIds(curation.manualExclude, 'manualExclude')
  for (const id of include) if (exclude.has(id)) throw new Error(`Overlapping curation ID ${id}`)
  const selected = new Map()
  for (const record of records.values()) {
    if (record.featureCode === 'PPLC') {
      if (exclude.has(record.geonameId))
        throw new Error(`Cannot exclude mandatory PPLC ${record.geonameId}`)
      selected.set(record.geonameId, record)
    }
  }
  for (const id of include) selected.set(id, records.get(id))
  if (selected.size > target) throw new Error(`Mandatory/manual set exceeds ${target} entries`)
  const counts = new Map()
  for (const record of selected.values())
    counts.set(record.countryCode, (counts.get(record.countryCode) ?? 0) + 1)
  const eligible = [...records.values()]
    .filter((record) => !selected.has(record.geonameId) && !exclude.has(record.geonameId))
    .sort((a, b) => b.population - a.population || a.geonameId - b.geonameId)
  for (const record of eligible) {
    if (selected.size === target) break
    const count = counts.get(record.countryCode) ?? 0
    if (count >= 10) continue
    selected.set(record.geonameId, record)
    counts.set(record.countryCode, count + 1)
  }
  if (selected.size !== target)
    throw new Error(`Insufficient eligible pool: selected ${selected.size} of ${target}`)
  return [...selected.values()]
    .sort((a, b) => a.geonameId - b.geonameId)
    .map(({ geonameId, name, asciiName, countryCode, timeZone }) => ({
      geonameId,
      name,
      asciiName,
      countryCode,
      timeZone,
    }))
}

export function generateCatalog(source, curation, target = 400) {
  const entries = selectCatalog(parseSource(source), curation, target)
  return `${JSON.stringify(entries, null, 2)}\n`
}

export function regenerate(sourcePath, curationPath, outputPath, check = false) {
  const output = generateCatalog(
    readFileSync(sourcePath, 'utf8'),
    JSON.parse(readFileSync(curationPath, 'utf8')),
  )
  if (check) {
    if (readFileSync(outputPath, 'utf8') !== output)
      throw new Error(`${outputPath} differs from deterministic regeneration`)
  } else writeFileSync(outputPath, output)
}
