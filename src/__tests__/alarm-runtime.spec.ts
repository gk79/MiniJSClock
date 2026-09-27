import { describe, expect, it, vi } from 'vitest'
import { createAlarmRuntime, type RuntimeEvent } from '../alarm-runtime'
import type { Alarm } from '../alarms'
import * as domain from '../alarms'

const start = new Date('2026-01-15T12:00:00Z')
const at = (minutes: number) => new Date(start.getTime() + minutes * 60_000)
const once = (cityId = 1, minutes = 1): Alarm => ({
  cityId,
  recurrence: 'once',
  instant: at(minutes).toISOString(),
})
const daily: Alarm = { cityId: 2, recurrence: 'daily', time: '12:01' }
function setup(initial: Alarm[], cue = vi.fn(() => Promise.resolve('requested' as const))) {
  let alarms = initial
  let events: readonly RuntimeEvent[] = []
  const persist = vi.fn()
  const cities = new Map([
    [1, { name: 'First', timeZone: 'UTC' }],
    [2, { name: 'Second', timeZone: 'UTC' }],
    [3, { name: 'Third', timeZone: 'UTC' }],
    [4, { name: 'Fourth', timeZone: 'UTC' }],
  ])
  const runtime = createAlarmRuntime({
    sessionStart: start,
    read: () => ({ alarms, cities }),
    apply: (next, shouldPersist) => {
      alarms = next
      if (shouldPersist) persist()
    },
    publish: (next) => {
      events = next
    },
    audio: { attemptCue: cue, dispose: vi.fn() },
  })
  return {
    runtime,
    cue,
    persist,
    cities,
    get alarms() {
      return alarms
    },
    set alarms(next: Alarm[]) {
      alarms = next
    },
    get events() {
      return events
    },
  }
}

