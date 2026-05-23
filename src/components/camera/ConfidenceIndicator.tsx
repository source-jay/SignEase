import type { HandResult } from '@/types/hand-tracking'
import { cn } from '@/lib/utils'

interface ConfidenceIndicatorProps {
  results: HandResult | null
  className?: string
}

export function ConfidenceIndicator({ results, className }: ConfidenceIndicatorProps) {
  if (!results || results.confidence.length === 0) {
    return (
      <div className={cn("bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground border border-border/50 shadow-sm", className)}>
        No hands detected
      </div>
    )
  }

  // Calculate average confidence if multiple hands
  const avgConfidence = results.confidence.reduce((a, b) => a + b, 0) / results.confidence.length
  const percentage = Math.round(avgConfidence * 100)
  
  let colorClass = 'text-destructive'
  let dotClass = 'bg-destructive'
  
  if (percentage >= 80) {
    colorClass = 'text-secondary'
    dotClass = 'bg-secondary'
  } else if (percentage >= 50) {
    colorClass = 'text-accent'
    dotClass = 'bg-accent'
  }

  return (
    <div className={cn("bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium border border-border shadow-sm flex items-center gap-2", className)}>
      <span className="relative flex size-2">
        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", dotClass)}></span>
        <span className={cn("relative inline-flex rounded-full size-2", dotClass)}></span>
      </span>
      <span className={colorClass}>
        Tracking: {percentage}%
      </span>
      <span className="text-muted-foreground ml-1 border-l pl-2 border-border/50">
        {results.handedness.join(' & ')}
      </span>
    </div>
  )
}
