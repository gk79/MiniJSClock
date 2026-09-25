import { expect, test } from '@playwright/test'

const key = 'minijsclock.config'

async function addCity(page: import('@playwright/test').Page, query: string, label: string) {
  await page.getByRole('searchbox', { name: 'Search cities' }).fill(query)
  await page.getByLabel('Add a city').selectOption({ label })
}

test('adds, restores, removes and advances catalog-zone clocks under the production base path', async ({
  page,
}) => {
  await page.goto('./')
  await expect(page.getByTestId('local-time')).toBeVisible()
  await expect(page.locator('[data-city-id]')).toHaveCount(0)
  await expect(page.getByText('400 cities available')).toBeVisible()
  await page.getByRole('searchbox', { name: 'Search cities' }).fill('mAwSiL')
  await expect(page.getByRole('option', { name: 'Al Mawşil al Jadīdah (IQ)' })).toHaveCount(1)

  await addCity(page, 'tOkYo', 'Tokyo (JP)')
  await expect(page.getByRole('option', { name: 'Tokyo (JP)' })).toHaveCount(0)
  await addCity(page, 'gB', 'London (GB)')
  await expect(page.locator('[data-city-id]')).toHaveCount(2)
  await expect(page.locator('[data-city-id]').first()).toHaveAttribute('data-city-id', '1850147')
  await expect(page.locator('[data-city-id]').last()).toHaveAttribute('data-city-id', '2643743')
  expect(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key)).toBe(
    '{"version":1,"selectedCityIds":[1850147,2643743]}',
  )

  const matchesZoneTime = async (id: number, zone: string) =>
    page.evaluate(
      ({ id, zone }) => {
        const before = new Date()
        const shown = document.querySelector(`[data-testid="city-time-${id}"]`)?.textContent?.trim()
        const after = new Date()
        const format = (instant: Date) =>
          new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h23',
            timeZone: zone,
          }).format(instant)
        return shown === format(before) || shown === format(after)
      },
      { id, zone },
    )
  await expect.poll(() => matchesZoneTime(1850147, 'Asia/Tokyo')).toBe(true)
  await expect.poll(() => matchesZoneTime(2643743, 'Europe/London')).toBe(true)
  const firstReading = await page.getByTestId('city-time-1850147').textContent()
  await expect(page.getByTestId('city-time-1850147')).not.toHaveText(firstReading ?? '', {
    timeout: 4000,
  })

  await page.reload()
  await expect(page.locator('[data-city-id]')).toHaveCount(2)
  await expect(page.locator('[data-city-id]').first()).toHaveAttribute('data-city-id', '1850147')
  await page.getByRole('button', { name: 'Remove Tokyo' }).click()
  await expect(page.locator('[data-city-id]')).toHaveCount(1)
  await page.reload()
  await expect(page.locator('[data-city-id]')).toHaveCount(1)
  await expect(page.locator('[data-city-id]')).toHaveAttribute('data-city-id', '2643743')
  expect(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key)).toBe(
    '{"version":1,"selectedCityIds":[2643743]}',
  )
})

test('recovers from malformed and unsupported stored documents without crashing', async ({
  page,
}) => {
  await page.goto('./')
  await page.evaluate((storageKey) => localStorage.setItem(storageKey, '{bad'), key)
  await page.reload()
  await expect(page.getByRole('status')).toContainText('selection was reset')
  await expect(page.getByTestId('local-time')).toBeVisible()
  await expect(page.locator('[data-city-id]')).toHaveCount(0)
  await addCity(page, 'Tokyo', 'Tokyo (JP)')
  await expect(page.locator('[data-city-id]')).toHaveCount(1)

  await page.evaluate(
    (storageKey) => localStorage.setItem(storageKey, '{"version":2,"selectedCityIds":[1850147]}'),
    key,
  )
  await page.reload()
  await expect(page.getByRole('status')).toContainText('unsupported version')
  await expect(page.locator('[data-city-id]')).toHaveCount(0)
  await addCity(page, 'Tokyo', 'Tokyo (JP)')
  await expect(page.locator('[data-city-id]')).toHaveCount(1)
  expect(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key)).toBe(
    '{"version":2,"selectedCityIds":[1850147]}',
  )
})

test('keeps selection usable when browser storage writes fail', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error('blocked')
    }
  })
  await page.goto('./')
  await addCity(page, 'Tokyo', 'Tokyo (JP)')
  await expect(page.locator('[data-city-id]')).toHaveCount(1)
  await expect(page.getByRole('status')).toContainText('saving failed')
  await page.getByRole('button', { name: 'Remove Tokyo' }).click()
  await expect(page.locator('[data-city-id]')).toHaveCount(0)
})

test('reports blocked storage reads while keeping clocks usable in the tab', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error('blocked')
    }
    Storage.prototype.setItem = () => {
      throw new Error('blocked')
    }
  })
  await page.goto('./')
  await expect(page.getByRole('status')).toContainText('storage is unavailable')
  await expect(page.getByTestId('local-time')).toBeVisible()
  await addCity(page, 'Tokyo', 'Tokyo (JP)')
  await expect(page.locator('[data-city-id]')).toHaveCount(1)
  await page.getByRole('button', { name: 'Remove Tokyo' }).click()
  await expect(page.locator('[data-city-id]')).toHaveCount(0)
})
