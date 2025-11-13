import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E testing of Tauri desktop application
 *
 * Tests will run against the Tauri app URL (typically http://localhost:1420)
 * when the app is running in dev mode via `npm run tauri dev`
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:1420',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // For Tauri apps, the webServer cannot be auto-started because Playwright
  // cannot directly control the Tauri app lifecycle. Instead:
  // 1. Start the app manually: npm run tauri dev
  // 2. Wait for it to load completely
  // 3. Run tests: npm run test:e2e
  //
  // The tests will connect to the running app on port 1420.
  // webServer: {
  //   command: 'npm run tauri dev',
  //   url: 'http://localhost:1420',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});
