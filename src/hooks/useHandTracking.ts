import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { HandResult } from '@/types/hand-tracking'

interface UseHandTrackingOptions {
  numHands?: number
  minDetectionConfidence?: number
  minTrackingConfidence?: number
}

interface UseHandTrackingReturn {
  isModelLoading: boolean
  isDetecting: boolean
  handResults: HandResult | null
  startDetection: (videoElement: HTMLVideoElement) => void
  stopDetection: () => void
  error: string | null
}

export function useHandTracking(options: UseHandTrackingOptions = {}): UseHandTrackingReturn {
  const {
    numHands = 2,
    minDetectionConfidence = 0.5,
    minTrackingConfidence = 0.5,
  } = options

  const [isModelLoading, setIsModelLoading] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [handResults, setHandResults] = useState<HandResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const landmarkerRef = useRef<HandLandmarker | null>(null)
  const requestRef = useRef<number | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Initialize the model
  const initModel = useCallback(async () => {
    if (landmarkerRef.current) return true
    
    try {
      setIsModelLoading(true)
      setError(null)
      
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      )
      
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numHands,
        minHandDetectionConfidence: minDetectionConfidence,
        minHandPresenceConfidence: minTrackingConfidence,
        minTrackingConfidence: minTrackingConfidence,
      })
      
      landmarkerRef.current = landmarker
      return true
    } catch (err: unknown) {
      console.error('Failed to load MediaPipe model:', err)
      setError('Failed to load hand tracking model. Please check your internet connection.')
      return false
    } finally {
      setIsModelLoading(false)
    }
  }, [numHands, minDetectionConfidence, minTrackingConfidence])

  // Detection loop
  const detect = useCallback(() => {
    if (!videoRef.current || !landmarkerRef.current || !isDetecting) return

    const video = videoRef.current
    
    // Only detect if video has frames and is playing
    if (video.readyState >= 2 && !video.paused) {
      const startTimeMs = performance.now()
      const results = landmarkerRef.current.detectForVideo(video, startTimeMs)
      
      if (results.landmarks.length > 0) {
        setHandResults({
          landmarks: results.landmarks,
          handedness: results.handednesses.map(h => h[0].displayName),
          confidence: results.handednesses.map(h => h[0].score)
        })
      } else {
        setHandResults(null)
      }
    }
    
    requestRef.current = requestAnimationFrame(detect)
  }, [isDetecting])

  // Start/Stop handlers
  const startDetection = useCallback(async (videoElement: HTMLVideoElement) => {
    videoRef.current = videoElement
    const isReady = await initModel()
    if (isReady) {
      setIsDetecting(true)
    }
  }, [initModel])

  const stopDetection = useCallback(() => {
    setIsDetecting(false)
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current)
      requestRef.current = null
    }
    setHandResults(null)
  }, [])

  // Start loop when isDetecting becomes true
  useEffect(() => {
    if (isDetecting) {
      requestRef.current = requestAnimationFrame(detect)
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [isDetecting, detect])

  // Cleanup landmarker on unmount
  useEffect(() => {
    return () => {
      if (landmarkerRef.current) {
        landmarkerRef.current.close()
        landmarkerRef.current = null
      }
    }
  }, [])

  return {
    isModelLoading,
    isDetecting,
    handResults,
    startDetection,
    stopDetection,
    error,
  }
}
