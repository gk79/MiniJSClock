/** Formats a supplied instant as civil time. An omitted zone uses the browser's local zone. */
function timeFormatter(timeZone?: string): Intl.DateTimeFormat {
  let formatter: Intl.DateTimeFormat
  try {
    formatter = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
      timeZone,
    })
  } catch (error) {
    if (error instanceof RangeError && timeZone !== undefined) {
      throw new RangeError(`Invalid time zone: ${timeZone}`)
    }
    throw error
  }
  return formatter
}

export type TimeFormat = '24h' | '12h'

/** An omitted zone uses the browser's local zone; 24h retains the original h23 display. */
export function formatTime(instant: Date, timeZone?: string, format: TimeFormat = '24h'): string {
  if (format === '24h') return timeFormatter(timeZone).format(instant)
  const { hour, minute, second } = civilTime(instant, timeZone)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${pad(hour % 12 || 12)}:${pad(minute)}:${pad(second)} ${hour < 12 ? 'AM' : 'PM'}`
}

function civilTime(instant: Date, timeZone?: string) {
  const parts = timeFormatter(timeZone).formatToParts(instant)
  const part = (name: string) => Number(parts.find((entry) => entry.type === name)?.value)
  return { hour: part('hour'), minute: part('minute'), second: part('second') }
}

/** Degrees clockwise from twelve, including seconds in minute/hour positions. */
export function analogHands(instant: Date, timeZone?: string) {
  const { hour, minute, second } = civilTime(instant, timeZone)
  return {
    hour: ((hour % 12) + minute / 60 + second / 3600) * 30,
    minute: (minute + second / 60) * 6,
    second: second * 6,
  }
}
