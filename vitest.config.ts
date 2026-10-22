import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Kept separate from vite.config.ts so tests never load the Markdown Studio dev plugin (AD-12).
const CART_CHECKOUT_THRESHOLD = { statements: 80, branches: 80 }

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tooling/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/*.d.ts', 'src/app/main.tsx'],
      // NFR-8: cart and checkout logic must keep 80% statement and branch coverage.
      thresholds: {
        'src/features/cart/**': CART_CHECKOUT_THRESHOLD,
        'src/features/checkout/**': CART_CHECKOUT_THRESHOLD,
      },
    },
  },
})
