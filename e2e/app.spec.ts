import { expect, test } from '@playwright/test'

test('shows a running browser-local clock from the production base path', async ({ page }) => {
  // Construct the timeline in the browser's timezone, including a local midnight crossing.
  const assertionInstant = await page.evaluate(() => new Date(2026, 0, 15, 23, 59, 58).getTime())
  await page.clock.install({ time: assertionInstant - 10_000 })
  await page.goto('./')

  await expect(page).toHaveTitle('MiniJSClock')
  await expect(page.getByRole('heading', { level: 1, name: 'MiniJSClock' })).toBeVisible()
  const clock = page.getByTestId('local-time')
  await expect(clock).toBeVisible()
  await page.clock.pauseAt(assertionInstant)

  const browserLocalTime = () =>
    page.evaluate(() => {
      const now = new Date()
      return [now.getHours(), now.getMinutes(), now.getSeconds()]
        .map((part) => String(part).padStart(2, '0'))
        .join(':')
    })

  let expected = await browserLocalTime()
  await expect(clock).toHaveText(expected)
  // runFor executes the application's real interval, including each intermediate tick.
  for (const elapsed of [1000, 2000, 60_000]) {
    const previous = expected
    await page.clock.runFor(elapsed)
    expected = await browserLocalTime()
    expect(expected).not.toBe(previous)
    await expect(clock).not.toHaveText(previous)
    await expect(clock).toHaveText(expected)
  }
})
