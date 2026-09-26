export type Alarm =
  | { cityId: number; recurrence: 'once'; instant: string }
  | { cityId: number; recurrence: 'daily'; time: string }

const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE
/** Exhaustive search radius, not an assumed zone/DST offset. See docs/architecture/alarms.md. */
export const CIVIL_SEARCH_RADIUS = DAY

export function isDailyTime(value: unknown): value is string {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

export function isCanonicalInstant(value: unknown): value is string {
  if (typeof value !== 'string' || !/^(?!0000)\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\.000Z$/.test(value))
    return false
  const instant = new Date(value)
  return Number.isFinite(instant.getTime()) && instant.toISOString() === value
}

function civilEpoch(day: string, time: string): number {
  if (!/^(?!0000)\d{4}-\d{2}-\d{2}$/.test(day) || !isDailyTime(time))
    throw new RangeError('Invalid civil input')
  // Explicit UTC arithmetic only; never interpret input in the browser-local zone.
  const instant = new Date(`${day}T${time}:00.000Z`)
  if (!Number.isFinite(instant.getTime()) || instant.toISOString() !== `${day}T${time}:00.000Z`)
    throw new RangeError('Invalid civil input')
  return instant.getTime()
}

function civilFormatter(timeZone: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    calendar: 'gregory',
    numberingSystem: 'latn',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    era: 'short',
  })
}

function civilFields(formatter: Intl.DateTimeFormat, instant: number) {
  const parts = formatter.formatToParts(instant)
  const part = (name: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === name)?.value ?? ''
  return {
    day: `${part('year').padStart(4, '0')}-${part('month')}-${part('day')}`,
    time: `${part('hour')}:${part('minute')}`,
    second: part('second'),
    era: part('era'),
  }
}

export function civilInputAt(instant: Date, timeZone: string) {
  const { day, time } = civilFields(civilFormatter(timeZone), instant.getTime())
  return { day, time }
}

/** Enumerate every UTC minute in the bound and validate actual city-local components. */
export function resolveCivilMinute(timeZone: string, day: string, time: string): string[] {
  const target = civilEpoch(day, time)
  const formatter = civilFormatter(timeZone)
  const candidates: string[] = []
  for (
    let candidate = target - CIVIL_SEARCH_RADIUS;
    candidate <= target + CIVIL_SEARCH_RADIUS;
    candidate += MINUTE
  ) {
    const civil = civilFields(formatter, candidate)
    if (civil.era === 'AD' && civil.day === day && civil.time === time && civil.second === '00') {
      const canonical = new Date(candidate).toISOString()
      if (isCanonicalInstant(canonical)) candidates.push(canonical)
    }
  }
  return candidates
}

export function configureOnce(
  cityId: number,
  timeZone: string,
  day: string,
  time: string,
  now: Date,
):
  | { ok: true; alarm: Extract<Alarm, { recurrence: 'once' }> }
  | { ok: false; reason: 'invalid' | 'nonexistent' | 'past' } {
  if (!Number.isFinite(now.getTime())) return { ok: false, reason: 'invalid' }
  let candidates: string[]
  try {
    candidates = resolveCivilMinute(timeZone, day, time)
  } catch (error) {
    if (error instanceof RangeError) return { ok: false, reason: 'invalid' }
    throw error
  }
  if (!candidates.length) return { ok: false, reason: 'nonexistent' }
  const instant = candidates.find((candidate) => Date.parse(candidate) > now.getTime())
  return instant
    ? { ok: true, alarm: { cityId, recurrence: 'once', instant } }
    : { ok: false, reason: 'past' }
}

export function dailyOccurrence(timeZone: string, day: string, time: string): string | undefined {
  return resolveCivilMinute(timeZone, day, time)[0]
}

/** Pure session initialization; caller owns persistence/orchestration in TASK-0008. */
export function openAlarmSession(alarms: readonly Alarm[], sessionStart: Date) {
  if (!Number.isFinite(sessionStart.getTime())) throw new RangeError('Invalid session instant')
  const stale = alarms.filter(
    (alarm) => alarm.recurrence === 'once' && Date.parse(alarm.instant) <= sessionStart.getTime(),
  )
  return { stale, nextAlarms: alarms.filter((alarm) => !stale.includes(alarm)) }
}

/** Validated configuration in; one latest due occurrence per alarm out. No timers or sound. */
export function evaluateAlarms(
  alarms: readonly Alarm[],
  cityZones: ReadonlyMap<number, string>,
  previous: Date,
  current: Date,
) {
  const start = previous.getTime()
  const end = current.getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end)
    throw new RangeError('Invalid evaluation interval')
  const due: { alarm: Alarm; instant: string }[] = []
  for (const alarm of alarms) {
    if (alarm.recurrence === 'once') {
      const occurrence = Date.parse(alarm.instant)
      if (occurrence > start && occurrence <= end) due.push({ alarm, instant: alarm.instant })
    } else {
      const zone = cityZones.get(alarm.cityId)
      if (!zone) throw new RangeError('Missing alarm city zone')
      // Visit civil dates in reverse order using UTC calendar arithmetic. The radius
      // covers date-line jumps too; endpoint local dates alone could omit a date.
      const firstDay = Math.floor((start - CIVIL_SEARCH_RADIUS) / DAY) * DAY
      const lastDay = Math.floor((end + CIVIL_SEARCH_RADIUS) / DAY) * DAY
      for (let day = lastDay; day >= firstDay; day -= DAY) {
        const dayText = new Date(day).toISOString().slice(0, 10)
        if (!/^(?!0000)\d{4}-/.test(dayText)) continue
        const occurrence = dailyOccurrence(zone, dayText, alarm.time)
        if (occurrence && Date.parse(occurrence) > start && Date.parse(occurrence) <= end) {
          due.push({ alarm, instant: occurrence })
          break
        }
      }
    }
  }
  const consumed = new Set(
    due.filter(({ alarm }) => alarm.recurrence === 'once').map(({ alarm }) => alarm.cityId),
  )
  return { due, nextAlarms: alarms.filter((alarm) => !consumed.has(alarm.cityId)) }
}
