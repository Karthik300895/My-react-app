import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// AD-10: unit and component tests always run against MSW.
export const server = setupServer(...handlers)
