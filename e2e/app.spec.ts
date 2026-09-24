import { expect, test } from '@playwright/test'

test('shows a running browser-local clock from the production base path', async ({ page }) => {
  await page.goto('./')

  await expect(page).toHaveTitle('MiniJSClock')
  await expect(page.getByRole('heading', { level: 1, name: 'MiniJSClock' })).toBeVisible()
  const clock = page.getByTestId('local-time')
  await expect(clock).toBeVisible()

  const matchesBrowserLocalTime = async () =>
    page.evaluate(() => {
      const before = new Date()
      const value = document.querySelector('[data-testid="local-time"]')?.textContent?.trim()
      const after = new Date()
      const format = (date: Date) =>
        [date.getHours(), date.getMinutes(), date.getSeconds()]
          .map((part) => String(part).padStart(2, '0'))
          .join(':')
      return value === format(before) || value === format(after)
    })

  await expect.poll(matchesBrowserLocalTime).toBe(true)
  const firstReading = await clock.textContent()
  await expect(clock).not.toHaveText(firstReading ?? '', { timeout: 4000 })
  await expect.poll(matchesBrowserLocalTime).toBe(true)
})
