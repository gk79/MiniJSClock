import { describe, expect, it } from 'vitest'
import catalog from '../cityCatalog.json'

import {
  civilInputAt,
  resolveCivilMinute,
  configureOnce,
  dailyOccurrence,
  evaluateAlarms,
  openAlarmSession,
  isCanonicalInstant,
} from '../alarms'

const ny = 'America/New_York'
const date = (value: string) => new Date(value)
const once = { cityId: 1, recurrence: 'once' as const, instant: '2026-01-15T13:00:00.000Z' }
const daily = { cityId: 1, recurrence: 'daily' as const, time: '08:00' }
const zones = new Map([[1, ny]])

describe('civil minute resolution', () => {
  it.each([
    [ny, '2026-01-15', '08:00', ['2026-01-15T13:00:00.000Z']],
    [ny, '2026-03-08', '02:30', []],
    [ny, '2026-11-01', '01:30', ['2026-11-01T05:30:00.000Z', '2026-11-01T06:30:00.000Z']],
    ['Asia/Kathmandu', '2026-01-15', '08:00', ['2026-01-15T02:15:00.000Z']],
    [
      'Australia/Lord_Howe',
      '2026-04-05',
      '01:45',
      ['2026-04-04T14:45:00.000Z', '2026-04-04T15:15:00.000Z'],
    ],
    ['Pacific/Apia', '2011-12-30', '12:00', []],
    ['Pacific/Kiritimati', '2026-01-15', '00:00', ['2026-01-14T10:00:00.000Z']],
    ['Pacific/Pago_Pago', '2026-01-15', '23:59', ['2026-01-16T10:59:00.000Z']],
  ])('resolves %s %s %s to every validated candidate', (zone, day, time, expected) => {
    expect(resolveCivilMinute(zone, day, time)).toEqual(expected)
  })

  it.each(['2026-02-30', '2026-2-01', '0000-01-01', '2026-13-01'])(
    'rejects invalid date %s',
    (day) => {
      expect(() => resolveCivilMinute(ny, day, '08:00')).toThrow(RangeError)
    },
  )
  it.each(['24:00', '8:00', '08:60', '08:00:00', ''])('rejects invalid minute %s', (time) => {
    expect(() => resolveCivilMinute(ny, '2026-01-15', time)).toThrow(RangeError)
  })

  it.each([
    ['2026-11-01T05:00:00Z', '2026-11-01T05:30:00.000Z'],
    ['2026-11-01T05:30:00Z', '2026-11-01T06:30:00.000Z'],
    ['2026-11-01T06:00:00Z', '2026-11-01T06:30:00.000Z'],
  ])('chooses first strictly future overlap candidate at %s', (now, instant) => {
    expect(configureOnce(1, ny, '2026-11-01', '01:30', date(now))).toEqual({
      ok: true,
      alarm: { cityId: 1, recurrence: 'once', instant },
    })
  })
  it('rejects past, gap and invalid input with distinct reasons', () => {
    expect(configureOnce(1, ny, '2026-11-01', '01:30', date('2026-11-01T06:30:00Z'))).toEqual({
      ok: false,
      reason: 'past',
    })
    expect(configureOnce(1, ny, '2026-03-08', '02:30', date('2026-03-01T00:00:00Z'))).toEqual({
      ok: false,
      reason: 'nonexistent',
    })
    expect(configureOnce(1, ny, '2026-02-30', '08:00', date('2026-01-01T00:00:00Z'))).toEqual({
      ok: false,
      reason: 'invalid',
    })
    expect(configureOnce(1, ny, '2026-01-15', '08:00', date('2026-01-15T12:59:59.999Z'))).toEqual({
      ok: true,
      alarm: once,
    })
  })
  it('rejects a repeated minute after both occurrences have passed', () => {
    expect(configureOnce(1, ny, '2026-11-01', '01:30', date('2026-11-01T07:00:00Z'))).toEqual({
      ok: false,
      reason: 'past',
    })
  })
  it('accepts only valid canonical UTC minute instants', () => {
    expect(isCanonicalInstant(once.instant)).toBe(true)
    for (const value of [
      '2026-02-30T13:00:00.000Z',
      '2026-01-15T13:00:01.000Z',
      '2026-01-15T13:00:00Z',
      '2026-01-15T14:00:00.000+01:00',
      '',
      null,
    ]) {
      expect(isCanonicalInstant(value)).toBe(false)
    }
  })
})

