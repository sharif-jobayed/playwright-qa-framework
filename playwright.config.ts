import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['allure-playwright', { outputFolder: 'allure-results', detail: true, suiteTitle: true }],
  ],

  use: {
    // Headless is the default. PW_HEADED=1 opts into a visible browser; --headed also works.
    headless: process.env.PW_HEADED !== '1',
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  projects: [
    {
      name: 'chromium',
      testIgnore: /tests\/api\/.*/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testIgnore: /tests\/api\/.*/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'api',
      testMatch: /tests\/api\/.*\.spec\.ts/,
      use: {
        baseURL: process.env.API_BASE_URL ?? 'https://jsonplaceholder.typicode.com',
      },
    },
  ],
});
