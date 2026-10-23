/// <reference types="vite/client" />
/// <reference types="@testing-library/jest-dom/vitest" />

interface ImportMetaEnv {
  /** AD-10: set to 'true' to serve the Product API from MSW during `npm run dev`. */
  readonly VITE_API_MOCK?: string
  /** Story 4.2: the Product API origin, overridden for the budget run's local stub. */
  readonly VITE_PRODUCT_API_ORIGIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
