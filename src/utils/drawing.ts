import type { HandLandmark } from '@/types/hand-tracking'

export const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle finger
  [9, 10], [10, 11], [11, 12],
  // Ring finger
  [13, 14], [14, 15], [15, 16],
  // Pinky
  [17, 18], [18, 19], [19, 20],
  // Palm
  [0, 17], [5, 9], [9, 13], [13, 17],
]

export const LANDMARK_COLORS = {
  thumb: '#F59E0B',
  index: '#10B981',
  middle: '#2563EB',
  ring: '#8B5CF6',
  pinky: '#EC4899',
  palm: '#FFFFFF',
}

function getLandmarkColor(index: number): string {
  if (index >= 1 && index <= 4) return LANDMARK_COLORS.thumb
  if (index >= 5 && index <= 8) return LANDMARK_COLORS.index
  if (index >= 9 && index <= 12) return LANDMARK_COLORS.middle
  if (index >= 13 && index <= 16) return LANDMARK_COLORS.ring
  if (index >= 17 && index <= 20) return LANDMARK_COLORS.pinky
  return LANDMARK_COLORS.palm
}

interface DrawOptions {
  color?: string
  lineWidth?: number
  radius?: number
}

export function drawLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: HandLandmark[],
  options: DrawOptions = {}
) {
  const { radius = 4 } = options

  landmarks.forEach((landmark, index) => {
    const x = landmark.x * ctx.canvas.width
    const y = landmark.y * ctx.canvas.height

    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.fillStyle = getLandmarkColor(index)
    ctx.fill()
    
    // Add subtle glow
    ctx.shadowBlur = 10
    ctx.shadowColor = ctx.fillStyle
    
    ctx.lineWidth = 1
    ctx.strokeStyle = '#000000'
    ctx.stroke()
    
    // Reset shadow for next draws
    ctx.shadowBlur = 0
  })
}

export function drawConnections(
  ctx: CanvasRenderingContext2D,
  landmarks: HandLandmark[],
  connections: number[][],
  options: DrawOptions = {}
) {
  const { lineWidth = 2, color = 'rgba(255, 255, 255, 0.5)' } = options

  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  
  // Subtle glow for connections
  ctx.shadowBlur = 4
  ctx.shadowColor = color

  connections.forEach(([start, end]) => {
    const startPoint = landmarks[start]
    const endPoint = landmarks[end]

    if (startPoint && endPoint) {
      ctx.beginPath()
      ctx.moveTo(startPoint.x * ctx.canvas.width, startPoint.y * ctx.canvas.height)
      ctx.lineTo(endPoint.x * ctx.canvas.width, endPoint.y * ctx.canvas.height)
      ctx.stroke()
    }
  })
  
  // Reset shadow
  ctx.shadowBlur = 0
}
