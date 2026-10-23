// Story 4.2: starts what the Lighthouse budget run needs, the same way on Windows and Linux:
// the local API stub, a production build that points at it, then `vite preview`.
// Lighthouse CI (lighthouserc.json) runs this script and stops it when the audits finish.
import { spawn, spawnSync } from 'node:child_process'

const STUB_ORIGIN = 'http://localhost:4500'
const children = []

const stub = spawn(process.execPath, ['tooling/api-stub.mjs'], {
  stdio: 'inherit',
})
children.push(stub)

// The build is the production bundle, so it is compiled with the stub's origin baked in.
const build = spawnSync('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, VITE_PRODUCT_API_ORIGIN: STUB_ORIGIN },
})
if (build.status !== 0) {
  for (const child of children) child.kill()
  process.exit(build.status ?? 1)
}

const preview = spawn(
  'npm',
  ['run', 'preview', '--', '--port', '4173', '--strictPort'],
  {
    stdio: 'inherit',
    shell: true,
  },
)
children.push(preview)

const stop = () => {
  for (const child of children) child.kill()
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
