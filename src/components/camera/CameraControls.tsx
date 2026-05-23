import { Camera, SwitchCamera, StopCircle, PlayCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { CameraState } from '@/types/hand-tracking'

interface CameraControlsProps {
  cameraState: CameraState
  onToggleCamera: () => void
  onFlipCamera: () => void
  disabled?: boolean
}

export function CameraControls({
  cameraState,
  onToggleCamera,
  onFlipCamera,
  disabled
}: CameraControlsProps) {
  const isActive = cameraState === 'active'

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background/60 backdrop-blur-md p-3 rounded-full shadow-lg border border-border/50">
      <Button
        variant="secondary"
        size="icon"
        className="rounded-full size-12 shadow-sm"
        onClick={onFlipCamera}
        disabled={disabled || cameraState === 'requesting'}
        aria-label="Flip camera"
      >
        <SwitchCamera className="size-6" />
      </Button>

      <Button
        variant={isActive ? 'destructive' : 'default'}
        size="icon"
        className="rounded-full size-16 shadow-md transition-transform active:scale-95"
        onClick={onToggleCamera}
        disabled={disabled || cameraState === 'requesting'}
        aria-label={isActive ? "Stop camera" : "Start camera"}
      >
        {isActive ? (
          <StopCircle className="size-8" />
        ) : (
          <PlayCircle className="size-8" />
        )}
      </Button>

      <div className="size-12 flex items-center justify-center text-muted-foreground">
        {/* Placeholder for future settings/filters button to balance the layout */}
        <Camera className="size-5 opacity-50" />
      </div>
    </div>
  )
}
