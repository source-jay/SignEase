import type { HandLandmark } from '@/types/hand-tracking'

/**
 * Normalizes 3D hand landmarks to be translation and scale invariant.
 * Makes the wrist (landmark 0) the origin (0,0,0) and normalizes distances.
 * Returns a flat array of 63 numbers (21 landmarks * 3 coordinates).
 */
export function processLandmarks(landmarks: HandLandmark[]): number[] {
  if (!landmarks || landmarks.length !== 21) {
    throw new Error('Expected exactly 21 landmarks')
  }

  // 1. Translation: make the wrist (index 0) the origin
  const wrist = landmarks[0]
  const translated = landmarks.map((lm) => ({
    x: lm.x - wrist.x,
    y: lm.y - wrist.y,
    z: lm.z - wrist.z,
  }))

  // 2. Scale normalization: find the maximum distance from the origin
  let maxDist = 0
  for (const lm of translated) {
    const dist = Math.sqrt(lm.x * lm.x + lm.y * lm.y + lm.z * lm.z)
    if (dist > maxDist) maxDist = dist
  }

  // Prevent division by zero
  if (maxDist === 0) maxDist = 1

  // 3. Normalize and flatten
  const flatArray: number[] = []
  for (const lm of translated) {
    flatArray.push(lm.x / maxDist)
    flatArray.push(lm.y / maxDist)
    flatArray.push(lm.z / maxDist)
  }

  return flatArray
}
