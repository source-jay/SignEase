import * as tf from '@tensorflow/tfjs'

export const MODEL_STORAGE_PATH = 'indexeddb://signease-asl-model'
export const LABELS_STORAGE_KEY = 'signease_model_labels'

export interface TrainingData {
  features: number[][] // Array of flattened normalized landmarks (length 63)
  labels: string[]     // String labels for each feature array
}

export class SignLanguageModel {
  private model: tf.Sequential | null = null
  private labels: string[] = []

  /**
   * Loads an existing model from IndexedDB if available.
   */
  async loadModel(): Promise<boolean> {
    try {
      this.model = await tf.loadLayersModel(MODEL_STORAGE_PATH) as tf.Sequential
      
      const storedLabels = localStorage.getItem(LABELS_STORAGE_KEY)
      if (storedLabels) {
        this.labels = JSON.parse(storedLabels)
      }
      return true
    } catch (e) {
      console.log('No existing model found or error loading:', e)
      return false
    }
  }

  /**
   * Gets the list of classes the current model knows.
   */
  getClasses(): string[] {
    return this.labels
  }

  /**
   * Delete the stored model and reset.
   */
  async deleteModel(): Promise<void> {
    try {
      await tf.io.removeModel(MODEL_STORAGE_PATH)
    } catch (e) {
      // ignore
    }
    localStorage.removeItem(LABELS_STORAGE_KEY)
    this.model = null
    this.labels = []
  }

  /**
   * Creates, compiles, and trains a new Neural Network on the provided data.
   */
  async train(
    data: TrainingData, 
    onEpochEnd?: (epoch: number, logs?: tf.Logs) => void
  ): Promise<void> {
    if (data.features.length === 0) throw new Error("No training data provided")
    
    // Extract unique labels to form our vocabulary/classes
    this.labels = Array.from(new Set(data.labels)).sort()
    if (this.labels.length < 2) {
      throw new Error("Need at least 2 different signs to train a classifier")
    }

    // Convert string labels to numerical indices
    const labelIndices = data.labels.map(l => this.labels.indexOf(l))
    
    // Prepare tensors
    const xs = tf.tensor2d(data.features)
    const ys = tf.oneHot(tf.tensor1d(labelIndices, 'int32'), this.labels.length)

    // Build model topology
    this.model = tf.sequential()
    
    // Input layer: 63 features (21 landmarks * 3 coordinates)
    this.model.add(tf.layers.dense({
      units: 128,
      activation: 'relu',
      inputShape: [63]
    }))
    this.model.add(tf.layers.dropout({ rate: 0.2 }))
    
    // Hidden layer
    this.model.add(tf.layers.dense({
      units: 64,
      activation: 'relu'
    }))
    this.model.add(tf.layers.dropout({ rate: 0.2 }))
    
    // Output layer: one unit per class with softmax
    this.model.add(tf.layers.dense({
      units: this.labels.length,
      activation: 'softmax'
    }))

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    })

    // Train the model
    await this.model.fit(xs, ys, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.1, // Use 10% of data to validate during training
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (onEpochEnd) onEpochEnd(epoch, logs)
        }
      }
    })

    // Cleanup tensors
    xs.dispose()
    ys.dispose()

    // Save the model and labels to browser storage
    await this.model.save(MODEL_STORAGE_PATH)
    localStorage.setItem(LABELS_STORAGE_KEY, JSON.stringify(this.labels))
  }

  /**
   * Predicts the sign for a single normalized landmark array.
   */
  async predict(features: number[]): Promise<{ label: string; confidence: number } | null> {
    if (!this.model || this.labels.length === 0) return null

    // Wrap the features in a tensor and run prediction
    const inputTensor = tf.tensor2d([features])
    const predictionTensor = this.model.predict(inputTensor) as tf.Tensor
    
    // Get the probabilities array
    const probabilities = await predictionTensor.data()
    inputTensor.dispose()
    predictionTensor.dispose()

    // Find the highest probability
    let maxIdx = 0
    let maxProb = 0
    for (let i = 0; i < probabilities.length; i++) {
      if (probabilities[i] > maxProb) {
        maxProb = probabilities[i]
        maxIdx = i
      }
    }

    return {
      label: this.labels[maxIdx],
      confidence: maxProb
    }
  }
}

// Export a singleton instance
export const signModel = new SignLanguageModel()
