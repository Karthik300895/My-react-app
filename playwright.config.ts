import { defineConfig, devices } from '@playwright/test'

// Journey specs (uj-N-*.spec.ts) and axe checks are added from Story 1.2 onward.
export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  use: { baseURL: 'http://localhost:4173' },
  webServer: {
    // AD-10: e2e always runs against MSW, which production builds strip, so use the dev server.
    command: 'npm run dev -- --port 4173 --strictPort',
    env: { VITE_API_MOCK: 'true' },
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
})
