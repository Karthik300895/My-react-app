import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router/dom'
import '../index.css'
import { enableMocking } from './enableMocking'
import { createQueryClient } from './queryClient'
import { createAppRouter } from './router'
import { store } from './store'

// The app renders even if the dev mock worker fails to start.
void enableMocking()
  .catch((error: unknown) => console.error('API mocking disabled:', error))
  .finally(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <Provider store={store}>
          <QueryClientProvider client={createQueryClient()}>
            <RouterProvider router={createAppRouter()} />
          </QueryClientProvider>
        </Provider>
      </StrictMode>,
    )
  })
