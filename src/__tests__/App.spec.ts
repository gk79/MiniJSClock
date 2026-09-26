import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from '../App.vue'
import { CONFIG_KEY } from '../config'

const localTime = (instant: Date) =>
  [instant.getHours(), instant.getMinutes(), instant.getSeconds()]
    .map((part) => String(part).padStart(2, '0'))
    .join(':')

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('App', () => {
  it('shows local time on first launch and reads the current instant on each tick', async () => {
    vi.useFakeTimers()
    const initial = new Date('2026-01-15T12:34:56.000Z')
    vi.setSystemTime(initial)
    const wrapper = mount(App)

    expect(wrapper.get('main').attributes('aria-labelledby')).toBe('app-title')
    expect(wrapper.get('h1').text()).toBe('MiniJSClock')
    expect(wrapper.get('[data-testid="local-time"]').text()).toBe(localTime(initial))

    const jumped = new Date('2026-01-15T12:35:03.000Z')
    vi.setSystemTime(jumped)
    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.get('[data-testid="local-time"]').text()).toBe(
      localTime(new Date(jumped.getTime() + 1000)),
    )

    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('global clock settings', () => {
  it('migrates without eager writes and propagates both settings with one ticker', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:34:56Z'))
    const interval = vi.spyOn(globalThis, 'setInterval')
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
    const raw = '{"version":1,"selectedCityIds":[1850147,2643743]}'
    localStorage.setItem(CONFIG_KEY, raw)
    const wrapper = mount(App)
    await nextTick()
    expect(localStorage.getItem(CONFIG_KEY)).toBe(raw)
    expect(
      wrapper.findAll('[data-city-id]').map((card) => card.attributes('data-city-id')),
    ).toEqual(['1850147', '2643743'])
    expect(interval).toHaveBeenCalledTimes(1)
    expect(interval).toHaveBeenCalledWith(expect.any(Function), 1000)
    await wrapper.get('#time-format').setValue('12h')
    expect(wrapper.get('[data-testid="city-time-1850147"]').text()).toBe('09:34:56 PM')
    expect(wrapper.get('[data-testid="city-time-2643743"]').text()).toBe('12:34:56 PM')
    expect(wrapper.get('[data-testid="local-time"]').text()).toMatch(/ (AM|PM)$/)
    await wrapper.get('#presentation-mode').setValue('analog')
    expect(wrapper.findAll('.clock-face')).toHaveLength(3)
    const positions = wrapper.findAll('.hour-hand').map((hand) => hand.attributes('transform'))
    await wrapper.get('#time-format').setValue('24h')
    expect(wrapper.findAll('.hour-hand').map((hand) => hand.attributes('transform'))).toEqual(
      positions,
    )
    await wrapper.get('#time-format').setValue('12h')
    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.findAll('.second-hand').map((hand) => hand.attributes('transform'))).toEqual(
      Array(3).fill('rotate(342 50 50)'),
    )
    expect(wrapper.get('[data-testid="city-time-1850147"]').text()).toBe('09:34:57 PM')
    await wrapper.get('#presentation-mode').setValue('digital')
    expect(wrapper.findAll('.clock-face')).toHaveLength(0)
    expect(wrapper.get('[data-testid="city-time-1850147"]').text()).toBe('09:34:57 PM')
    expect(JSON.parse(localStorage.getItem(CONFIG_KEY)!)).toEqual({
      version: 3,
      selectedCityIds: [1850147, 2643743],
      presentationMode: 'digital',
      timeFormat: '12h',
      alarms: [],
    })
    wrapper.unmount()
    expect(clearIntervalSpy).toHaveBeenCalledWith(interval.mock.results[0]?.value)
    const restored = mount(App)
    await nextTick()
    expect(restored.get('#time-format').element).toHaveProperty('value', '12h')
    expect(restored.findAll('[data-city-id]')).toHaveLength(2)
    restored.unmount()
  })

  it.each([4, 99])(
    'protects future version %i through settings and city changes',
    async (version) => {
      const raw = JSON.stringify({ version, selectedCityIds: [1850147], future: true })
      localStorage.setItem(CONFIG_KEY, raw)
      const wrapper = mount(App)
      await wrapper.get('#presentation-mode').setValue('analog')
      await wrapper.get('#time-format').setValue('12h')
      await wrapper.get('#city-search').setValue('Tokyo')
      await wrapper.get('#city-option-1850147').trigger('click')
      expect(wrapper.findAll('[data-city-id]')).toHaveLength(1)
      await wrapper.get('button').trigger('click')
      expect(wrapper.findAll('[data-city-id]')).toHaveLength(0)
      expect(localStorage.getItem(CONFIG_KEY)).toBe(raw)
      expect(wrapper.get('[role="status"]').text()).toContain('unsupported version')
      wrapper.unmount()
    },
  )

  it('keeps settings usable when localStorage access is unavailable', async () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('blocked')
    })
    const wrapper = mount(App)
    await wrapper.get('#presentation-mode').setValue('analog')
    await wrapper.get('#time-format').setValue('12h')
    expect(wrapper.findAll('.clock-face')).toHaveLength(1)
    expect(wrapper.get('[role="status"]').text()).toContain('storage is unavailable')
    wrapper.unmount()
  })
})
