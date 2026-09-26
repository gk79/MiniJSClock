import { describe, expect, it, vi } from 'vitest'

import { CONFIG_KEY, defaultConfig, loadConfig, parseConfig, saveConfig } from '../config'

const knownIds = new Set([1, 2])
const current = {
  version: 2 as const,
  selectedCityIds: [2, 1],
  presentationMode: 'analog' as const,
  timeFormat: '12h' as const,
}

describe('browser-local configuration', () => {
  it('migrates exact V1 in memory preserving order without writing storage', () => {
    const setItem = vi.fn()
    const storage = { getItem: () => '{"version":1,"selectedCityIds":[2,1]}', setItem }
    expect(loadConfig(storage, knownIds)).toEqual({
      status: 'ok',
      config: { ...defaultConfig(), selectedCityIds: [2, 1] },
    })
    expect(setItem).not.toHaveBeenCalled()
  })

  it('validates and round-trips the exact current document', () => {
    let raw = ''
    expect(
      saveConfig(
        {
          setItem: (key, value) => {
            expect(key).toBe(CONFIG_KEY)
            raw = value
          },
        },
        current,
        knownIds,
      ),
    ).toBe(true)
    expect(raw).toBe(
      '{"version":2,"selectedCityIds":[2,1],"presentationMode":"analog","timeFormat":"12h"}',
    )
    expect(parseConfig(raw, knownIds)).toEqual({ status: 'ok', config: current })
    expect(parseConfig(JSON.stringify(defaultConfig()), knownIds).status).toBe('ok')
  })

  it('rejects malformed V1/current schemas and safely recovers', () => {
    for (const value of [
      '{',
      '{}',
      ...[null, [1, 1], [3], ['1'], [1.5]].flatMap((selectedCityIds) => [
        JSON.stringify({ version: 1, selectedCityIds }),
        JSON.stringify({ ...current, selectedCityIds }),
      ]),
      JSON.stringify({ version: 1, selectedCityIds: [1], extra: true }),
      JSON.stringify({ ...current, extra: true }),
      JSON.stringify({ version: 2, selectedCityIds: [1] }),
      ...['bad', null, 12, false].flatMap((value) => [
        JSON.stringify({ ...current, presentationMode: value }),
        JSON.stringify({ ...current, timeFormat: value }),
      ]),
    ]) {
      expect(parseConfig(value, knownIds)).toEqual({ status: 'invalid', config: defaultConfig() })
    }
    const setItem = vi.fn()
    expect(saveConfig({ setItem }, { ...current, selectedCityIds: [1, 1] }, knownIds)).toBe(false)
    expect(setItem).not.toHaveBeenCalled()
  })

  it.each(
    ['2', '3', null, true, false, 0, -1, 2.5, 3.5, Number.MAX_SAFE_INTEGER + 1, [], {}].map(
      (version) => ({ version }),
    ),
  )('recovers malformed version discriminator $version as invalid', ({ version }) => {
    expect(parseConfig(JSON.stringify({ ...current, version }), knownIds)).toEqual({
      status: 'invalid',
      config: defaultConfig(),
    })
  })

  it('protects unsupported versions with safe defaults', () => {
    for (const version of [3, 99, Number.MAX_SAFE_INTEGER]) {
      expect(parseConfig(JSON.stringify({ ...current, version }), knownIds)).toEqual({
        status: 'unsupported',
        config: defaultConfig(),
      })
    }
  })

  it('handles absent storage, read exceptions and write failures', () => {
    expect(loadConfig({ getItem: () => null }, knownIds)).toEqual({
      status: 'ok',
      config: defaultConfig(),
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
    ).toEqual({ status: 'unavailable', config: defaultConfig() })
    expect(
      saveConfig(
        {
          setItem: () => {
            throw new Error('quota')
          },
        },
        current,
        knownIds,
      ),
    ).toBe(false)
  })
})
