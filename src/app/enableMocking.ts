// AD-10: MSW runs in development only, and only when VITE_API_MOCK=true.
// The DEV guard is a build-time constant, so production bundles drop the mocks import.
export async function enableMocking(): Promise<void> {
  if (!import.meta.env.DEV || import.meta.env.VITE_API_MOCK !== 'true') return

  const { worker } = await import('../mocks/browser')
  await worker.start({ onUnhandledFrame: 'bypass' })
}
