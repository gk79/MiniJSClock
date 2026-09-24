/** Formats a supplied instant as civil time. An omitted zone uses the browser's local zone. */
export function formatTime(instant: Date, timeZone?: string): string {
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
  return formatter.format(instant)
}
