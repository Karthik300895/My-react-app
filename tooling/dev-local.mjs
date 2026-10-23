// Starts the local Product API and the dev server together, so the app runs with no internet.
// Usage: npm run dev:local   (then open the address Vite prints, normally http://localhost:5173)
import { spawn } from 'node:child_process'

const children = [
  spawn(process.execPath, ['tooling/api-stub.mjs'], { stdio: 'inherit' }),
  spawn('npx', ['vite'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, VITE_PRODUCT_API_ORIGIN: 'http://localhost:4500' },
  }),
]

const stop = () => {
  for (const child of children) child.kill()
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
