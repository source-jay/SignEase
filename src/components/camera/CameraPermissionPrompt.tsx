import { Camera, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { CameraState } from '@/types/hand-tracking'

interface CameraPermissionPromptProps {
  state: CameraState
  onEnable: () => void
  error?: string | null
}

export function CameraPermissionPrompt({ state, onEnable, error }: CameraPermissionPromptProps) {
  const isDenied = state === 'denied' || state === 'error'

  return (
    <Card className="mx-auto max-w-md mt-12 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
          <Camera className={`size-8 ${isDenied ? 'text-destructive' : 'text-primary'}`} />
        </div>
        <CardTitle className="text-2xl">
          {isDenied ? 'Camera Access Denied' : 'Enable Camera'}
        </CardTitle>
        <CardDescription className="text-base mt-2">
          SignEase needs access to your camera to translate your signs in real-time.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col gap-6 pt-4">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex gap-2 items-start text-left">
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {isDenied ? (
          <div className="text-sm text-muted-foreground text-left space-y-2 bg-muted p-4 rounded-md">
            <p className="font-medium text-foreground">How to fix this:</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Look for the camera icon in your browser's address bar</li>
              <li>Click it and select "Always allow"</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        ) : (
          <Button 
            size="lg" 
            onClick={onEnable}
            disabled={state === 'requesting'}
            className="w-full text-lg h-12"
          >
            {state === 'requesting' ? 'Requesting...' : 'Allow Camera Access'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
