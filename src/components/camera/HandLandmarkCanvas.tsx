import { useEffect, useRef } from 'react'

import type { HandResult } from '@/types/hand-tracking'
import { drawConnections, drawLandmarks, HAND_CONNECTIONS } from '@/utils/drawing'
import { cn } from '@/lib/utils'

interface HandLandmarkCanvasProps {
  results: HandResult | null
  width: number
  height: number
  mirrored?: boolean
  className?: string
}

export function HandLandmarkCanvas({ 
  results, 
  width, 
  height, 
  mirrored = false,
  className 
}: HandLandmarkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear previous drawing
    ctx.clearRect(0, 0, width, height)

    if (results && results.landmarks.length > 0) {
      ctx.save()
      
      // If mirrored (front camera), flip the canvas horizontally before drawing
      if (mirrored) {
        ctx.scale(-1, 1)
        ctx.translate(-width, 0)
      }

      for (const landmarks of results.landmarks) {
        drawConnections(ctx, landmarks, HAND_CONNECTIONS)
        drawLandmarks(ctx, landmarks)
      }
      
      ctx.restore()
    }
  }, [results, width, height, mirrored])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={cn("absolute inset-0 w-full h-full object-cover pointer-events-none", className)}
    />
  )
}
