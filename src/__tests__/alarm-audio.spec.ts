import { afterEach, describe, expect, it, vi } from 'vitest'
import { createAlarmAudio, type NativeAudioContext } from '../alarm-audio'

function context(initial = 'running') {
  const oscillator = {
    frequency: { value: 0 },
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null as (() => void) | null,
  }
  const gain = {
    gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }
  const ctx = {
    state: initial,
    currentTime: 10,
    destination: {},
    resume: vi.fn(async () => {
      ctx.state = 'running'
    }),
    close: vi.fn(async () => {
      ctx.state = 'closed'
    }),
    createOscillator: vi.fn(() => oscillator),
    createGain: vi.fn(() => gain),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  return { ctx, oscillator, gain, factory: vi.fn(() => ctx as unknown as NativeAudioContext) }
}
afterEach(() => vi.useRealTimers())
describe('native alarm audio', () => {
  it('is lazy and unavailable is recoverable, never ready from construction', async () => {
    const audio = createAlarmAudio({ createContext: () => undefined })
    expect(audio.readiness()).toBe('not-enabled')
    expect(await audio.attemptCue()).toBe('failed')
    expect(await audio.enableTest()).toBe('failed')
    expect(audio.readiness()).toBe('failed')
    audio.dispose()
  })
  it('requires a gesture to create context; running + scheduled finite cue supports ready', async () => {
    const fake = context()
    const audio = createAlarmAudio({ createContext: fake.factory })
    expect(fake.factory).not.toHaveBeenCalled()
    expect(await audio.attemptCue()).toBe('failed')
    expect(fake.factory).not.toHaveBeenCalled()
    expect(await audio.enableTest()).toBe('requested')
    expect(audio.readiness()).toBe('ready')
    expect(fake.oscillator.start).toHaveBeenCalledWith(10)
    expect(fake.oscillator.stop).toHaveBeenCalledWith(10.3)
    expect(await audio.attemptCue()).toBe('requested')
    expect(fake.factory).toHaveBeenCalledTimes(1)
    fake.oscillator.onended?.()
    expect(fake.oscillator.disconnect).toHaveBeenCalled()
    expect(fake.gain.disconnect).toHaveBeenCalled()
    audio.dispose()
    expect(fake.ctx.close).toHaveBeenCalledTimes(1)
  })
  it('resumes suspended contexts and rechecks due-time state after prior readiness', async () => {
    const fake = context('suspended')
    const audio = createAlarmAudio({ createContext: fake.factory })
    expect(await audio.enableTest()).toBe('requested')
    expect(fake.ctx.resume).toHaveBeenCalledTimes(1)
    fake.ctx.state = 'suspended'
    fake.ctx.resume.mockRejectedValue(new Error('policy'))
    expect(audio.readiness()).toBe('failed')
    expect(await audio.attemptCue()).toBe('failed')
    expect(fake.oscillator.start).toHaveBeenCalledTimes(1)
    fake.ctx.resume.mockImplementation(async () => {
      fake.ctx.state = 'running'
    })
    expect(await audio.enableTest()).toBe('requested')
    audio.dispose()
  })
  it.each(['interrupted', 'suspended', 'closed', 'unknown'])(
    'does not mark non-running %s ready',
    async (state) => {
      const fake = context(state)
      fake.ctx.resume.mockResolvedValue(undefined)
      const audio = createAlarmAudio({ createContext: fake.factory })
      expect(await audio.enableTest()).toBe('failed')
      expect(audio.readiness()).toBe('failed')
      expect(fake.oscillator.start).not.toHaveBeenCalled()
      audio.dispose()
    },
  )
  it.each(['createOscillator', 'start'])('recovers from %s cue failure', async (stage) => {
    const fake = context()
    const fail = stage === 'start' ? fake.oscillator.start : fake.ctx.createOscillator
    fail.mockImplementationOnce(() => {
      throw new Error('cue failed')
    })
    const audio = createAlarmAudio({ createContext: fake.factory })
    expect(await audio.enableTest()).toBe('failed')
    expect(audio.readiness()).toBe('failed')
    expect(await audio.enableTest()).toBe('requested')
    audio.dispose()
  })
  it('explicit retry recreates a closed context; automatic due attempt does not', async () => {
    const first = context()
    const second = context()
    const factory = vi.fn().mockReturnValueOnce(first.ctx).mockReturnValueOnce(second.ctx)
    const audio = createAlarmAudio({ createContext: factory })
    expect(await audio.enableTest()).toBe('requested')
    first.ctx.state = 'closed'
    expect(await audio.attemptCue()).toBe('failed')
    expect(factory).toHaveBeenCalledTimes(1)
    expect(await audio.enableTest()).toBe('requested')
    expect(factory).toHaveBeenCalledTimes(2)
    audio.dispose()
  })
  it('bounds pending resume, cancels late scheduling, allows retry and clears timers on disposal', async () => {
    vi.useFakeTimers()
    const fake = context('suspended')
    let resolve!: () => void
    fake.ctx.resume.mockImplementationOnce(
      () =>
        new Promise<void>((done) => {
          resolve = done
        }),
    )
    const audio = createAlarmAudio({ createContext: fake.factory })
    const pending = audio.enableTest()
    await vi.advanceTimersByTimeAsync(3000)
    expect(await pending).toBe('failed')
    resolve()
    await Promise.resolve()
    expect(fake.oscillator.start).not.toHaveBeenCalled()
    expect(await audio.enableTest()).toBe('requested')
    fake.ctx.state = 'suspended'
    fake.ctx.resume.mockImplementation(() => new Promise(() => {}))
    const disposed = audio.attemptCue()
    audio.dispose()
    expect(await disposed).toBe('failed')
    expect(vi.getTimerCount()).toBe(0)
    expect(await audio.enableTest()).toBe('failed')
  })
})
