import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from '../App.vue'

const localTime = (instant: Date) =>
  [instant.getHours(), instant.getMinutes(), instant.getSeconds()]
    .map((part) => String(part).padStart(2, '0'))
    .join(':')

afterEach(() => {
  vi.useRealTimers()
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