describe('open-session runtime', () => {
  it('removes stale once at/before start, persists once, never delivers; retains future/daily', () => {
    const state = setup([
      once(1, -1),
      once(4, 0),
      { cityId: 3, recurrence: 'once', instant: at(2).toISOString() },
      daily,
    ])
    expect(state.alarms).toEqual([
      { cityId: 3, recurrence: 'once', instant: at(2).toISOString() },
      daily,
    ])
    expect(state.persist).toHaveBeenCalledTimes(1)
    expect(state.cue).not.toHaveBeenCalled()
    expect(state.events).toEqual([])
  })
  it('does not persist startup with no stale alarms', () => {
    const state = setup([once(), daily])
    expect(state.persist).not.toHaveBeenCalled()
  })
  it('evaluates exclusive previous/inclusive current, consumes exactly once and commits before sound', async () => {
    const state = setup([once()])
    state.cue.mockImplementation(() => {
      expect(state.alarms).toEqual([])
      expect(state.persist).toHaveBeenCalledTimes(1)
      return Promise.resolve('requested')
    })
    state.runtime.evaluateAt(at(0.5))
    expect(state.events).toEqual([])
    state.runtime.evaluateAt(at(1))
    expect(state.events).toHaveLength(1)
    state.runtime.evaluateAt(at(1))
    state.runtime.evaluateAt(at(2))
    expect(state.cue).toHaveBeenCalledTimes(1)
    await Promise.resolve()
    expect(state.events[0]?.sound).toBe('requested')
  })
  it('retains daily and preserves all simultaneous events and immutable city snapshots', () => {
    const state = setup([once(), daily])
    state.runtime.evaluateAt(at(1))
    expect(state.alarms).toEqual([daily])
    expect(state.events.map((e) => e.cityName)).toEqual(['First', 'Second'])
    expect(new Set(state.events.map((e) => e.id)).size).toBe(2)
    state.cities.clear()
    expect(state.events[0]?.cityName).toBe('First')
    state.runtime.dismiss(state.events[0]!.id)
    expect(state.events).toHaveLength(1)
    expect(state.alarms).toEqual([daily])
  })
  it('detects long delayed intervals with at most one daily event and no replay', () => {
    const state = setup([once(), daily])
    state.runtime.evaluateAt(at(60 * 24 * 30))
    expect(state.events).toHaveLength(2)
    state.runtime.evaluateAt(at(60 * 24 * 30 + 0.5))
    expect(state.events).toHaveLength(2)
    expect(state.persist).toHaveBeenCalledTimes(1)
  })
  it('reads alarm edits/removals on subsequent calls', () => {
    const state = setup([once()])
    state.alarms = [once(1, 2)]
    state.runtime.evaluateAt(at(1))
    expect(state.events).toEqual([])
    state.alarms = []
    state.runtime.evaluateAt(at(3))
    expect(state.events).toEqual([])
    state.alarms = [once(1, 4)]
    state.runtime.evaluateAt(at(4))
    expect(state.events).toHaveLength(1)
  })
  it('resets a backward clock without persistence or delivery and resumes normally', () => {
    const state = setup([once()])
    state.runtime.evaluateAt(at(-2))
    expect(state.events).toEqual([])
    expect(state.persist).not.toHaveBeenCalled()
    state.runtime.evaluateAt(at(1))
    expect(state.events).toHaveLength(1)
  })
  it('constructs exactly one evaluator across evaluations, edits and resets', () => {
    const factory = vi.spyOn(domain, 'createAlarmEvaluator')
    const state = setup([once()])
    state.runtime.evaluateAt(at(0.5))
    state.alarms = [once(1, 2)]
    state.runtime.evaluateAt(at(-1))
    state.runtime.evaluateAt(at(2))
    expect(factory).toHaveBeenCalledTimes(1)
    state.runtime.dispose()
    factory.mockRestore()
  })
  it('commits daily evaluation baseline while sound is pending', () => {
    const state = setup(
      [daily],
      vi.fn(() => new Promise(() => {})),
    )
    state.runtime.evaluateAt(at(1))
    state.runtime.evaluateAt(at(1))
    state.runtime.evaluateAt(at(2))
    expect(state.events).toHaveLength(1)
    expect(state.cue).toHaveBeenCalledTimes(1)
    expect(state.persist).not.toHaveBeenCalled()
    state.runtime.dispose()
  })
  it('retains one real evaluator: established daily keys add no native scans across ticks/edits', () => {
    const state = setup([daily])
    const format = vi.spyOn(Intl.DateTimeFormat.prototype, 'formatToParts')
    state.runtime.evaluateAt(at(0.1))
    expect(format.mock.calls.length).toBeGreaterThan(0)
    format.mockClear()
    state.alarms = [{ ...daily }]
    state.runtime.evaluateAt(at(0.2))
    state.runtime.evaluateAt(at(0.3))
    expect(format).not.toHaveBeenCalled()
    format.mockRestore()
  })
  it('pending audio does not block later evaluations; disposal ignores late outcomes', async () => {
    let resolve!: (value: 'requested') => void
    const state = setup(
      [once(), once(2, 2)],
      vi.fn(
        () =>
          new Promise<'requested'>((done) => {
            resolve = done
          }),
      ),
    )
    state.runtime.evaluateAt(at(1))
    expect(state.alarms).toEqual([once(2, 2)])
    state.runtime.evaluateAt(at(2))
    expect(state.alarms).toEqual([])
    expect(state.cue).toHaveBeenCalledTimes(2)
    expect(state.persist).toHaveBeenCalledTimes(2)
    state.runtime.dispose()
    resolve('requested')
    await Promise.resolve()
    expect(state.events.every((event) => event.sound === 'pending')).toBe(true)
    state.runtime.evaluateAt(at(3))
    expect(state.cue).toHaveBeenCalledTimes(2)
  })
  it('rejected or synchronously throwing audio cannot replay consumed alarms', async () => {
    const state = setup(
      [once()],
      vi.fn(() => Promise.reject(new Error('blocked'))),
    )
    state.runtime.evaluateAt(at(1))
    await Promise.resolve()
    await Promise.resolve()
    expect(state.events[0]?.sound).toBe('failed')
    state.runtime.evaluateAt(at(2))
    expect(state.cue).toHaveBeenCalledTimes(1)
    state.alarms = [once(2, 3)]
    state.cue.mockImplementation(() => {
      throw new Error('closed')
    })
    state.runtime.evaluateAt(at(3))
    expect(state.events[1]?.sound).toBe('failed')
    expect(state.alarms).toEqual([])
  })
})
