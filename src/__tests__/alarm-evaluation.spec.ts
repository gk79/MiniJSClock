import { afterEach, describe, expect, it, vi } from 'vitest'
import { createAlarmEvaluator, evaluateAlarms, type Alarm } from '../alarms'

const date = (value: string) => new Date(value)
const daily: Alarm = { cityId: 1, recurrence: 'daily', time: '08:00' }
const zones = new Map([[1, 'UTC']])
const start = date('2026-09-26T11:59:59Z')
const end = date('2026-09-26T12:00:00Z')
const measure = () => vi.spyOn(Intl.DateTimeFormat.prototype, 'formatToParts')
afterEach(() => vi.restoreAllMocks())

describe('bounded reusable alarm evaluation', () => {
  it('reuses twelve daily alarms instead of repeating the original 100k native calls', () => {
    const names = [
      'America/New_York',
      'Europe/London',
      'Asia/Tokyo',
      'Asia/Kathmandu',
      'Australia/Adelaide',
      'Pacific/Apia',
      'Pacific/Auckland',
      'Pacific/Pago_Pago',
      'Europe/Warsaw',
      'Africa/Cairo',
      'America/Los_Angeles',
      'America/Sao_Paulo',
    ]
    const cityZones = new Map(names.map((zone, i) => [i, zone]))
    const alarms = names.map((_, cityId): Alarm => ({ ...daily, cityId }))
    const expected = evaluateAlarms(alarms, cityZones, start, end)
    const evaluator = createAlarmEvaluator()
    const work = measure()
    expect(evaluator.evaluate(alarms, cityZones, start, end)).toEqual(expected)
    expect(work).toHaveBeenCalledTimes(100835)
    work.mockClear()
    expect(evaluator.evaluate(alarms, cityZones, start, end)).toEqual(expected)
    expect(work).not.toHaveBeenCalled()
  })

  it('resolves changed times/zones and only new dates on rollover', () => {
    const evaluator = createAlarmEvaluator()
    evaluator.evaluate([daily], zones, start, end)
    const work = measure()
    evaluator.evaluate([daily], zones, end, date('2026-09-26T12:00:01Z'))
    expect(work).not.toHaveBeenCalled()
    evaluator.evaluate([daily], zones, date('2026-09-27T11:59:59Z'), date('2026-09-27T12:00:00Z'))
    expect(work).toHaveBeenCalledTimes(2881)
    work.mockClear()
    const edited = { ...daily, time: '12:00' } as const
    const result = evaluator.evaluate([edited], zones, start, end)
    expect(work.mock.calls.length).toBeGreaterThan(0)
    expect(result.due).toEqual([{ alarm: edited, instant: '2026-09-26T12:00:00.000Z' }])
    work.mockClear()
    const changedZone = new Map([[1, 'Asia/Tokyo']])
    expect(evaluator.evaluate([edited], changedZone, start, end).due).toEqual([])
    expect(work.mock.calls.length).toBeGreaterThan(0)
  })

  it.each([
    ['2026-03-08T05:00:00Z', '2026-03-09T03:00:00Z', '02:30', []],
    ['2026-11-01T05:00:00Z', '2026-11-01T07:00:00Z', '01:30', ['2026-11-01T05:30:00.000Z']],
  ])('reuses gap/first-overlap resolution for %s', (previous, current, time, expected) => {
    const alarm: Alarm = { ...daily, time }
    const cityZones = new Map([[1, 'America/New_York']])
    const evaluator = createAlarmEvaluator()
    const evaluate = () => evaluator.evaluate([alarm], cityZones, date(previous), date(current))
    expect(evaluate().due.map((entry) => entry.instant)).toEqual(expected)
    const work = measure()
    expect(evaluate().due.map((entry) => entry.instant)).toEqual(expected)
    expect(work).not.toHaveBeenCalled()
  })

  it('does not deliver the second overlap occurrence from retained state', () => {
    const evaluator = createAlarmEvaluator()
    const alarm: Alarm = { ...daily, time: '01:30' }
    const cityZones = new Map([[1, 'America/New_York']])
    const first = date('2026-11-01T05:30:00Z')
    const second = date('2026-11-01T06:30:00Z')
    expect(evaluator.evaluate([alarm], cityZones, date('2026-11-01T05:00:00Z'), first).due).toEqual(
      [{ alarm, instant: first.toISOString() }],
    )
    expect(evaluator.evaluate([alarm], cityZones, first, second).due).toEqual([])
    const work = measure()
    expect(evaluator.evaluate([alarm], cityZones, first, second).due).toEqual([])
    expect(work).not.toHaveBeenCalled()
  })

  it('evicts beyond 128 entries without changing results or sharing session caches', () => {
    const evaluator = createAlarmEvaluator()
    evaluator.evaluate([daily], zones, start, end)
    // Three dates per short interval: 44 distinct times exceed the fixed bound.
    for (let minute = 1; minute <= 44; minute++) {
      evaluator.evaluate(
        [{ ...daily, time: `08:${String(minute).padStart(2, '0')}` }],
        zones,
        start,
        end,
      )
    }
    const work = measure()
    const result = evaluator.evaluate([daily], zones, start, end)
    expect(work.mock.calls.length).toBeGreaterThan(0)
    work.mockClear()
    expect(evaluator.evaluate([daily], zones, start, end)).toEqual(result)
    expect(work).not.toHaveBeenCalled()
    const separate = createAlarmEvaluator()
    separate.evaluate([daily], zones, start, end)
    expect(work.mock.calls.length).toBeGreaterThan(0)
    expect(result).toEqual(evaluateAlarms([daily], zones, start, end))
  })

  it('preserves mixed ordering, latest delayed occurrence, consumption and invalid intervals', () => {
    const once: Alarm = { cityId: 2, recurrence: 'once', instant: '2026-09-26T11:00:00.000Z' }
    const alarms = [once, daily]
    const previous = date('2026-08-01T00:00:00Z')
    const evaluator = createAlarmEvaluator()
    const expected = evaluateAlarms(alarms, zones, previous, end)
    expect(expected.due.map((entry) => entry.alarm.cityId)).toEqual([2, 1])
    expect(expected.due[1]?.instant).toBe('2026-09-26T08:00:00.000Z')
    expect(expected.nextAlarms).toEqual([daily])
    expect(evaluator.evaluate(alarms, zones, previous, end)).toEqual(expected)
    expect(evaluator.evaluate(alarms, zones, previous, end)).toEqual(expected)
    expect(() => evaluator.evaluate([], zones, end, start)).toThrow(RangeError)
    expect(() => evaluator.evaluate([], zones, date('bad'), end)).toThrow(RangeError)
  })
})
