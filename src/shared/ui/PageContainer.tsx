import type { ReactNode } from 'react'

type PageContainerProps = { children: ReactNode; className?: string }

// UX-DR2: content centred to 1280 px with 16/24/32 px gutters.
export function PageContainer({
  children,
  className = '',
}: PageContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-content-max px-gutter-mobile sm:px-gutter-tablet lg:px-gutter-desktop ${className}`}
    >
      {children}
    </div>
  )
}
