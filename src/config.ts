export const CONFIG_KEY = 'minijsclock.config'

export type ConfigV1 = {
  version: 1
  selectedCityIds: number[]
}

export type LoadResult = {
  config: ConfigV1
  status: 'ok' | 'invalid' | 'unsupported' | 'unavailable'
}

type ReadStorage = Pick<Storage, 'getItem'>
type WriteStorage = Pick<Storage, 'setItem'>

const defaults = (): ConfigV1 => ({ version: 1, selectedCityIds: [] })

function isConfigV1(value: unknown, catalogIds: ReadonlySet<number>): value is ConfigV1 {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  if (
    Object.keys(record).length !== 2 ||
    record.version !== 1 ||
    !Array.isArray(record.selectedCityIds)
  )
    return false

  const ids = record.selectedCityIds
  return (
    ids.every((id) => Number.isSafeInteger(id) && catalogIds.has(id)) &&
    new Set(ids).size === ids.length
  )
}

export function parseConfig(raw: string, catalogIds: ReadonlySet<number>): LoadResult {
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return { config: defaults(), status: 'invalid' }
  }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const record = value as Record<string, unknown>
    if ('version' in record && record.version !== 1) {
      return { config: defaults(), status: 'unsupported' }
    }
  }
  return isConfigV1(value, catalogIds)
    ? { config: value, status: 'ok' }
    : { config: defaults(), status: 'invalid' }
}

export function loadConfig(storage: ReadStorage, catalogIds: ReadonlySet<number>): LoadResult {
  try {
    const raw = storage.getItem(CONFIG_KEY)
    return raw === null ? { config: defaults(), status: 'ok' } : parseConfig(raw, catalogIds)
  } catch {
    return { config: defaults(), status: 'unavailable' }
  }
}

export function saveConfig(
  storage: WriteStorage,
  config: ConfigV1,
  catalogIds: ReadonlySet<number>,
): boolean {
  if (!isConfigV1(config, catalogIds)) return false
  try {
    storage.setItem(CONFIG_KEY, JSON.stringify(config))
    return true
  } catch {
    return false
  }
}
