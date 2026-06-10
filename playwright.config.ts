import { defineConfig, devices } from '@playwright/test';

/** E2E sur le serveur de dev Angular. Les specs vivent hors de `src/` (séparé de Vitest). */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
