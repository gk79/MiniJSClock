import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App.vue'
import { CONFIG_KEY, defaultConfig } from '../config'
import type { Alarm } from '../alarms'

const tokyo = 1850147
const london = 2643743
const start = new Date('2026-01-15T12:00:00Z')
const once: Alarm = { cityId: tokyo, recurrence: 'once', instant: '2026-01-15T12:01:00.000Z' }
const daily: Alarm = { cityId: london, recurrence: 'daily', time: '12:01' }
let wrapper: VueWrapper | undefined
const store = (alarms: Alarm[]) =>
  localStorage.setItem(
    CONFIG_KEY,
    JSON.stringify({ ...defaultConfig(), selectedCityIds: [tokyo, london], alarms }),
  )
const notices = () => wrapper!.findAll('.due-notification')
const sound = () => wrapper!.get('.alarm-sound button')

function nativeFake() {
  return {
    state: 'running',
    currentTime: 0,
    destination: {},
    resume: vi.fn(async () => {}),
    close: vi.fn(async () => {}),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    createOscillator: () => ({
      frequency: { value: 0 },
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }),
    createGain: () => ({
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
    }),
  }
}
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(start)
  vi.stubGlobal('AudioContext', undefined)
  store([])
})
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe('alarm runtime presentation and persistence', () => {
  it('enables/tests real adapter path, reports ready and allows retry after unavailable', async () => {
    wrapper = mount(App)
    expect(wrapper.get('.sound-status').text()).toContain('needs interaction')
    await sound().trigger('click')
    expect(wrapper.get('.sound-status').text()).toContain('unavailable or blocked')
    const fake = nativeFake()
    vi.stubGlobal('AudioContext', function () {
      return fake
    })
    await sound().trigger('click')
    expect(wrapper.get('.sound-status').text()).toContain('ready')
    expect(sound().attributes('disabled')).toBeUndefined()
    wrapper.unmount()
    expect(fake.close).toHaveBeenCalledTimes(1)
  })
  it('preserves simultaneous due events, consumes once, retains daily on dismissal, snapshots removed cities', async () => {
    store([once, daily])
    wrapper = mount(App)
    await vi.advanceTimersByTimeAsync(60_000)
    expect(notices()).toHaveLength(2)
    expect(notices()[0]!.text()).toContain('Tokyo — Alarm due')
    expect(notices()[1]!.text()).toContain('London — Alarm due')
    expect(notices()[0]!.text()).toContain('Sound unavailable or blocked')
    expect(JSON.parse(localStorage.getItem(CONFIG_KEY)!).alarms).toEqual([daily])
    expect(wrapper.get('.alarm-notifications').attributes('aria-live')).toBe('polite')
    await wrapper.get('[aria-label="Remove Tokyo"]').trigger('click')
    expect(notices()[0]!.text()).toContain('Tokyo')
    await notices()[1]!.get('button').trigger('click')
    expect(notices()).toHaveLength(1)
    expect(wrapper.get('.alarm-summary').text()).toContain('Daily at 12:01')
    expect(JSON.parse(localStorage.getItem(CONFIG_KEY)!).alarms).toEqual([daily])
    await notices()[0]!.get('button').trigger('click')
    await vi.advanceTimersByTimeAsync(1000)
    expect(notices()).toHaveLength(0)
    wrapper.unmount()
    wrapper = mount(App)
    await nextTick()
    expect(notices()).toHaveLength(0)
    expect(wrapper.get('.sound-status').text()).toContain('needs interaction')
  })
  it('removes stale once at startup in one write without delivery; no writes for future/daily', async () => {
    store([{ ...once, instant: start.toISOString() }, daily])
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    wrapper = mount(App)
    expect(writes).toHaveBeenCalledTimes(1)
    expect(notices()).toHaveLength(0)
    expect(JSON.parse(localStorage.getItem(CONFIG_KEY)!).alarms).toEqual([daily])
    wrapper.unmount()
    store([once, daily])
    writes.mockClear()
    wrapper = mount(App)
    await nextTick()
    expect(writes).not.toHaveBeenCalled()
  })
  it.each([1, 2])('does not eagerly write migrated V%i at startup or ticks', async (version) => {
    const raw = JSON.stringify(
      version === 1
        ? { version, selectedCityIds: [tokyo] }
        : { version, selectedCityIds: [tokyo], presentationMode: 'digital', timeFormat: '24h' },
    )
    localStorage.setItem(CONFIG_KEY, raw)
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    wrapper = mount(App)
    await vi.advanceTimersByTimeAsync(2000)
    expect(writes).not.toHaveBeenCalled()
    expect(localStorage.getItem(CONFIG_KEY)).toBe(raw)
  })
  it('keeps consumed session state after failed persistence and treats old bytes as stale on reload', async () => {
    store([once])
    wrapper = mount(App)
    const writes = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    await vi.advanceTimersByTimeAsync(60_000)
    expect(wrapper.get('.storage-warning').text()).toContain('saving failed')
    expect(wrapper.find('.alarm-summary').exists()).toBe(false)
    expect(notices()).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(2000)
    expect(notices()).toHaveLength(1)
    expect(writes).toHaveBeenCalledTimes(1)
    wrapper.unmount()
    wrapper = mount(App)
    await nextTick()
    expect(notices()).toHaveLength(0)
    expect(wrapper.find('.alarm-summary').exists()).toBe(false)
    expect(writes).toHaveBeenCalledTimes(2)
  })
  it('preserves future storage bytes even through runtime once consumption', async () => {
    const raw = '{"version":99,"future":true}'
    localStorage.setItem(CONFIG_KEY, raw)
    wrapper = mount(App)
    await wrapper.get('#city-search').setValue('Tokyo')
    await wrapper.get(`#city-option-${tokyo}`).trigger('click')
    await wrapper.get('.alarm-toggle').trigger('click')
    await wrapper.get(`#alarm-date-${tokyo}`).setValue('2026-01-15')
    await wrapper.get(`#alarm-time-${tokyo}`).setValue('21:01')
    await wrapper.get('.alarm-editor form').trigger('submit')
    await vi.advanceTimersByTimeAsync(60_000)
    expect(notices()).toHaveLength(1)
    expect(wrapper.find('.alarm-summary').exists()).toBe(false)
    expect(localStorage.getItem(CONFIG_KEY)).toBe(raw)
    expect(wrapper.get('.storage-warning').text()).toContain('unsupported')
  })
  it('visible opportunity evaluates actual time without tick, hidden does not; cleans up listener/timer', async () => {
    store([once])
    const intervals = vi.spyOn(globalThis, 'setInterval')
    const cleared = vi.spyOn(globalThis, 'clearInterval')
    const added = vi.spyOn(document, 'addEventListener')
    const removed = vi.spyOn(document, 'removeEventListener')
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    wrapper = mount(App)
    vi.setSystemTime(new Date('2026-01-15T12:02:00Z'))
    document.dispatchEvent(new Event('visibilitychange'))
    await nextTick()
    expect(notices()).toHaveLength(0)
    visibility.mockReturnValue('visible')
    document.dispatchEvent(new Event('visibilitychange'))
    await Promise.resolve()
    await nextTick()
    expect(notices()).toHaveLength(1)
    document.dispatchEvent(new Event('visibilitychange'))
    await nextTick()
    expect(notices()).toHaveLength(1)
    const listener = added.mock.calls.find(([name]) => name === 'visibilitychange')![1]
    wrapper.unmount()
    expect(removed).toHaveBeenCalledWith('visibilitychange', listener)
    expect(intervals).toHaveBeenCalledTimes(1)
    expect(cleared).toHaveBeenCalledWith(intervals.mock.results[0]!.value)
    // jsdom queues zero-delay storage events for setItem; drain those host callbacks.
    await vi.advanceTimersByTimeAsync(0)
    expect(vi.getTimerCount()).toBe(0)
  })
})
