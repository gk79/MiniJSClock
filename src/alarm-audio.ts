export type SoundOutcome = 'requested' | 'failed'
export type SoundReadiness = 'not-enabled' | 'testing' | 'ready' | 'failed'

/** Browser objects stay at this adapter boundary; state permits browser-specific values. */
export type NativeAudioContext = Omit<
  Pick<
    AudioContext,
    | 'state'
    | 'currentTime'
    | 'destination'
    | 'resume'
    | 'close'
    | 'createOscillator'
    | 'createGain'
    | 'addEventListener'
    | 'removeEventListener'
  >,
  'state'
> & { readonly state: string }

export function createAlarmAudio(
  options: {
    createContext?: () => NativeAudioContext | undefined
    onReadiness?: (state: SoundReadiness) => void
  } = {},
) {
  const createContext =
    options.createContext ??
    (() => (typeof globalThis.AudioContext === 'function' ? new AudioContext() : undefined))
  let context: NativeAudioContext | undefined
  let state: SoundReadiness = 'not-enabled'
  let disposed = false
  const cancelPending = new Set<() => void>()
  const nodes = new Set<() => void>()

  function report(next: SoundReadiness) {
    if (disposed) return
    state = next
    options.onReadiness?.(next)
  }
  function observe() {
    if (state === 'ready' && context?.state !== 'running') report('failed')
    return state
  }
  function releaseContext() {
    context?.removeEventListener('statechange', observe)
    context = undefined
  }

  // A browser resume promise can remain pending under autoplay policy. Bound the
  // attempt, and never schedule a historical cue when it eventually resolves.
  function resumeWithinLimit(ctx: NativeAudioContext): Promise<boolean> {
    return new Promise((resolve) => {
      let settled = false
      const finish = (ok: boolean) => {
        if (settled) return
        settled = true
        clearTimeout(timeout)
        cancelPending.delete(cancel)
        resolve(ok)
      }
      const cancel = () => finish(false)
      const timeout = setTimeout(cancel, 3000)
      cancelPending.add(cancel)
      try {
        void ctx.resume().then(
          () => finish(true),
          () => finish(false),
        )
      } catch {
        finish(false)
      }
    })
  }

  function scheduleCue(ctx: NativeAudioContext) {
    let oscillator: OscillatorNode | undefined
    let gain: GainNode | undefined
    const cleanup = () => {
      oscillator?.disconnect()
      gain?.disconnect()
      nodes.delete(cleanup)
    }
    try {
      oscillator = ctx.createOscillator()
      gain = ctx.createGain()
      const now = ctx.currentTime
      oscillator.frequency.value = 660
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.08, now + 0.02)
      gain.gain.linearRampToValueAtTime(0, now + 0.3)
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.onended = cleanup
      nodes.add(cleanup)
      oscillator.start(now)
      oscillator.stop(now + 0.3)
    } catch (error) {
      try {
        oscillator?.stop()
      } catch {
        /* Source may not have started. */
      }
      cleanup()
      throw error
    }
  }

  async function attempt(userGesture: boolean): Promise<SoundOutcome> {
    if (disposed) return 'failed'
    try {
      if (userGesture && context?.state === 'closed') releaseContext()
      if (userGesture && !context) {
        context = createContext()
        context?.addEventListener('statechange', observe)
      }
      const ctx = context
      if (!ctx || ctx.state === 'closed') {
        report('failed')
        return 'failed'
      }
      report('testing')
      if (ctx.state !== 'running' && !(await resumeWithinLimit(ctx))) {
        report('failed')
        return 'failed'
      }
      if (disposed || context !== ctx || ctx.state !== 'running') {
        report('failed')
        return 'failed'
      }
      scheduleCue(ctx)
      if (ctx.state !== 'running') {
        report('failed')
        return 'failed'
      }
      report('ready')
      return 'requested'
    } catch {
      report('failed')
      return 'failed'
    }
  }

  return {
    enableTest: () => attempt(true),
    attemptCue: () => attempt(false),
    readiness: observe,
    dispose() {
      if (disposed) return
      disposed = true
      for (const cancel of cancelPending) cancel()
      for (const cleanup of nodes) cleanup()
      const ctx = context
      releaseContext()
      if (ctx && ctx.state !== 'closed') {
        try {
          void ctx.close().catch(() => {})
        } catch {
          /* Already unusable. */
        }
      }
    },
  }
}
