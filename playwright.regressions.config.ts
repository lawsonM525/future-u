import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests', testMatch: 'results-regressions.spec.ts', workers: 1,
  reporter: 'list', timeout: 60_000, expect: { timeout: 15_000 }, outputDir: './.playwright-results',
  use: { baseURL: 'http://localhost:3107', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: { command: 'npm run dev -- --port 3107', url: 'http://localhost:3107', reuseExistingServer: true, timeout: 120_000 },
})
