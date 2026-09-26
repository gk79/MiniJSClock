import { expect, test, type Page } from '@playwright/test'

const key = 'minijsclock.config'
const tokyo = 1850147
const ny = 5128581
const card = (page: Page, id = tokyo) => page.locator(`[data-city-id="${id}"]`)
const configuration = (page: Page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key)

async function addCity(page: Page, query = 'Tokyo', label = 'Tokyo (JP)') {
  await page.getByRole('combobox', { name: 'Add a city' }).fill(query)
  await page.getByRole('option', { name: label, exact: true }).click()
}
async function daily(page: Page, time: string, button = 'Set alarm') {
  const city = card(page)
  await city.getByRole('button', { name: button, exact: true }).click()
  await city.getByLabel('Recurrence', { exact: true }).selectOption('daily')
  await city.getByLabel('Local time', { exact: true }).fill(time)
  await city.getByRole('button', { name: 'Save', exact: true }).click()
}

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-15T12:34:56.000Z') })
  await page.clock.pauseAt(new Date('2026-01-15T12:34:56.000Z'))
  await page.goto('./')
})

test('configures, edits, reloads, replaces and removes city-local alarms under the production base path', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') errors.push(message.text())
  })
  await addCity(page)
  await daily(page, '08:15')
  await expect(card(page).locator('.alarm-summary')).toHaveText('Daily at 08:15 · Asia/Tokyo')
  await page.getByLabel('Digital time format', { exact: true }).selectOption('12h')
  await page.getByLabel('Presentation', { exact: true }).selectOption('analog')
  await expect(page.locator('.clock-face')).toHaveCount(2)
  await daily(page, '09:20', 'Edit alarm')
  await page.reload()
  await expect(card(page).locator('.alarm-summary')).toHaveText('Daily at 09:20 · Asia/Tokyo')
  await expect(page.getByLabel('Presentation', { exact: true })).toHaveValue('analog')
  await expect(page.getByLabel('Digital time format', { exact: true })).toHaveValue('12h')
  await card(page).getByRole('button', { name: 'Edit alarm', exact: true }).click()
  await expect(card(page).getByLabel('Recurrence', { exact: true })).toBeFocused()
  await card(page).getByLabel('Recurrence', { exact: true }).selectOption('once')
  await card(page).getByLabel('Local date', { exact: true }).fill('2026-01-16')
  await card(page).getByLabel('Local time', { exact: true }).fill('08:00')
  await card(page).getByRole('button', { name: 'Save', exact: true }).click()
  await expect(card(page).locator('.alarm-summary')).toHaveText(
    'One-time 2026-01-16 at 08:00 · Asia/Tokyo (23:00 UTC)',
  )
  await expect(card(page).getByRole('button', { name: 'Edit alarm', exact: true })).toBeFocused()
  expect((await configuration(page)).alarms).toEqual([
    { cityId: tokyo, recurrence: 'once', instant: '2026-01-15T23:00:00.000Z' },
  ])
  await page.reload()
  await expect(card(page).locator('.alarm-summary')).toContainText('2026-01-16 at 08:00')
  await page.screenshot({ path: testInfo.outputPath('alarm-summary-desktop.png'), fullPage: true })
  await card(page).getByRole('button', { name: 'Edit alarm', exact: true }).click()
  await card(page).getByRole('button', { name: 'Cancel', exact: true }).click()
  expect((await configuration(page)).alarms).toHaveLength(1)
  await card(page).getByRole('button', { name: 'Remove alarm', exact: true }).click()
  expect((await configuration(page)).alarms).toEqual([])
  await page.reload()
  await expect(card(page).getByRole('button', { name: 'Set alarm', exact: true })).toBeVisible()
  expect(errors).toEqual([])
})

test('removes attached alarm with city and does not resurrect it on re-add', async ({ page }) => {
  await addCity(page)
  await daily(page, '08:00')
  await addCity(page, 'London', 'London (GB)')
  await page.getByRole('button', { name: 'Remove Tokyo', exact: true }).click()
  expect((await configuration(page)).alarms).toEqual([])
  expect((await configuration(page)).selectedCityIds).toEqual([2643743])
  await page.reload()
  await addCity(page)
  await expect(card(page).getByRole('button', { name: 'Set alarm', exact: true })).toBeVisible()
  await expect(card(page).locator('.alarm-summary')).toHaveCount(0)
  expect((await configuration(page)).selectedCityIds).toEqual([2643743, tokyo])
  await page.reload()
  expect((await configuration(page)).alarms).toEqual([])
})

test('rejects invalid, past and nonexistent local minutes with visible feedback', async ({
  page,
}, testInfo) => {
  await addCity(page, 'New York', 'New York City (US)')
  const city = card(page, ny)
  await city.getByRole('button', { name: 'Set alarm', exact: true }).click()
  await city.getByLabel('Local date', { exact: true }).fill('')
  await city.getByLabel('Local time', { exact: true }).fill('')
  await city.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(city.getByRole('alert')).toContainText('valid local date and time')
  await city.getByLabel('Local date', { exact: true }).fill('2026-01-15')
  await city.getByLabel('Local time', { exact: true }).fill('07:00')
  await city.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(city.getByRole('alert')).toContainText('past')
  await city.getByLabel('Local date', { exact: true }).fill('2026-03-08')
  await city.getByLabel('Local time', { exact: true }).fill('02:30')
  await city.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(city.getByRole('alert')).toContainText('does not exist')
  await expect(city.getByLabel('Local time', { exact: true })).toHaveAttribute(
    'aria-invalid',
    'true',
  )
  expect((await configuration(page)).alarms).toEqual([])
  await page.screenshot({
    path: testInfo.outputPath('alarm-editor-error-desktop.png'),
    fullPage: true,
  })
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(city.getByRole('button', { name: 'Save', exact: true })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  await page.setViewportSize({ width: 320, height: 900 })
  await page.screenshot({
    path: testInfo.outputPath('alarm-editor-error-narrow.png'),
    fullPage: true,
  })
})

test('protects future documents through every alarm mutation', async ({ page }) => {
  const raw = '{"version":4,"future":true}'
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key, raw })
  await page.reload()
  await addCity(page)
  await daily(page, '08:00')
  await daily(page, '09:00', 'Edit alarm')
  await card(page).getByRole('button', { name: 'Remove alarm', exact: true }).click()
  await page.getByLabel('Presentation', { exact: true }).selectOption('analog')
  await page.getByLabel('Digital time format', { exact: true }).selectOption('12h')
  await page.getByRole('button', { name: 'Remove Tokyo', exact: true }).click()
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(raw)
  await expect(page.getByRole('status')).toContainText('unsupported version')
})

test('restores an ambiguous once alarm as its exact persisted second occurrence', async ({
  page,
}) => {
  const instant = '2026-11-01T06:30:00.000Z'
  await page.evaluate(
    ({ key, ny, instant }) =>
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 3,
          selectedCityIds: [ny],
          presentationMode: 'digital',
          timeFormat: '24h',
          alarms: [{ cityId: ny, recurrence: 'once', instant }],
        }),
      ),
    { key, ny, instant },
  )
  await page.reload()
  await expect(card(page, ny).locator('.alarm-summary')).toHaveText(
    'One-time 2026-11-01 at 01:30 · America/New_York (06:30 UTC)',
  )
  await page.getByLabel('Digital time format', { exact: true }).selectOption('12h')
  expect((await configuration(page)).alarms[0].instant).toBe(instant)
})
