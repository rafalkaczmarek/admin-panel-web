import { defineConfig, devices } from '@playwright/test';

const E2E_HOST = '127.0.0.1';
const E2E_APP_PORT = 4000;
const E2E_API_PORT = 3000;
const E2E_APP_URL = `http://${E2E_HOST}:${E2E_APP_PORT}`;
const E2E_API_HEALTH_URL = `http://${E2E_HOST}:${E2E_API_PORT}/api/products`;

function quoteForShell(command: string): string {
  return command.includes(' ') ? `"${command}"` : command;
}

const nodeCommand = quoteForShell(process.execPath);
const ngCli = quoteForShell('./node_modules/@angular/cli/bin/ng.js');

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e-tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: E2E_APP_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: [
    {
      command: `${nodeCommand} e2e-tests/mock-api/server.mjs`,
      url: E2E_API_HEALTH_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: {
        ...process.env,
        E2E_API_PORT: String(E2E_API_PORT),
      },
    },
    {
      command: `${nodeCommand} ${ngCli} serve --configuration e2e --host ${E2E_HOST} --port ${E2E_APP_PORT}`,
      url: E2E_APP_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
