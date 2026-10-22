// AD-10: production builds must not contain the MSW worker or any MSW code.
// Usage: node tooling/check-build.ts [distDir]   (Node >= 22.18 runs .ts via type stripping)
// Logic lives in mswArtifacts.ts so this entry point runs unconditionally.
import { findMswArtifacts } from './mswArtifacts.ts'

const distDir = process.argv[2] ?? 'dist'
const problems = findMswArtifacts(distDir)
if (problems.length > 0) {
  console.error(
    'check:build failed (AD-10):\n' +
      problems.map((p) => `  - ${p}`).join('\n'),
  )
  process.exit(1)
}
console.log(`check:build passed: no MSW in ${distDir}/`)
