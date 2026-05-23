const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface APIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `You are the SignEase AI Assistant, a helpful and friendly in-app helper inside the SignEase PWA.
SignEase is a Progressive Web Application that translates American Sign Language (ASL) gestures from a camera feed into real-time text and synthesized audio.

Your objectives:
1. Provide friendly onboarding support and guides.
2. Troubleshoot camera permission blocks, hand landmarker loading failures, and general PWA errors.
3. Teach ASL concepts (e.g. hand coordinates, translation, scale normalization, training custom gestures).
4. Give users advice on how to correctly train gestures:
   - Hold the sign stably while recording.
   - Collect at least 30-50 frames per gesture class.
   - Make sure they collect at least 2 distinct classes to train a classifier.
   - Keep hand within camera viewport, wrist is origin (0,0,0).

Keep responses structured, concise, formatting with standard Markdown (bold, lists, etc.) to ensure readability on mobile screens. Do not reference external links that are unavailable. Maintain a warm, encouraging tone.`

/**
 * Sends a list of messages to the OpenAI Chat Completion API.
 */
export async function sendOpenAIChat(
  chatMessages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) {
    throw new Error(
      'OpenAI API Key is missing. Please make sure VITE_OPENAI_API_KEY is configured in your .env file.'
    )
  }

  const apiMessages: APIMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...chatMessages.map(m => ({ role: m.role, content: m.content }))
  ]

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 600
      })
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      const errMsg = errData?.error?.message || `HTTP status ${response.status}`
      throw new Error(`OpenAI API Error: ${errMsg}`)
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('Received an empty completion response from OpenAI.')
    }

    return content
  } catch (e) {
    console.error('OpenAI fetch failure:', e)
    throw e
  }
}
