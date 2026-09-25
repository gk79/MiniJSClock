import { describe, expect, it, vi } from 'vitest'

import { CONFIG_KEY, loadConfig, parseConfig, saveConfig } from '../config'

const knownIds = new Set([1, 2])

describe('browser-local configuration', () => {
  it('accepts only ordered, unique catalog IDs in the exact v1 document', () => {
    expect(parseConfig('{"version":1,"selectedCityIds":[2,1]}', knownIds)).toEqual({
      status: 'ok',
      config: { version: 1, selectedCityIds: [2, 1] },
    })
    for (const value of [
      '{',
      '{}',
      '{"version":1,"selectedCityIds":null}',
      '{"version":1,"selectedCityIds":[1,1]}',
      '{"version":1,"selectedCityIds":[3]}',
      '{"version":1,"selectedCityIds":["1"]}',
      '{"version":1,"selectedCityIds":[1],"extra":true}',
    ]) {
      expect(parseConfig(value, knownIds)).toEqual({
        status: 'invalid',
        config: { version: 1, selectedCityIds: [] },
      })
    }
    expect(parseConfig('{"version":2,"selectedCityIds":[1]}', knownIds)).toEqual({
      status: 'unsupported',
      config: { version: 1, selectedCityIds: [] },
    })
  })

  it('starts empty when no document exists and recovers from read exceptions', () => {
    expect(loadConfig({ getItem: () => null }, knownIds)).toEqual({
      status: 'ok',
      config: { version: 1, selectedCityIds: [] },
    })
    expect(
      loadConfig(
        {
          getItem: () => {
            throw new Error('blocked')
          },
        },
        knownIds,
      ),
    ).toEqual({
      status: 'unavailable',
      config: { version: 1, selectedCityIds: [] },
    })
  })

  it('writes one validated document and reports write failures', () => {
    const setItem = vi.fn()
    expect(saveConfig({ setItem }, { version: 1, selectedCityIds: [2, 1] }, knownIds)).toBe(true)
    expect(setItem).toHaveBeenCalledWith(CONFIG_KEY, '{"version":1,"selectedCityIds":[2,1]}')
    expect(saveConfig({ setItem }, { version: 1, selectedCityIds: [1, 1] }, knownIds)).toBe(false)
    expect(setItem).toHaveBeenCalledTimes(1)
    expect(
      saveConfig(
        {
          setItem: () => {
            throw new Error('quota')
          },
        },
        { version: 1, selectedCityIds: [1] },
        knownIds,
      ),
    ).toBe(false)
  })
})
