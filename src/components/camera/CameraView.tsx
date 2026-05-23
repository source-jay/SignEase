import { useEffect, useState } from 'react'

import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useCamera } from '@/hooks/useCamera'
import { useHandTracking } from '@/hooks/useHandTracking'
import { cn } from '@/lib/utils'

import { CameraControls } from './CameraControls'
import { CameraPermissionPrompt } from './CameraPermissionPrompt'
import { ConfidenceIndicator } from './ConfidenceIndicator'
import { HandLandmarkCanvas } from './HandLandmarkCanvas'
import type { HandResult } from '@/types/hand-tracking'

interface CameraViewProps {
  onHandResults?: (results: HandResult | null) => void
  onStatusChange?: (status: { cameraReady: boolean; handTrackingReady: boolean }) => void
}

export function CameraView({ onHandResults, onStatusChange }: CameraViewProps) {
  const {
    videoRef,
    cameraState,
    facingMode,
    startCamera,
    stopCamera,
    flipCamera,
    error: cameraError
  } = useCamera()

  const {
    isModelLoading,
    handResults,
    startDetection,
    stopDetection,
    error: modelError
  } = useHandTracking()

  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 })

  const isFrontCamera = facingMode === 'user'
  const cameraReady = cameraState === 'active'
  const handTrackingReady = cameraReady && !isModelLoading
  const isReady = handTrackingReady

  // Propagate pipeline status upward
  useEffect(() => {
    onStatusChange?.({ cameraReady, handTrackingReady })
  }, [cameraReady, handTrackingReady, onStatusChange])

  // Propagate hand results upward
  useEffect(() => {
    onHandResults?.(handResults)
  }, [handResults, onHandResults])

  // When camera stream is loaded, update dimensions and start detection
  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setVideoSize({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight
      })
      startDetection(videoRef.current)
    }
  }

  // Handle toggling both camera and detection
  const toggleCamera = () => {
    if (cameraState === 'active') {
      stopDetection()
      stopCamera()
    } else {
      startCamera()
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection()
      stopCamera()
    }
  }, [stopDetection, stopCamera])

  // Show permission prompt when idle, denied, or errored
  if (cameraState === 'idle' || cameraState === 'denied' || cameraState === 'error') {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <CameraPermissionPrompt
          state={cameraState}
          onEnable={startCamera}
          error={cameraError || modelError}
        />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-black/5 rounded-2xl ring-1 ring-border shadow-sm">
      {/* Loading Overlay */}
      {!isReady && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          <LoadingSpinner size="lg" label="Initializing camera and AI models..." />
          <p className="mt-4 text-sm text-muted-foreground font-medium animate-pulse">
            {isModelLoading ? 'Loading AI Hand Tracking Model...' : 'Starting camera...'}
          </p>
        </div>
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onLoadedMetadata={handleVideoLoaded}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isFrontCamera ? 'scale-x-[-1]' : '',
          isReady ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Hand Tracking Overlay */}
      {isReady && videoSize.width > 0 && (
        <HandLandmarkCanvas
          results={handResults}
          width={videoSize.width}
          height={videoSize.height}
          mirrored={isFrontCamera}
          className="z-20"
        />
      )}

      {/* Overlays */}
      {isReady && (
        <>
          <div className="absolute top-4 right-4 z-30">
            <ConfidenceIndicator results={handResults} />
          </div>
          <CameraControls
            cameraState={cameraState}
            onToggleCamera={toggleCamera}
            onFlipCamera={flipCamera}
            disabled={!isReady}
          />
        </>
      )}
    </div>
  )
}
