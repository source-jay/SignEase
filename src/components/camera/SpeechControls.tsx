import { ChevronDown, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { UseTextToSpeechReturn } from '@/hooks/useTextToSpeech'
import { cn } from '@/lib/utils'

interface SpeechControlsProps {
  tts: UseTextToSpeechReturn
  className?: string
}

export function SpeechControls({ tts, className }: SpeechControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  if (!tts.isSupported) {
    return null
  }

  return (
    <div className={cn('flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto', className)}>
      {/* Main row */}
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
        <Button
          id="tts-mute-toggle"
          variant={tts.isMuted ? 'secondary' : 'default'}
          size="sm"
          onClick={() => tts.setMuted(!tts.isMuted)}
          className="gap-2 transition-colors"
          title={tts.isMuted ? 'Unmute Voice' : 'Mute Voice'}
        >
          {tts.isMuted ? (
            <VolumeX className="size-4" />
          ) : (
            <Volume2
              className={cn(
                'size-4',
                tts.isSpeaking && 'animate-pulse text-primary-foreground',
              )}
            />
          )}
          <span className="hidden sm:inline">{tts.isMuted ? 'Muted' : 'Voice On'}</span>
        </Button>

        {tts.voices.length > 0 && !tts.isMuted && (
          <Select
            value={tts.selectedVoice?.name}
            onValueChange={val => {
              if (!val) return
              const voice = tts.voices.find(v => v.name === val)
              if (voice) tts.setSelectedVoice(voice)
            }}
          >
            <SelectTrigger
              id="tts-voice-select"
              className="w-[140px] h-9 text-xs bg-background/50 backdrop-blur-sm"
            >
              <SelectValue placeholder="Select Voice" />
            </SelectTrigger>
            <SelectContent>
              {tts.voices.map(voice => (
                <SelectItem key={voice.name} value={voice.name} className="text-xs">
                  {voice.name} ({voice.lang})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Advanced toggle */}
        {!tts.isMuted && (
          <Button
            id="tts-advanced-toggle"
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(p => !p)}
            className="gap-1 text-xs text-muted-foreground h-9 px-2"
            title="Voice settings"
          >
            <ChevronDown
              className={cn(
                'size-3.5 transition-transform duration-200',
                showAdvanced && 'rotate-180',
              )}
            />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        )}
      </div>

      {/* Advanced sliders */}
      {showAdvanced && !tts.isMuted && (
        <div className="flex flex-col gap-2 p-3 bg-card border border-border rounded-xl shadow-sm w-56 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Rate */}
          <div className="space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <label htmlFor="tts-rate-slider" className="font-medium">Speed</label>
              <span className="tabular-nums">{tts.rate.toFixed(1)}×</span>
            </div>
            <input
              id="tts-rate-slider"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={tts.rate}
              onChange={e => tts.setRate(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-muted-foreground/60">
              <span>Slow</span><span>Fast</span>
            </div>
          </div>

          {/* Pitch */}
          <div className="space-y-1 pt-1 border-t border-border">
            <div className="flex justify-between text-muted-foreground">
              <label htmlFor="tts-pitch-slider" className="font-medium">Pitch</label>
              <span className="tabular-nums">{tts.pitch.toFixed(1)}</span>
            </div>
            <input
              id="tts-pitch-slider"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={tts.pitch}
              onChange={e => tts.setPitch(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-muted-foreground/60">
              <span>Low</span><span>High</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
