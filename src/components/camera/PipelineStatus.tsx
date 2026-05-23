import { cn } from '@/lib/utils'

interface PipelineStatusProps {
  cameraReady: boolean
  handTrackingReady: boolean
  modelStatus: 'loading' | 'ready' | 'no-model'
  className?: string
}

interface StepDotProps {
  label: string
  state: 'ready' | 'loading' | 'error' | 'idle'
}

function StepDot({ label, state }: StepDotProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          'inline-block size-2 rounded-full transition-colors duration-500',
          state === 'ready'   && 'bg-emerald-500 shadow-[0_0_6px_1px_rgba(16,185,129,0.6)]',
          state === 'loading' && 'bg-amber-400 animate-pulse',
          state === 'error'   && 'bg-rose-500',
          state === 'idle'    && 'bg-muted-foreground/30',
        )}
      />
      <span
        className={cn(
          'text-[10px] font-medium uppercase tracking-wide transition-colors duration-300',
          state === 'ready'   && 'text-emerald-500',
          state === 'loading' && 'text-amber-400',
          state === 'error'   && 'text-rose-500',
          state === 'idle'    && 'text-muted-foreground/50',
        )}
      >
        {label}
      </span>
    </div>
  )
}

export function PipelineStatus({
  cameraReady,
  handTrackingReady,
  modelStatus,
  className,
}: PipelineStatusProps) {
  const cameraState: StepDotProps['state'] = cameraReady ? 'ready' : 'loading'
  const htState: StepDotProps['state']     = handTrackingReady ? 'ready' : cameraReady ? 'loading' : 'idle'
  const aiState: StepDotProps['state']     =
    modelStatus === 'ready'    ? 'ready'   :
    modelStatus === 'loading'  ? 'loading' :
    'error'

  const allReady = cameraReady && handTrackingReady && modelStatus === 'ready'

  return (
    <div
      className={cn(
        'flex items-center justify-between sm:justify-start gap-2 sm:gap-4 w-full sm:w-auto px-4 sm:px-3 py-1.5 rounded-full border border-border/60 bg-card/60 backdrop-blur-sm',
        allReady && 'border-emerald-500/30 bg-emerald-500/5',
        className,
      )}
    >
      <StepDot label="Camera"       state={cameraState} />
      <div className="h-3 w-px bg-border/60" />
      <StepDot label="Hand Tracking" state={htState} />
      <div className="h-3 w-px bg-border/60" />
      <StepDot label="AI Model"     state={aiState} />
    </div>
  )
}
