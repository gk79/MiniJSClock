import { createAlarmEvaluator, openAlarmSession, type Alarm } from './alarms'
import type { SoundOutcome } from './alarm-audio'

export type RuntimeEvent = Readonly<{
  id: string
  cityName: string
  cityId: number
  instant: string
  recurrence: Alarm['recurrence']
  sound: 'pending' | SoundOutcome
}>
type RuntimeCity = { name: string; timeZone: string }

/** One open session; no clock, scheduler, persistence adapter or browser objects. */
export function createAlarmRuntime(options: {
  sessionStart: Date
  read: () => { alarms: readonly Alarm[]; cities: ReadonlyMap<number, RuntimeCity> }
  apply: (alarms: Alarm[], persist: boolean) => void
  publish: (events: readonly RuntimeEvent[]) => void
  audio: { attemptCue: () => Promise<SoundOutcome>; dispose: () => void }
}) {
  const evaluator = createAlarmEvaluator()
  let previous = new Date(options.sessionStart.getTime())
  let events: readonly RuntimeEvent[] = []
  let sequence = 0
  let disposed = false
  const opened = openAlarmSession(options.read().alarms, previous)
  options.apply(opened.nextAlarms, opened.stale.length > 0)

  function publish() {
    options.publish([...events])
  }
  function outcome(id: string, sound: SoundOutcome) {
    if (disposed || !events.some((event) => event.id === id)) return
    events = events.map((event) => (event.id === id ? { ...event, sound } : event))
    publish()
  }

  return {
    evaluateAt(actualNow: Date) {
      if (disposed) return
      const current = new Date(actualNow.getTime())
      if (current.getTime() < previous.getTime()) {
        previous = current
        return
      }
      const { alarms, cities } = options.read()
      const zones = new Map([...cities].map(([id, city]) => [id, city.timeZone]))
      const transition = evaluator.evaluate(alarms, zones, previous, current)
      const due = transition.due.map(({ alarm, instant }): RuntimeEvent => ({
        id: `${alarm.cityId}:${instant}:${++sequence}`,
        cityId: alarm.cityId,
        cityName: cities.get(alarm.cityId)?.name ?? String(alarm.cityId),
        recurrence: alarm.recurrence,
        instant,
        sound: 'pending',
      }))
      // Snapshot every event before config removal, then commit all synchronous
      // domain state before invoking any asynchronous audio operation.
      events = [...events, ...due]
      options.apply(
        transition.nextAlarms,
        transition.due.some(({ alarm }) => alarm.recurrence === 'once'),
      )
      previous = current
      if (due.length) publish()
      for (const event of due) {
        try {
          void options.audio.attemptCue().then(
            (sound) => outcome(event.id, sound),
            () => outcome(event.id, 'failed'),
          )
        } catch {
          outcome(event.id, 'failed')
        }
      }
    },
    dismiss(id: string) {
      if (disposed) return
      events = events.filter((event) => event.id !== id)
      publish()
    },
    dispose() {
      if (disposed) return
      disposed = true
      options.audio.dispose()
    },
  }
}
