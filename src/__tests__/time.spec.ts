import { describe, expect, it } from 'vitest'

import { formatTime } from '../time'

describe('formatTime', () => {
  it('formats fixed instants in representative IANA zones', () => {
    const instant = new Date('2026-01-15T12:34:56.000Z')

    expect(formatTime(instant, 'UTC')).toBe('12:34:56')
    expect(formatTime(instant, 'Asia/Tokyo')).toBe('21:34:56')
    expect(formatTime(instant, 'Asia/Kathmandu')).toBe('18:19:56')
  })

  it('reflects both sides of a daylight-saving transition', () => {
    expect(formatTime(new Date('2026-03-08T06:59:59.000Z'), 'America/New_York')).toBe('01:59:59')
    expect(formatTime(new Date('2026-03-08T07:00:00.000Z'), 'America/New_York')).toBe('03:00:00')
    expect(formatTime(new Date('2026-11-01T05:59:59.000Z'), 'America/New_York')).toBe('01:59:59')
    expect(formatTime(new Date('2026-11-01T06:00:00.000Z'), 'America/New_York')).toBe('01:00:00')
  })

  it('rejects an explicitly invalid IANA zone', () => {
    expect(() => formatTime(new Date('2026-01-15T12:34:56.000Z'), 'Mars/Olympus_Mons')).toThrow(
      'Invalid time zone: Mars/Olympus_Mons',
    )
  })
})
