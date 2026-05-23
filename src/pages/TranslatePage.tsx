import {
  Check,
  ClipboardCopy,
  Hand,
  Mic,
  MicOff,
  RotateCcw,
  Save,
  Volume2,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { PageHeader } from '@/components/common/PageHeader'
import { CameraView } from '@/components/camera/CameraView'
import { PipelineStatus } from '@/components/camera/PipelineStatus'
import { SpeechControls } from '@/components/camera/SpeechControls'
import { Button } from '@/components/ui/button'
import { useSignRecognizer } from '@/hooks/useSignRecognizer'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import { useTranslationHistory } from '@/hooks/useTranslationHistory'
import { cn } from '@/lib/utils'
import type { HandResult } from '@/types/hand-tracking'

export function TranslatePage() {
  // ── State ────────────────────────────────────────────────────────────────
  const [handResults, setHandResults] = useState<HandResult | null>(null)
  const [pipelineStatus, setPipelineStatus] = useState({
    cameraReady: false,
    handTrackingReady: false,
  })
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [copied, setCopied] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  // ── Hooks ────────────────────────────────────────────────────────────────
  const { modelStatus, recognizedSign, sessionWords, currentSentence, resetSession } =
    useSignRecognizer(handResults, { bufferSize: 10, confidenceThreshold: 0.7 })

  const tts = useTextToSpeech()
  const history = useTranslationHistory()

  // ── Auto-speak each new confirmed sign ───────────────────────────────────
  const lastSpokenRef = useRef<string | null>(null)

  useEffect(() => {
    if (!autoSpeak) return
    if (recognizedSign && recognizedSign.label !== lastSpokenRef.current) {
      tts.speak(recognizedSign.label)
      lastSpokenRef.current = recognizedSign.label
    }
  }, [recognizedSign, tts, autoSpeak])

  // Reset dedup guard after a recognition gap
  useEffect(() => {
    if (!recognizedSign) {
      const t = setTimeout(() => { lastSpokenRef.current = null }, 2000)
      return () => clearTimeout(t)
    }
  }, [recognizedSign])

  // ── Actions ──────────────────────────────────────────────────────────────
  const speakSentence = useCallback(() => {
    if (currentSentence) tts.speak(currentSentence)
  }, [currentSentence, tts])

  const copySentence = useCallback(async () => {
    if (!currentSentence) return
    await navigator.clipboard.writeText(currentSentence)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [currentSentence])

  const saveSession = useCallback(async () => {
    if (!currentSentence || sessionWords.length === 0) return
    await history.save(currentSentence, sessionWords)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2000)
  }, [currentSentence, sessionWords, history])

  const handleReset = useCallback(() => {
    resetSession()
    history.resetTimer()
    lastSpokenRef.current = null
  }, [resetSession, history])

  const confidencePct = recognizedSign ? Math.round(recognizedSign.confidence * 100) : 0

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:h-[calc(100svh-12rem)] lg:min-h-[500px] h-auto min-h-0 gap-4 pb-20 lg:pb-0">

      {/* ── Header row ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Translate"
          description="Real-time sign language → text → speech"
        />
        <SpeechControls tts={tts} />
      </div>

      {/* ── Pipeline status + auto-speak toggle ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        <PipelineStatus
          cameraReady={pipelineStatus.cameraReady}
          handTrackingReady={pipelineStatus.handTrackingReady}
          modelStatus={modelStatus}
        />
        <Button
          id="auto-speak-toggle"
          variant={autoSpeak ? 'default' : 'outline'}
          size="sm"
          onClick={() => setAutoSpeak(p => !p)}
          className="gap-2 text-xs h-9 sm:h-8 w-full sm:w-auto shrink-0 shadow-sm"
          title={autoSpeak ? 'Disable auto-speak' : 'Enable auto-speak'}
        >
          {autoSpeak ? <Mic className="size-3.5" /> : <MicOff className="size-3.5" />}
          <span>Auto-speak {autoSpeak ? 'On' : 'Off'}</span>
        </Button>
      </div>

      {/* ── Main grid ───────────────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 min-h-0">

        {/* Camera feed */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg border border-border/50 min-h-[280px]">
          <CameraView
            onHandResults={setHandResults}
            onStatusChange={setPipelineStatus}
          />
        </div>

        {/* Right panel — scrollable on small screens */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-0.5">

          {/* ── Live translation output ─────────────────────────────────── */}
          <div
            className={cn(
              'bg-card border rounded-xl p-4 flex flex-col gap-3 transition-all duration-300',
              recognizedSign
                ? 'border-primary/40 shadow-[0_0_18px_2px_hsl(var(--primary)/0.18)]'
                : 'border-border shadow-sm',
              tts.isSpeaking && 'ring-2 ring-primary/25',
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'p-2 rounded-lg transition-colors duration-300',
                  recognizedSign ? 'bg-primary/15' : 'bg-muted',
                )}>
                  <Hand className={cn(
                    'size-5 transition-colors duration-300',
                    recognizedSign ? 'text-primary' : 'text-muted-foreground',
                  )} />
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Live Translation
                </p>
              </div>
              {recognizedSign && (
                <span className="text-xs font-bold tabular-nums text-primary">
                  {confidencePct}%
                </span>
              )}
            </div>

            {/* Current sign */}
            <div className="min-h-[56px] flex items-center">
              {recognizedSign ? (
                <p className="text-4xl font-black text-foreground tracking-tight animate-in fade-in slide-in-from-bottom-1 duration-200">
                  {recognizedSign.label}
                </p>
              ) : (
                <p className="text-base text-muted-foreground italic">
                  {modelStatus === 'loading' && 'Loading AI model…'}
                  {modelStatus === 'ready'   && 'Waiting for sign…'}
                  {modelStatus === 'no-model' && 'No model trained yet — go to /train'}
                </p>
              )}
            </div>

            {/* Confidence bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Confidence</span>
                <span className="tabular-nums">{confidencePct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    confidencePct >= 90 ? 'bg-emerald-500' :
                    confidencePct >= 75 ? 'bg-primary'     :
                    confidencePct >= 50 ? 'bg-amber-400'   : 'bg-rose-400',
                  )}
                  style={{ width: `${confidencePct}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── Sentence builder ────────────────────────────────────────── */}
          <div className="bg-card border border-border shadow-sm rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Sentence Builder
              </p>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {sessionWords.length} word{sessionWords.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Sentence text */}
            <div className="min-h-[52px] flex items-start">
              {currentSentence ? (
                <p className="text-lg font-semibold text-foreground leading-snug">
                  {currentSentence}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Confirmed signs will appear here…
                </p>
              )}
            </div>

            {/* Word chips */}
            {sessionWords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {sessionWords.map((word, idx) => (
                  <button
                    key={idx}
                    id={`word-chip-${idx}`}
                    onClick={() => tts.speak(word)}
                    title={`Speak "${word}"`}
                    className={cn(
                      'px-2.5 py-1 text-xs font-bold rounded-full border',
                      'bg-primary/10 text-primary border-primary/20',
                      'hover:bg-primary/20 hover:scale-105 active:scale-95',
                      'transition-all duration-150 animate-in fade-in zoom-in-75 duration-200',
                    )}
                  >
                    {word}
                  </button>
                ))}
              </div>
            )}

            {/* Action row */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border">
              {/* Speak */}
              <Button
                id="speak-sentence-btn"
                size="sm"
                className="gap-2 text-xs"
                onClick={speakSentence}
                disabled={!currentSentence || tts.isMuted}
              >
                <Volume2 className="size-3.5" />
                Speak
              </Button>

              {/* Copy */}
              <Button
                id="copy-sentence-btn"
                size="sm"
                variant="outline"
                className="gap-2 text-xs"
                onClick={copySentence}
                disabled={!currentSentence}
              >
                {copied
                  ? <><Check className="size-3.5 text-emerald-500" />Copied!</>
                  : <><ClipboardCopy className="size-3.5" />Copy</>}
              </Button>

              {/* Save to history */}
              <Button
                id="save-history-btn"
                size="sm"
                variant={savedFlash ? 'default' : 'secondary'}
                className={cn(
                  'gap-2 text-xs transition-colors duration-300',
                  savedFlash && 'bg-emerald-500 hover:bg-emerald-600 text-white',
                )}
                onClick={saveSession}
                disabled={!currentSentence || history.isSaving || !history.isAvailable}
                title={!history.isAvailable ? 'Sign in to save history' : 'Save to history'}
              >
                {savedFlash
                  ? <><Check className="size-3.5" />Saved!</>
                  : history.isSaving
                    ? <><Save className="size-3.5 animate-pulse" />Saving…</>
                    : <><Save className="size-3.5" />Save</>}
              </Button>

              {/* Clear / Reset */}
              <Button
                id="reset-session-btn"
                size="sm"
                variant="ghost"
                className="gap-2 text-xs text-muted-foreground hover:text-destructive"
                onClick={handleReset}
                disabled={sessionWords.length === 0}
              >
                <RotateCcw className="size-3.5" />
                Clear
              </Button>
            </div>

            {/* Error toast */}
            {history.error && (
              <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg px-3 py-2">
                Save failed: {history.error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
