import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import App from '../App.vue'

describe('App', () => {
  it('renders the minimal application shell', () => {
    const wrapper = mount(App)

    expect(wrapper.get('main').attributes('aria-labelledby')).toBe('app-title')
    expect(wrapper.get('h1').text()).toBe('MiniJSClock')
    expect(wrapper.text()).toContain('Application shell is ready.')
  })
})
