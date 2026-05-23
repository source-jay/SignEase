import { Brain, Camera, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { CameraView } from '@/components/camera/CameraView'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { processLandmarks } from '@/services/ai/landmark-processing'
import { signModel } from '@/services/ai/SignLanguageModel'
import type { TrainingData } from '@/services/ai/SignLanguageModel'
import type { HandResult } from '@/types/hand-tracking'

export function TrainingPage() {
  const [handResults, setHandResults] = useState<HandResult | null>(null)
  const [label, setLabel] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [data, setData] = useState<TrainingData>({ features: [], labels: [] })
  const [isTraining, setIsTraining] = useState(false)
  const [trainingLog, setTrainingLog] = useState<string>('')
  const [classes, setClasses] = useState<string[]>([])

  useEffect(() => {
    // Load existing labels
    const checkModel = async () => {
      await signModel.loadModel()
      setClasses(signModel.getClasses())
    }
    void checkModel()
  }, [])

  // Record landmarks while button is held
  useEffect(() => {
    if (!isRecording || !handResults || handResults.landmarks.length === 0 || !label.trim()) return

    try {
      const features = processLandmarks(handResults.landmarks[0])
      setData(prev => ({
        features: [...prev.features, features],
        labels: [...prev.labels, label.trim().toUpperCase()]
      }))
    } catch (e) {
      console.error("Data collection error:", e)
    }
  }, [handResults, isRecording, label])

  const handleTrain = async () => {
    if (data.features.length === 0) return
    setIsTraining(true)
    setTrainingLog('Starting training...')

    try {
      await signModel.train(data, (epoch, logs) => {
        if (epoch % 10 === 0 || epoch === 49) {
          setTrainingLog(`Epoch ${epoch + 1}/50 - Loss: ${logs?.loss.toFixed(4)} - Acc: ${logs?.acc.toFixed(4)}`)
        }
      })
      setTrainingLog('Training complete! Model saved.')
      setClasses(signModel.getClasses())
      // Clear data to prevent memory issues, but model is saved
      setData({ features: [], labels: [] })
    } catch (e) {
      setTrainingLog(`Error: ${(e as Error).message}`)
    } finally {
      setIsTraining(false)
    }
  }

  const handleReset = async () => {
    if (confirm('Delete the current model and collected data?')) {
      await signModel.deleteModel()
      setData({ features: [], labels: [] })
      setClasses([])
      setTrainingLog('Model and data reset.')
    }
  }

  const sampleCountByLabel = data.labels.reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Train AI Model"
        description="Capture custom signs and train your personal recognition model."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:row-span-2 shadow-lg overflow-hidden flex flex-col min-h-[400px]">
          <div className="flex-1 relative">
            <CameraView onHandResults={setHandResults} />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="size-5 text-primary" />
              1. Collect Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Label (e.g. A, B, HELLO)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                maxLength={10}
                className="uppercase"
              />
              <Button
                onMouseDown={() => setIsRecording(true)}
                onMouseUp={() => setIsRecording(false)}
                onMouseLeave={() => setIsRecording(false)}
                onTouchStart={(e) => {
                  e.preventDefault()
                  setIsRecording(true)
                }}
                onTouchEnd={(e) => {
                  e.preventDefault()
                  setIsRecording(false)
                }}
                disabled={!label.trim()}
                variant={isRecording ? 'destructive' : 'default'}
                className="select-none min-w-[120px]"
              >
                {isRecording ? 'Recording...' : 'Hold to Record'}
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground border p-3 rounded-md bg-muted/50">
              <p className="font-medium mb-2 text-foreground">Current Session Data:</p>
              {Object.entries(sampleCountByLabel).map(([lbl, count]) => (
                <div key={lbl} className="flex justify-between">
                  <span>Sign "{lbl}"</span>
                  <span className="font-mono">{count} frames</span>
                </div>
              ))}
              {Object.keys(sampleCountByLabel).length === 0 && (
                <p>No data collected yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="size-5 text-accent" />
              2. Train & Manage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleTrain} 
              disabled={isTraining || data.features.length === 0}
              className="w-full gap-2"
            >
              <Save className="size-4" />
              {isTraining ? 'Training Model...' : 'Train & Save Model'}
            </Button>
            
            {trainingLog && (
              <p className="text-xs font-mono bg-primary/10 text-primary p-2 rounded">
                {trainingLog}
              </p>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Saved Model Classes:</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {classes.length > 0 ? classes.map(c => (
                  <span key={c} className="bg-secondary/20 text-secondary px-2 py-1 rounded text-xs font-bold">
                    {c}
                  </span>
                )) : <span className="text-sm text-muted-foreground">No model trained yet.</span>}
              </div>

              <Button 
                onClick={handleReset} 
                variant="outline" 
                className="w-full text-destructive hover:text-destructive gap-2"
              >
                <Trash2 className="size-4" />
                Reset Everything
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
