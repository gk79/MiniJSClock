import { defineConfig } from '@playwright/test'

const host = '127.0.0.1'
const port = 4173

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'line',
  use: {
    baseURL: `http://${host}:${port}/MiniJSClock/`,
    headless: true,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: `npm run build-only && npm run preview -- --host ${host} --port ${port}`,
    url: `http://${host}:${port}/MiniJSClock/`,
    reuseExistingServer: false,
  },
})
