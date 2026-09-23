import { expect, test } from '@playwright/test'

test('renders the application shell from the production base path', async ({ page }) => {
  await page.goto('./')

  await expect(page).toHaveTitle('MiniJSClock')
  await expect(page.getByRole('heading', { level: 1, name: 'MiniJSClock' })).toBeVisible()
  await expect(page.getByText('Application shell is ready.')).toBeVisible()
})
