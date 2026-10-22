import { afterEach, describe, expect, it, vi } from 'vitest'
import { enableMocking } from './enableMocking'

const start = vi.hoisted(() => vi.fn(() => Promise.resolve(undefined)))

vi.mock('../mocks/browser', () => ({ worker: { start } }))

describe('enableMocking', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    start.mockClear()
  })

  it('AD-10: does not start the worker when VITE_API_MOCK is unset', async () => {
    vi.stubEnv('VITE_API_MOCK', '')

    await enableMocking()

    expect(start).not.toHaveBeenCalled()
  })

  it('AD-10: does not start the worker outside development', async () => {
    vi.stubEnv('VITE_API_MOCK', 'true')
    vi.stubEnv('DEV', false)

    await enableMocking()

    expect(start).not.toHaveBeenCalled()
  })

  it('AD-10: starts the worker with bypass for unhandled requests when VITE_API_MOCK=true', async () => {
    vi.stubEnv('VITE_API_MOCK', 'true')
    vi.stubEnv('DEV', true)

    await enableMocking()

    expect(start).toHaveBeenCalledWith({ onUnhandledFrame: 'bypass' })
  })
})