describe('daily and actual-interval evaluation', () => {
  it('skips gaps and uses only the first overlap occurrence', () => {
    expect(dailyOccurrence(ny, '2026-03-08', '02:30')).toBeUndefined()
    expect(dailyOccurrence(ny, '2026-11-01', '01:30')).toBe('2026-11-01T05:30:00.000Z')
    expect(dailyOccurrence('Asia/Kathmandu', '2026-01-15', '08:00')).toBe(
      '2026-01-15T02:15:00.000Z',
    )
    const alarm = { ...daily, time: '01:30' }
    expect(
      evaluateAlarms([alarm], zones, date('2026-11-01T05:30:00Z'), date('2026-11-01T06:30:00Z'))
        .due,
    ).toEqual([])
    expect(
      evaluateAlarms([alarm], zones, date('2026-11-01T05:00:00Z'), date('2026-11-01T07:00:00Z'))
        .due,
    ).toHaveLength(1)
  })
  it('uses (previous, current], consumes once and retains daily', () => {
    for (const alarm of [once, daily]) {
      const result = evaluateAlarms(
        [alarm],
        zones,
        date('2026-01-15T12:59:59.999Z'),
        date(once.instant),
      )
      expect(result.due).toEqual([{ alarm, instant: once.instant }])
      expect(result.nextAlarms).toEqual(alarm.recurrence === 'once' ? [] : [daily])
      expect(
        evaluateAlarms([alarm], zones, date(once.instant), date('2026-01-15T13:01:00Z')).due,
      ).toEqual([])
      expect(
        evaluateAlarms(
          [alarm],
          zones,
          date('2026-01-15T12:00:00Z'),
          date('2026-01-15T12:59:59.999Z'),
        ).due,
      ).toEqual([])
    }
  })
  it('detects late one-time evaluation and coalesces long daily delays', () => {
    expect(
      evaluateAlarms([once], zones, date('2026-01-15T12:00:00Z'), date('2026-01-16T00:00:00Z')).due,
    ).toHaveLength(1)
    const result = evaluateAlarms(
      [daily],
      zones,
      date('2025-01-01T00:00:00Z'),
      date('2026-01-15T15:00:00Z'),
    )
    expect(result.due).toEqual([{ alarm: daily, instant: once.instant }])
    expect(result.nextAlarms).toEqual([daily])
  })
  it('does not deliver a daily gap', () => {
    expect(
      evaluateAlarms(
        [{ ...daily, time: '02:30' }],
        zones,
        date('2026-03-08T05:00:00Z'),
        date('2026-03-09T03:00:00Z'),
      ).due,
    ).toEqual([])
  })
  it('identifies stale once alarms at session opening without retroactive due events', () => {
    const start = date('2026-01-16T00:00:00Z')
    const future = { ...once, cityId: 2, instant: '2026-01-17T00:00:00.000Z' }
    const session = openAlarmSession([once, daily, future], start)
    expect(session.stale).toEqual([once])
    expect(session.nextAlarms).toEqual([daily, future])
    expect(
      evaluateAlarms(session.nextAlarms, zones, start, date('2026-01-16T00:01:00Z')).due,
    ).toEqual([])
    expect(openAlarmSession([once], date(once.instant)).stale).toEqual([once])
  })
  it('rejects invalid or reversed evaluation instants', () => {
    expect(() => evaluateAlarms([], zones, date('bad'), date(once.instant))).toThrow(RangeError)
    expect(() =>
      evaluateAlarms([], zones, date(once.instant), date('2026-01-01T00:00:00Z')),
    ).toThrow(RangeError)
    expect(evaluateAlarms([once], zones, date(once.instant), date(once.instant)).due).toEqual([])
  })
})

describe('candidate search bound for the bundled product domain', () => {
  it('round-trips every bundled IANA zone at deterministic winter/summer and far-future instants', () => {
    const zones = [...new Set(catalog.map((city) => city.timeZone))]
    for (const zone of zones) {
      for (const instant of [
        '2026-01-15T12:00:00.000Z',
        '2026-07-15T12:00:00.000Z',
        '9998-01-15T12:00:00.000Z',
        '9998-07-15T12:00:00.000Z',
      ]) {
        const civil = civilInputAt(new Date(instant), zone)
        expect(resolveCivilMinute(zone, civil.day, civil.time), `${zone}: ${instant}`).toContain(
          instant,
        )
      }
    }
  }, 20000)
  it.each([
    ['+23:59', '2026-01-14T12:01:00.000Z'],
    ['-23:59', '2026-01-16T11:59:00.000Z'],
  ])('enumerates the outer minute offset %s', (zone, expected) => {
    expect(resolveCivilMinute(zone, '2026-01-15', '12:00')).toEqual([expected])
  })
  it('round-trips canonical Gregorian edge dates in UTC', () => {
    expect(resolveCivilMinute('UTC', '0001-01-01', '00:00')).toEqual(['0001-01-01T00:00:00.000Z'])
    expect(resolveCivilMinute('UTC', '9999-12-31', '23:59')).toEqual(['9999-12-31T23:59:00.000Z'])
  })
})
