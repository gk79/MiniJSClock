import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from '../App.vue'
import { CONFIG_KEY, defaultConfig } from '../config'

const tokyo = 1850147
const ny = 5128581
let wrapper: VueWrapper
const stored = () => JSON.parse(localStorage.getItem(CONFIG_KEY)!)
const save = async () => wrapper.get('.alarm-editor form').trigger('submit')
const edit = async () => {
  await nextTick()
  await wrapper.get('.alarm-editor .alarm-toggle').trigger('click')
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-01-15T12:34:56.000Z'))
  localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...defaultConfig(), selectedCityIds: [tokyo] }))
})
afterEach(() => {
  wrapper?.unmount()
  vi.useRealTimers()
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('world-city alarm configuration', () => {
  it('creates, edits, reloads, replaces and removes one attached alarm', async () => {
    wrapper = mount(App)
    await edit()
    await wrapper.get(`#alarm-recurrence-${tokyo}`).setValue('daily')
    await wrapper.get(`#alarm-time-${tokyo}`).setValue('08:15')
    await save()
    expect(wrapper.get('.alarm-summary').text()).toContain('Daily at 08:15')
    expect(wrapper.get('.alarm-summary').text()).toContain('Asia/Tokyo')
    expect(stored().alarms).toEqual([{ cityId: tokyo, recurrence: 'daily', time: '08:15' }])
    await wrapper.get('#time-format').setValue('12h')
    expect(stored().alarms[0].time).toBe('08:15')
    await edit()
    await wrapper.get(`#alarm-time-${tokyo}`).setValue('09:20')
    await save()
    wrapper.unmount()
    wrapper = mount(App)
    await nextTick()
    expect(wrapper.get('.alarm-summary').text()).toContain('09:20')
    await edit()
    await wrapper.get(`#alarm-recurrence-${tokyo}`).setValue('once')
    await wrapper.get(`#alarm-date-${tokyo}`).setValue('2026-01-16')
    await wrapper.get(`#alarm-time-${tokyo}`).setValue('08:00')
    await save()
    expect(stored().alarms).toEqual([
      { cityId: tokyo, recurrence: 'once', instant: '2026-01-15T23:00:00.000Z' },
    ])
    await wrapper.get('.alarm-remove').trigger('click')
    expect(stored().alarms).toEqual([])
    expect(wrapper.get('.alarm-toggle').text()).toBe('Set alarm')
  })

  it('atomically removes a city and its alarm in one write; re-add does not resurrect it', async () => {
    wrapper = mount(App)
    await edit()
    await wrapper.get(`#alarm-recurrence-${tokyo}`).setValue('daily')
    await wrapper.get(`#alarm-time-${tokyo}`).setValue('08:00')
    await save()
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    await wrapper.get('[aria-label="Remove Tokyo"]').trigger('click')
    expect(writes).toHaveBeenCalledTimes(1)
    expect(stored().selectedCityIds).toEqual([])
    expect(stored().alarms).toEqual([])
    await wrapper.get('#city-search').setValue('Tokyo')
    await wrapper.get(`#city-option-${tokyo}`).trigger('click')
    expect(stored().alarms).toEqual([])
    expect(wrapper.find('.alarm-summary').exists()).toBe(false)
  })

  it.each([4, 99])(
    'protects future version %i through alarm create/edit/remove and city/settings changes',
    async (version) => {
      const raw = JSON.stringify({ version, future: true })
      localStorage.setItem(CONFIG_KEY, raw)
      wrapper = mount(App)
      await wrapper.get('#city-search').setValue('Tokyo')
      await wrapper.get(`#city-option-${tokyo}`).trigger('click')
      await edit()
      await wrapper.get(`#alarm-recurrence-${tokyo}`).setValue('daily')
      await wrapper.get(`#alarm-time-${tokyo}`).setValue('08:00')
      await save()
      await edit()
      await wrapper.get(`#alarm-time-${tokyo}`).setValue('09:00')
      await save()
      await wrapper.get('.alarm-remove').trigger('click')
      await wrapper.get('#time-format').setValue('12h')
      await wrapper.get('#presentation-mode').setValue('analog')
      await wrapper.get('[aria-label="Remove Tokyo"]').trigger('click')
      expect(localStorage.getItem(CONFIG_KEY)).toBe(raw)
      expect(wrapper.get('[role="status"]').text()).toContain('unsupported')
    },
  )

  it.each([
    ['2026-01-15', '07:00', 'past'],
    ['2026-03-08', '02:30', 'does not exist'],
    ['', '', 'valid'],
  ])('shows usable feedback for %s %s', async (day, time, feedback) => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...defaultConfig(), selectedCityIds: [ny] }))
    wrapper = mount(App)
    await edit()
    await wrapper.get(`#alarm-date-${ny}`).setValue(day)
    await wrapper.get(`#alarm-time-${ny}`).setValue(time)
    await save()
    expect(wrapper.get('[role="alert"]').text()).toContain(feedback)
    expect(wrapper.get(`#alarm-time-${ny}`).attributes('aria-invalid')).toBe('true')
    expect(stored().alarms).toEqual([])
  })

  it('lazily migrates V2 on an alarm mutation and never writes while opening or cancelling an editor', async () => {
    const raw = JSON.stringify({
      version: 2,
      selectedCityIds: [tokyo],
      presentationMode: 'analog',
      timeFormat: '12h',
    })
    localStorage.setItem(CONFIG_KEY, raw)
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    wrapper = mount(App)
    await edit()
    expect(writes).not.toHaveBeenCalled()
    expect(localStorage.getItem(CONFIG_KEY)).toBe(raw)
    await wrapper.get('.alarm-editor form button[type="button"]').trigger('click')
    await edit()
    await wrapper.get(`#alarm-recurrence-${tokyo}`).setValue('daily')
    await wrapper.get(`#alarm-time-${tokyo}`).setValue('08:00')
    await save()
    expect(stored()).toEqual({
      version: 3,
      selectedCityIds: [tokyo],
      presentationMode: 'analog',
      timeFormat: '12h',
      alarms: [{ cityId: tokyo, recurrence: 'daily', time: '08:00' }],
    })
  })

  it('rejects empty daily input without changing the saved alarm', async () => {
    wrapper = mount(App)
    await edit()
    await wrapper.get(`#alarm-recurrence-${tokyo}`).setValue('daily')
    await wrapper.get(`#alarm-time-${tokyo}`).setValue('')
    await save()
    expect(wrapper.get('[role="alert"]').text()).toContain('valid local time')
    expect(stored().alarms).toEqual([])
  })

  it('uses actual Save time rather than the last displayed ticker instant', async () => {
    wrapper = mount(App)
    await edit()
    await wrapper.get(`#alarm-date-${tokyo}`).setValue('2026-01-15')
    await wrapper.get(`#alarm-time-${tokyo}`).setValue('21:35')
    vi.setSystemTime(new Date('2026-01-15T12:35:00.000Z'))
    await save()
    expect(wrapper.get('[role="alert"]').text()).toContain('past')
  })

  it.each(['unavailable', 'write-failed'])(
    'keeps alarm controls usable with %s storage',
    async (status) => {
      wrapper = mount(App)
      if (status === 'unavailable') {
        wrapper.unmount()
        vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
          throw new Error('blocked')
        })
        wrapper = mount(App)
        await wrapper.get('#city-search').setValue('Tokyo')
        await wrapper.get(`#city-option-${tokyo}`).trigger('click')
      } else
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
          throw new Error('quota')
        })
      await edit()
      await wrapper.get(`#alarm-recurrence-${tokyo}`).setValue('daily')
      await wrapper.get(`#alarm-time-${tokyo}`).setValue('08:00')
      await save()
      expect(wrapper.get('.alarm-summary').text()).toContain('08:00')
      expect(wrapper.get('[role="status"]').text()).toContain(
        status === 'unavailable' ? 'storage is unavailable' : 'saving failed',
      )
      await wrapper.get('.alarm-remove').trigger('click')
      expect(wrapper.find('.alarm-summary').exists()).toBe(false)
    },
  )
})
