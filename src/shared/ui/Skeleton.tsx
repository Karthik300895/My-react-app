type SkeletonProps = { className?: string }

// UX-DR20: a content-shaped placeholder block; the shimmer stops under reduced motion.
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-shimmer rounded-sm bg-muted motion-reduce:animate-none ${className}`}
    />
  )
}
