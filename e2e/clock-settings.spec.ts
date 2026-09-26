import { expect, test } from '@playwright/test'

const key = 'minijsclock.config'
const v1 = '{"version":1,"selectedCityIds":[1850147,2643743]}'

test('migrates lazily, propagates settings, moves analog hands and restores settings after reload', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.clock.install({ time: new Date('2026-01-15T11:34:56Z') })
  await page.clock.pauseAt(new Date('2026-01-15T12:34:56Z'))
  await page.goto('./')
  await page.evaluate(({ key, v1 }) => localStorage.setItem(key, v1), { key, v1 })
  await page.reload()
  await expect(page.locator('[data-city-id]')).toHaveCount(2)
  await expect(page.locator('[data-city-id]').first()).toHaveAttribute('data-city-id', '1850147')
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(v1)
  const presentation = page.getByLabel('Presentation', { exact: true })
  const format = page.getByLabel('Digital time format', { exact: true })
  await expect(presentation).toHaveValue('digital')
  await expect(format).toHaveValue('24h')
  await format.selectOption('12h')
  await expect(page.getByTestId('city-time-1850147')).toHaveText('09:34:56 PM')
  await expect(page.getByTestId('city-time-2643743')).toHaveText('12:34:56 PM')
  await expect(page.getByTestId('local-time')).toHaveText(/ (AM|PM)$/)
  await presentation.selectOption('analog')
  await expect(page.locator('.clock-face')).toHaveCount(3)
  await expect(page.locator('[data-city-id="1850147"] .hour-hand')).toHaveAttribute(
    'transform',
    /rotate\(287\.466/,
  )
  const positions = await page
    .locator('.hour-hand')
    .evaluateAll((hands) => hands.map((hand) => hand.getAttribute('transform')))
  await format.selectOption('24h')
  expect(
    await page
      .locator('.hour-hand')
      .evaluateAll((hands) => hands.map((hand) => hand.getAttribute('transform'))),
  ).toEqual(positions)
  await format.selectOption('12h')
  await page.clock.runFor(1000)
  for (const hand of await page.locator('.second-hand').all()) {
    await expect(hand).toHaveAttribute('transform', 'rotate(342 50 50)')
  }
  await expect(page.getByTestId('city-time-1850147')).toHaveText('09:34:57 PM')
  await page.screenshot({ path: testInfo.outputPath('analog.png'), fullPage: true })
  await page.reload()
  await expect(presentation).toHaveValue('analog')
  await expect(format).toHaveValue('12h')
  await expect(page.locator('.clock-face')).toHaveCount(3)
  await presentation.selectOption('digital')
  await expect(page.locator('.clock-face')).toHaveCount(0)
  await expect(page.getByTestId('city-time-1850147')).toHaveText(/09:34:\d{2} PM/)
  await format.selectOption('24h')
  await expect(page.getByTestId('city-time-1850147')).toHaveText(/21:34:\d{2}/)
  await expect(page.getByTestId('city-time-2643743')).toHaveText(/12:34:\d{2}/)
  await expect(page.getByTestId('local-time')).toHaveText(/^\d{2}:\d{2}:\d{2}$/)
  await page.screenshot({ path: testInfo.outputPath('digital.png'), fullPage: true })
  await page.reload()
  await expect(presentation).toHaveValue('digital')
  await expect(format).toHaveValue('24h')
  expect(JSON.parse((await page.evaluate((key) => localStorage.getItem(key), key))!)).toEqual({
    version: 2,
    selectedCityIds: [1850147, 2643743],
    presentationMode: 'digital',
    timeFormat: '24h',
  })
  expect(errors).toEqual([])
})

test('recovers a malformed current document and persists safe settings on user change', async ({
  page,
}) => {
  await page.goto('./')
  await page.evaluate(
    (key) =>
      localStorage.setItem(
        key,
        '{"version":2,"selectedCityIds":[1850147],"presentationMode":"broken","timeFormat":"12h"}',
      ),
    key,
  )
  await page.reload()
  await expect(page.getByRole('status')).toContainText('selection was reset')
  await expect(page.locator('[data-city-id]')).toHaveCount(0)
  await expect(page.getByLabel('Presentation', { exact: true })).toHaveValue('digital')
  await expect(page.getByLabel('Digital time format', { exact: true })).toHaveValue('24h')
  await page.getByLabel('Presentation', { exact: true }).selectOption('analog')
  await expect(page.getByRole('status')).toHaveCount(0)
  await page.reload()
  await expect(page.getByLabel('Presentation', { exact: true })).toHaveValue('analog')
  await expect(page.locator('.clock-face')).toHaveCount(1)
})
