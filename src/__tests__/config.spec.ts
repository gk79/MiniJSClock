import { describe, expect, it, vi } from 'vitest'

import { CONFIG_KEY, defaultConfig, loadConfig, parseConfig, saveConfig } from '../config'

const knownIds = new Set([1, 2])
const current = {
  version: 3 as const,
  selectedCityIds: [2, 1],
  presentationMode: 'analog' as const,
  timeFormat: '12h' as const,
  alarms: [
    { cityId: 2, recurrence: 'daily' as const, time: '08:15' },
    { cityId: 1, recurrence: 'once' as const, instant: '2026-01-15T13:00:00.000Z' },
  ],
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

  it('migrates exact V2 lazily preserving settings and order', () => {
    const legacy = {
      version: 2,
      selectedCityIds: [2, 1],
      presentationMode: 'analog',
      timeFormat: '12h',
    }
    const setItem = vi.fn()
    const storage = { getItem: () => JSON.stringify(legacy), setItem }
    expect(loadConfig(storage, knownIds)).toEqual({
      status: 'ok',
      config: { ...legacy, version: 3, alarms: [] },
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
    expect(raw).toBe(JSON.stringify(current))
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
    for (const version of [4, 99, Number.MAX_SAFE_INTEGER]) {
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

describe('exact alarm persistence boundary', () => {
  it.each(
    [
      null,
      {},
      [null],
      [{ cityId: 3, recurrence: 'daily', time: '08:00' }],
      [
        { cityId: 2, recurrence: 'daily', time: '08:00' },
        { cityId: 2, recurrence: 'once', instant: '2026-01-15T13:00:00.000Z' },
      ],
      ...['8:00', '24:00', '08:60', '08:00:00', null].map((time) => [
        { cityId: 2, recurrence: 'daily', time },
      ]),
      ...['2026-02-30T13:00:00.000Z', '2026-01-15T13:00:00Z', '2026-01-15T13:00:01.000Z', null].map(
        (instant) => [{ cityId: 1, recurrence: 'once', instant }],
      ),
      [{ cityId: '2', recurrence: 'daily', time: '08:00' }],
      [{ cityId: 2, recurrence: 'daily', time: '08:00', instant: '2026-01-15T13:00:00.000Z' }],
      [{ cityId: 2, recurrence: 'once', time: '08:00', instant: '2026-01-15T13:00:00.000Z' }],
      [{ cityId: 2, recurrence: 'weekly', time: '08:00' }],
      [{ cityId: 2, recurrence: 'once' }],
      [{ cityId: 2, recurrence: 'daily' }],
      [{ cityId: 2, recurrence: 'daily', time: '08:00', id: 10 }],
    ].map((alarms) => ({ alarms })),
  )('rejects invalid alarm collection $alarms', ({ alarms }) => {
    expect(parseConfig(JSON.stringify({ ...current, alarms }), knownIds)).toEqual({
      status: 'invalid',
      config: defaultConfig(),
    })
    const setItem = vi.fn()
    expect(saveConfig({ setItem }, { ...current, alarms } as never, knownIds)).toBe(false)
    expect(setItem).not.toHaveBeenCalled()
  })
  it('rejects an alarm on a known but unselected city', () => {
    expect(parseConfig(JSON.stringify({ ...current, selectedCityIds: [2] }), knownIds).status).toBe(
      'invalid',
    )
  })
  it('rejects missing alarms and extras in V3, and alarm fields in older schemas', () => {
    for (const value of [
      { version: 3, selectedCityIds: [], presentationMode: 'digital', timeFormat: '24h' },
      { ...current, extra: true },
      { version: 1, selectedCityIds: [], alarms: [] },
      { ...current, version: 2 },
    ])
      expect(parseConfig(JSON.stringify(value), knownIds).status).toBe('invalid')
  })
})
