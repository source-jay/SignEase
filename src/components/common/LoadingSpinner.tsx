import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  label?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'size-5',
  md: 'size-8',
  lg: 'size-12',
}

export function LoadingSpinner({
  label = 'Loading',
  className,
  size = 'md',
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2
        className={cn('animate-spin text-primary', sizeClasses[size])}
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
