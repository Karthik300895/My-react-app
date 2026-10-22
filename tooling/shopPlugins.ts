import tailwindcss from '@tailwindcss/vite'
import { msw } from 'msw/vite'
import type { PluginOption } from 'vite'

// AD-12: the shop's Vite plugins live here (type-checked and linted) and are appended
// to vite.config.ts, whose frozen Markdown Studio plugin is excluded from the gates.
export function shopPlugins(): PluginOption[] {
  return [
    tailwindcss(),
    // AD-10: serve the MSW worker in dev only; `apply: 'serve'` keeps it out of dist/.
    { ...msw({ mode: 'worker-only' }), apply: 'serve' },
  ]
}
