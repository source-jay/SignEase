import { useCallback, useEffect, useState } from 'react'

export interface UseTextToSpeechReturn {
  isSupported: boolean
  isMuted: boolean
  isSpeaking: boolean
  rate: number
  pitch: number
  voices: SpeechSynthesisVoice[]
  selectedVoice: SpeechSynthesisVoice | null
  setMuted: (muted: boolean) => void
  setRate: (rate: number) => void
  setPitch: (pitch: number) => void
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void
  speak: (text: string) => void
  stop: () => void
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const isSupported = 'speechSynthesis' in window
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [isMuted, setMuted] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)

  // Initialize and load voices
  useEffect(() => {
    if (!isSupported) return

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      if (availableVoices.length > 0) {
        setVoices(availableVoices)
        // Default to the first available English voice or the system default
        const defaultVoice =
          availableVoices.find(v => v.default) ||
          availableVoices.find(v => v.lang.startsWith('en')) ||
          availableVoices[0]
        setSelectedVoice(defaultVoice)
      }
    }

    // Chrome loads voices asynchronously
    loadVoices()
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [isSupported])

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isSupported])

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || isMuted || !text.trim()) return

      // Cancel any ongoing speech before starting a new one
      stop()

      const utterance = new SpeechSynthesisUtterance(text)
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }
      utterance.rate = rate
      utterance.pitch = pitch

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = e => {
        console.error('SpeechSynthesis error:', e)
        setIsSpeaking(false)
      }

      window.speechSynthesis.speak(utterance)
    },
    [isSupported, isMuted, selectedVoice, rate, pitch, stop],
  )

  return {
    isSupported,
    isMuted,
    isSpeaking,
    rate,
    pitch,
    voices,
    selectedVoice,
    setMuted,
    setRate,
    setPitch,
    setSelectedVoice,
    speak,
    stop,
  }
}
