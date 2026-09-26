import { describe, expect, it } from 'vitest'

import { analogHands, formatTime } from '../time'

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

describe('clock presentation', () => {
  it('distinguishes noon, midnight, and local/IANA AM/PM', () => {
    expect(formatTime(new Date('2026-01-15T00:00:00Z'), 'UTC', '12h')).toBe('12:00:00 AM')
    expect(formatTime(new Date('2026-01-15T12:00:00Z'), 'UTC', '12h')).toBe('12:00:00 PM')
    expect(formatTime(new Date('2026-01-15T12:34:56Z'), 'Asia/Tokyo', '12h')).toBe('09:34:56 PM')
    const local = new Date(2026, 0, 15, 13, 2, 3)
    expect(formatTime(local, undefined, '12h')).toBe('01:02:03 PM')
    expect(formatTime(local)).toBe('13:02:03')
  })

  it('includes lower-order contributions in hands for IANA civil time', () => {
    const instant = new Date('2026-01-15T12:34:56Z')
    expect(analogHands(instant, 'UTC').hour).toBeCloseTo(17.4666666667)
    expect(analogHands(instant, 'UTC').minute).toBeCloseTo(209.6)
    expect(analogHands(instant, 'UTC').second).toBe(336)
    expect(analogHands(instant, 'Asia/Tokyo').hour).toBeCloseTo(287.4666666667)
    expect(analogHands(instant, 'Asia/Kathmandu').hour).toBeCloseTo(189.9666666667)
    expect(analogHands(instant, 'Asia/Kathmandu').minute).toBeCloseTo(119.6)
    expect(analogHands(instant, 'Asia/Kathmandu').second).toBe(336)
    expect(analogHands(new Date('2026-03-08T06:59:59Z'), 'America/New_York').hour).toBeCloseTo(
      59.9916666667,
    )
    expect(analogHands(new Date('2026-03-08T07:00:00Z'), 'America/New_York')).toEqual({
      hour: 90,
      minute: 0,
      second: 0,
    })
    expect(analogHands(new Date(2026, 0, 15, 3, 30, 0))).toEqual({
      hour: 105,
      minute: 180,
      second: 0,
    })
  })
})
