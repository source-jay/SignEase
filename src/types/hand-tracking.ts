export type CameraState = 'idle' | 'requesting' | 'active' | 'denied' | 'error'
export type CameraFacing = 'user' | 'environment'

export interface HandLandmark {
  x: number
  y: number
  z: number
}

export interface HandResult {
  landmarks: HandLandmark[][]
  handedness: string[]
  confidence: number[]
}
