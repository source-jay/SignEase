import { useCallback, useEffect, useRef, useState } from 'react'

import { processLandmarks } from '@/services/ai/landmark-processing'
import { signModel } from '@/services/ai/SignLanguageModel'
import type { HandResult } from '@/types/hand-tracking'

export interface RecognizedSign {
  label: string
  confidence: number
}

interface UseSignRecognizerOptions {
  bufferSize?: number
  confidenceThreshold?: number
}

export function useSignRecognizer(
  handResults: HandResult | null,
  options: UseSignRecognizerOptions = {},
) {
  const { bufferSize = 15, confidenceThreshold = 0.75 } = options

  const [modelStatus, setModelStatus] = useState<'loading' | 'ready' | 'no-model'>('loading')
  const [recognizedSign, setRecognizedSign] = useState<RecognizedSign | null>(null)
  const [sessionWords, setSessionWords] = useState<string[]>([])

  // Keep a rolling buffer of recent predictions to smooth out noise
  const predictionBufferRef = useRef<string[]>([])
  // Track the last sign appended to session to avoid duplicates
  const lastSessionWordRef = useRef<string | null>(null)

  const currentSentence = sessionWords.join(' ')

  const resetSession = useCallback(() => {
    setSessionWords([])
    lastSessionWordRef.current = null
  }, [])

  // Load the model on mount
  useEffect(() => {
    let mounted = true
    async function init() {
      const loaded = await signModel.loadModel()
      if (mounted) {
        setModelStatus(loaded ? 'ready' : 'no-model')
      }
    }
    void init()

    return () => {
      mounted = false
    }
  }, [])

  // Run prediction when hand results change
  useEffect(() => {
    if (modelStatus !== 'ready' || !handResults || handResults.landmarks.length === 0) {
      setRecognizedSign(null)
      predictionBufferRef.current = []
      return
    }

    let isCancelled = false

    async function predict() {
      // Use the first hand found
      const landmarks = handResults!.landmarks[0]
      let features: number[]

      try {
        features = processLandmarks(landmarks)
      } catch {
        return // Ignore bad landmarks
      }

      const prediction = await signModel.predict(features)
      if (isCancelled || !prediction) return

      if (prediction.confidence >= confidenceThreshold) {
        // Add to smoothing buffer
        predictionBufferRef.current.push(prediction.label)
        if (predictionBufferRef.current.length > bufferSize) {
          predictionBufferRef.current.shift()
        }

        // Majority-vote smoothing
        const counts: Record<string, number> = {}
        let maxLabel = prediction.label
        let maxCount = 0

        for (const label of predictionBufferRef.current) {
          counts[label] = (counts[label] || 0) + 1
          if (counts[label] > maxCount) {
            maxCount = counts[label]
            maxLabel = label
          }
        }

        // Only emit when we have a solid majority
        if (maxCount >= Math.floor(predictionBufferRef.current.length * 0.5)) {
          const stableSign: RecognizedSign = {
            label: maxLabel,
            confidence: prediction.confidence,
          }
          setRecognizedSign(stableSign)

          // Append to session if it's different from the last word
          if (maxLabel !== lastSessionWordRef.current) {
            lastSessionWordRef.current = maxLabel
            setSessionWords(prev => [...prev, maxLabel])
          }
        }
      } else {
        // Confidence dropped — clear buffer but keep session words
        predictionBufferRef.current = []
        setRecognizedSign(null)
        // Allow the same sign again after a gap
        lastSessionWordRef.current = null
      }
    }

    void predict()

    return () => {
      isCancelled = true
    }
  }, [handResults, modelStatus, confidenceThreshold, bufferSize])

  return {
    modelStatus,
    recognizedSign,
    sessionWords,
    currentSentence,
    resetSession,
  }
}
