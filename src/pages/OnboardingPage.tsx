import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Hand,
  MessageSquare,
  Volume2,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { ROUTES } from '@/utils/constants'
import { setOnboardingComplete } from '@/utils/storage'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    icon: Hand,
    title: 'Sign to text in real time',
    description:
      'Point your camera at ASL gestures and watch them become readable text instantly.',
  },
  {
    icon: Volume2,
    title: 'Hear every translation',
    description:
      'Turn translated text into natural speech with adjustable voice settings.',
  },
  {
    icon: Camera,
    title: 'Camera-powered recognition',
    description:
      'AI hand tracking detects landmarks and interprets signs with confidence scores.',
  },
  {
    icon: MessageSquare,
    title: 'Your communication hub',
    description:
      'Save history, favorite phrases, and get help from the built-in AI assistant.',
  },
] as const

export function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [permissionNote, setPermissionNote] = useState<string | null>(null)

  const finish = useCallback(() => {
    setOnboardingComplete()
    navigate(ROUTES.login, { replace: true })
  }, [navigate])

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach((t) => t.stop())
      setPermissionNote('Camera access granted.')
    } catch {
      setPermissionNote(
        'Camera access was denied. You can enable it later in Settings.',
      )
    }
  }

  const requestMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())
      setPermissionNote('Microphone access granted.')
    } catch {
      setPermissionNote(
        'Microphone access was denied. You can enable it later in Settings.',
      )
    }
  }

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          aria-label="Previous step"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <Button type="button" variant="ghost" onClick={finish}>
          Skip
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-8">
        <div
          className="flex size-28 items-center justify-center rounded-3xl bg-primary/10 text-primary"
          key={step}
        >
          <Icon className="size-14" aria-hidden />
        </div>
        <h1 className="mt-8 max-w-md text-center text-2xl font-bold md:text-3xl">
          {current.title}
        </h1>
        <p className="mt-4 max-w-md text-center text-lg text-muted-foreground">
          {current.description}
        </p>

        {step >= 2 && (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button type="button" variant="outline" onClick={requestCamera}>
              Allow camera
            </Button>
            <Button type="button" variant="outline" onClick={requestMicrophone}>
              Allow microphone
            </Button>
          </div>
        )}
        {permissionNote && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {permissionNote}
          </p>
        )}
      </main>

      <footer className="space-y-6 px-6 pb-10">
        <div className="flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              className={cn(
                'size-2.5 rounded-full transition-colors',
                i === step ? 'bg-primary' : 'bg-border',
              )}
              onClick={() => setStep(i)}
              aria-label={`Go to step ${i + 1}`}
              aria-current={i === step ? 'step' : undefined}
            />
          ))}
        </div>
        <Button
          type="button"
          className="h-12 w-full text-base"
          onClick={() => {
            if (isLast) finish()
            else setStep((s) => s + 1)
          }}
        >
          {isLast ? 'Get started' : 'Next'}
          {!isLast && <ChevronRight className="size-5" />}
        </Button>
      </footer>
    </div>
  )
}
