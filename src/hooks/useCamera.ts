import { useCallback, useEffect, useRef, useState } from 'react'

import type { CameraFacing, CameraState } from '@/types/hand-tracking'

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>
  cameraState: CameraState
  facingMode: CameraFacing
  startCamera: () => Promise<void>
  stopCamera: () => void
  flipCamera: () => Promise<void>
  error: string | null
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraState, setCameraState] = useState<CameraState>('idle')
  const [facingMode, setFacingMode] = useState<CameraFacing>('user')
  const [error, setError] = useState<string | null>(null)

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setCameraState('idle')
  }, [])

  const startCamera = useCallback(
    async (facing: CameraFacing = facingMode) => {
      try {
        // Stop existing stream if any
        stopCamera()

        setCameraState('requesting')
        setError(null)

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          // We don't play immediately, wait for onloadedmetadata in the component
          setCameraState('active')
        }
      } catch (err: unknown) {
        setCameraState('error')
        if (err instanceof DOMException) {
          if (err.name === 'NotAllowedError') {
            setCameraState('denied')
            setError('Camera permission was denied. Please enable it in your browser settings.')
          } else if (err.name === 'NotFoundError') {
            setError('No camera device was found on this device.')
          } else {
            setError(`Error accessing camera: ${err.message}`)
          }
        } else {
          setError('An unknown error occurred while accessing the camera.')
        }
      }
    },
    [facingMode, stopCamera]
  )

  const flipCamera = useCallback(async () => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newFacing)
    if (cameraState === 'active') {
      await startCamera(newFacing)
    }
  }, [facingMode, cameraState, startCamera])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return {
    videoRef,
    cameraState,
    facingMode,
    startCamera,
    stopCamera,
    flipCamera,
    error,
  }
}
