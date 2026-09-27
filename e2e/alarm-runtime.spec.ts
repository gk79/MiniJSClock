import { expect, test, type Page } from '@playwright/test'

const key = 'minijsclock.config'
const tokyo = 1850147
const london = 2643743
const start = new Date('2026-01-15T12:00:00.000Z')
const once = { cityId: tokyo, recurrence: 'once', instant: '2026-01-15T12:01:00.000Z' }
const daily = { cityId: london, recurrence: 'daily', time: '12:01' }
const notices = (page: Page) => page.locator('.due-notification')
const config = (page: Page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key)

async function seed(page: Page, alarms = [once, daily]) {
  await page.addInitScript(
    ({ key, alarms, tokyo, london }) => {
      // Seed only the initial document: reload must inspect app-written bytes.
      if (localStorage.getItem(key) === null)
        localStorage.setItem(
          key,
          JSON.stringify({
            version: 3,
            selectedCityIds: [...new Set([tokyo, london, ...alarms.map((alarm) => alarm.cityId)])],
            presentationMode: 'digital',
            timeFormat: '24h',
            alarms,
          }),
        )
    },
    { key, alarms, tokyo, london },
  )
}
async function unavailable(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: undefined })
  })
}

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: start })
  await page.clock.pauseAt(start)
})

test('native Chromium gesture/cues: once consumption, daily retention, no replay and keyboard dismissal', async ({
  page,
  browser,
}, testInfo) => {
  testInfo.annotations.push({
    type: 'audio evidence',
    description: `Real native Web Audio in headless Chromium ${browser.version()}; no audio constructor injection; speaker audibility is unverified.`,
  })
  await seed(page)
  await page.goto('./')
  expect(await page.evaluate(() => typeof AudioContext)).toBe('function')
  await expect(page.locator('.sound-status')).toContainText('needs interaction')
  await page.getByRole('button', { name: 'Enable / test alarm sound', exact: true }).click()
  await expect(page.locator('.sound-status')).toContainText('Alarm sound ready')
  await page.clock.runFor(60_000)
  await expect(notices(page)).toHaveCount(2)
  await expect(notices(page).nth(0)).toContainText('Tokyo — Alarm due')
  await expect(notices(page).nth(1)).toContainText('London — Alarm due')
  await expect(notices(page).nth(0)).toContainText('Sound request succeeded')
  await expect(notices(page).nth(1)).toContainText('Sound request succeeded')
  expect((await config(page)).alarms).toEqual([daily])
  await expect(page.locator(`[data-city-id="${tokyo}"] .alarm-summary`)).toHaveCount(0)
  await page.clock.runFor(2000)
  await expect(notices(page)).toHaveCount(2)
  await page.screenshot({ path: testInfo.outputPath('native-due-desktop.png'), fullPage: true })
  const dismissDaily = notices(page)
    .nth(1)
    .getByRole('button', { name: /^Dismiss London/ })
  await dismissDaily.focus()
  await expect(dismissDaily).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(notices(page)).toHaveCount(1)
  expect((await config(page)).alarms).toEqual([daily])
  await page.reload()
  await expect(notices(page)).toHaveCount(0)
  await expect(page.locator('.sound-status')).toContainText('needs interaction')
  expect((await config(page)).alarms).toEqual([daily])
})

test('controlled unavailable Web Audio: delayed fastForward preserves simultaneous due events and daily latest only', async ({
  page,
}, testInfo) => {
  testInfo.annotations.push({
    type: 'audio evidence',
    description:
      'Injected unavailable constructor; synthetic delayed scheduling, not physical audio/background policy evidence.',
  })
  await seed(page)
  await unavailable(page)
  await page.goto('./')
  await page.getByRole('button', { name: 'Enable / test alarm sound', exact: true }).click()
  await expect(page.locator('.sound-status')).toContainText('unavailable or blocked')
  await page.clock.fastForward(3 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000)
  await expect(notices(page)).toHaveCount(2)
  await expect(notices(page).nth(0)).toContainText('2026-01-15T12:01:00.000Z')
  await expect(notices(page).nth(1)).toContainText('2026-01-18T12:01:00.000Z')
  await expect(notices(page).nth(0)).toContainText('Sound unavailable or blocked')
  await expect(notices(page).nth(1)).toContainText('Sound unavailable or blocked')
  expect((await config(page)).alarms).toEqual([daily])
  await page.clock.runFor(1000)
  await expect(notices(page)).toHaveCount(2)
  await page.setViewportSize({ width: 320, height: 900 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('unavailable-due-narrow.png'), fullPage: true })
})

test('explicit visible opportunity evaluates actual elapsed time without running timers', async ({
  page,
}, testInfo) => {
  testInfo.annotations.push({
    type: 'foreground evidence',
    description:
      'Synthetic visibilitychange and visibilityState; actual browser background throttling remains a human gate.',
  })
  await seed(page, [once])
  await unavailable(page)
  await page.goto('./')
  await page.clock.setSystemTime(new Date('2026-01-15T12:02:00Z'))
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(notices(page)).toHaveCount(0)
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(notices(page)).toHaveCount(1)
  expect((await config(page)).alarms).toEqual([])
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
  await page.clock.runFor(1000)
  await expect(notices(page)).toHaveCount(1)
})

test('startup discards stale once without delivery while retaining future once and daily', async ({
  page,
}) => {
  await seed(page, [
    { ...once, instant: start.toISOString() },
    { ...once, cityId: london },
    { ...daily, cityId: 5128581 },
  ])
  await unavailable(page)
  await page.goto('./')
  await expect(notices(page)).toHaveCount(0)
  expect((await config(page)).alarms).toEqual([
    { ...once, cityId: london },
    { ...daily, cityId: 5128581 },
  ])
  await page.clock.runFor(60_000)
  await expect(notices(page)).toHaveCount(1)
  await expect(notices(page)).toContainText('London — Alarm due')
})
