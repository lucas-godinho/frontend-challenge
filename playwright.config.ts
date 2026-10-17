import { defineConfig, devices } from '@playwright/test'

const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  expect: { toHaveScreenshot: { animations: 'disabled', maxDiffPixelRatio: 0.02 } },
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    contextOptions: { reducedMotion: 'reduce' },
    launchOptions: chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : undefined,
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'chromium-mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium', viewport: { width: 390, height: 844 } } },
  ],
  webServer: { command: 'npm run dev -- --host 127.0.0.1', url: 'http://127.0.0.1:5173', reuseExistingServer: !process.env.CI, timeout: 30_000 },
})
