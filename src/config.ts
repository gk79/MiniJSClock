import { isCanonicalInstant, isDailyTime, type Alarm } from './alarms'
import type { TimeFormat } from './time'

export const CONFIG_KEY = 'minijsclock.config'

export type ConfigV1 = {
  version: 1
  selectedCityIds: number[]
}

export type PresentationMode = 'digital' | 'analog'

export type ConfigV2 = {
  version: 2
  selectedCityIds: number[]
  presentationMode: PresentationMode
  timeFormat: TimeFormat
}

export type ConfigV3 = Omit<ConfigV2, 'version'> & {
  version: 3
  alarms: Alarm[]
}

export type LoadResult = {
  config: ConfigV3
  status: 'ok' | 'invalid' | 'unsupported' | 'unavailable'
}

type ReadStorage = Pick<Storage, 'getItem'>
type WriteStorage = Pick<Storage, 'setItem'>

export const defaultConfig = (): ConfigV3 => ({
  version: 3,
  selectedCityIds: [],
  presentationMode: 'digital',
  timeFormat: '24h',
  alarms: [],
})

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

function isConfigV2(value: unknown, catalogIds: ReadonlySet<number>): value is ConfigV2 {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  return (
    Object.keys(record).length === 4 &&
    record.version === 2 &&
    (record.presentationMode === 'digital' || record.presentationMode === 'analog') &&
    (record.timeFormat === '24h' || record.timeFormat === '12h') &&
    isConfigV1({ version: 1, selectedCityIds: record.selectedCityIds }, catalogIds)
  )
}

function isConfigV3(value: unknown, catalogIds: ReadonlySet<number>): value is ConfigV3 {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  if (
    Object.keys(record).length !== 5 ||
    record.version !== 3 ||
    !Array.isArray(record.alarms) ||
    !isConfigV2(
      {
        version: 2,
        selectedCityIds: record.selectedCityIds,
        presentationMode: record.presentationMode,
        timeFormat: record.timeFormat,
      },
      catalogIds,
    )
  )
    return false
  const selectedIds = new Set(record.selectedCityIds as number[])
  const alarmIds = new Set<number>()
  return record.alarms.every((value: unknown) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
    const alarm = value as Record<string, unknown>
    if (
      Object.keys(alarm).length !== 3 ||
      typeof alarm.cityId !== 'number' ||
      !selectedIds.has(alarm.cityId) ||
      alarmIds.has(alarm.cityId)
    )
      return false
    alarmIds.add(alarm.cityId)
    return (
      (alarm.recurrence === 'once' && isCanonicalInstant(alarm.instant)) ||
      (alarm.recurrence === 'daily' && isDailyTime(alarm.time))
    )
  })
}

export function parseConfig(raw: string, catalogIds: ReadonlySet<number>): LoadResult {
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return { config: defaultConfig(), status: 'invalid' }
  }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const record = value as Record<string, unknown>
    if (
      typeof record.version === 'number' &&
      Number.isSafeInteger(record.version) &&
      record.version > 3
    ) {
      return { config: defaultConfig(), status: 'unsupported' }
    }
  }
  if (isConfigV1(value, catalogIds)) {
    return { config: { ...defaultConfig(), selectedCityIds: value.selectedCityIds }, status: 'ok' }
  }
  if (isConfigV2(value, catalogIds))
    return { config: { ...value, version: 3, alarms: [] }, status: 'ok' }
  return isConfigV3(value, catalogIds)
    ? { config: value, status: 'ok' }
    : { config: defaultConfig(), status: 'invalid' }
}

export function loadConfig(storage: ReadStorage, catalogIds: ReadonlySet<number>): LoadResult {
  try {
    const raw = storage.getItem(CONFIG_KEY)
    return raw === null ? { config: defaultConfig(), status: 'ok' } : parseConfig(raw, catalogIds)
  } catch {
    return { config: defaultConfig(), status: 'unavailable' }
  }
}

export function saveConfig(
  storage: WriteStorage,
  config: ConfigV3,
  catalogIds: ReadonlySet<number>,
): boolean {
  if (!isConfigV3(config, catalogIds)) return false
  try {
    storage.setItem(CONFIG_KEY, JSON.stringify(config))
    return true
  } catch {
    return false
  }
}
