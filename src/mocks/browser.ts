import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// AD-10: development-only worker; imported solely by app/enableMocking behind import.meta.env.DEV.
export const worker = setupWorker(...handlers)
