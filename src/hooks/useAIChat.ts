import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '@/contexts/AuthContext'
import {
  clearChatMessages,
  fetchChatMessages,
  saveChatMessage,
  type ChatRecord,
} from '@/services/chatStorage'
import { sendOpenAIChat } from '@/services/ai/openai'
import { isSupabaseConfigured } from '@/services/supabase'

const LOCAL_STORAGE_KEY = 'signease_offline_chat'

export function useAIChat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAvailable = isSupabaseConfigured && !!user

  // ── Load Chat History ────────────────────────────────────────────────────
  const loadMessages = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (isAvailable && user) {
        const data = await fetchChatMessages(user.id)
        setMessages(data)
      } else {
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (localData) {
          setMessages(JSON.parse(localData))
        } else {
          setMessages([
            {
              id: 'welcome-msg',
              user_id: 'offline-user',
              role: 'assistant',
              content: `👋 Hello! I am the **SignEase AI Assistant**.

I can help you:
- Learn how to **record & train** custom ASL gestures.
- **Troubleshoot** camera, hand tracking, or offline configurations.
- Understand American Sign Language principles.

Ask me any questions, or select a prompt below to get started!`,
              created_at: new Date().toISOString(),
            },
          ])
        }
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [isAvailable, user])

  // Load chat on mount
  useEffect(() => {
    void loadMessages()
  }, [loadMessages])

  // ── Send Message ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isSending) return
      setIsSending(true)
      setError(null)

      const userMessageContent = content.trim()
      let updatedMessagesList = [...messages]

      try {
        // 1. Save User Message
        let userRecord: ChatRecord
        if (isAvailable && user) {
          userRecord = await saveChatMessage(user.id, 'user', userMessageContent)
        } else {
          userRecord = {
            id: `user-msg-${Date.now()}`,
            user_id: user?.id || 'offline-user',
            role: 'user',
            content: userMessageContent,
            created_at: new Date().toISOString(),
          }
          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify([...updatedMessagesList, userRecord])
          )
        }
        updatedMessagesList = [...updatedMessagesList, userRecord]
        setMessages(updatedMessagesList)

        // 2. Query OpenAI API
        const formattedHistory = updatedMessagesList.map(m => ({
          role: m.role,
          content: m.content,
        }))
        const aiResponseText = await sendOpenAIChat(formattedHistory)

        // 3. Save Assistant Message
        let aiRecord: ChatRecord
        if (isAvailable && user) {
          aiRecord = await saveChatMessage(user.id, 'assistant', aiResponseText)
        } else {
          aiRecord = {
            id: `assistant-msg-${Date.now()}`,
            user_id: user?.id || 'offline-user',
            role: 'assistant',
            content: aiResponseText,
            created_at: new Date().toISOString(),
          }
          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify([...updatedMessagesList, aiRecord])
          )
        }
        setMessages(prev => [...prev, aiRecord])
      } catch (e) {
        setError((e as Error).message)

        // ── Smart Fallback: Local Assistant Responses if OpenAI Key is Out of Quota ──
        const lowerQuery = userMessageContent.toLowerCase()
        let localResponse = ''

        if (lowerQuery.includes('use of this app') || lowerQuery.includes('what is signease')) {
          localResponse = `💡 **SignEase** is a Progressive Web Application designed to bridge communication gaps for the deaf and hard-of-hearing community. 
          
It captures sign language gestures via your camera, processes them through an on-device MediaPipe hand tracking pipeline, translates them in real-time using a custom TensorFlow.js model, and speaks the results using text-to-speech!`
        } else if (lowerQuery.includes('train') || lowerQuery.includes('record')) {
          localResponse = `📝 **How to Train a Custom Gesture:**
1. Navigate to the **Train AI** page on the sidebar.
2. Type the label of the sign you want to train (e.g. "Hello").
3. Position your hand inside the camera view and click **Record**.
4. Hold the gesture steadily or perform subtle movements. Collect **30 to 50 frames**.
5. Do this for at least **2 distinct sign classes**.
6. Click **Train Model** to compile the classifier locally using TensorFlow.js in your browser!`
        } else if (lowerQuery.includes('camera') || lowerQuery.includes('troubleshoot') || lowerQuery.includes('block')) {
          localResponse = `📷 **Camera & Pipeline Troubleshooting Guide:**
* **Permission Blocked:** Click the lock icon in your browser's address bar next to the URL, toggle the camera permission to **Allow**, and reload the page.
* **Hand Tracking Fails:** Make sure your hands are clearly visible in front of the camera and well-lit.
* **GPU Acceleration:** Verify hardware speedups are turned on in your browser's system settings under "Use hardware acceleration when available" for smooth real-time performance.`
        } else if (lowerQuery.includes('scale') || lowerQuery.includes('normalization') || lowerQuery.includes('invariance')) {
          localResponse = `📏 **ASL Scale Normalization & Invariance:**
SignEase utilizes advanced landmark pre-processing to ensure recognition works regardless of how close or far your hand is from the camera:
1. **Translation Invariance:** We translate the hand landmarks so the wrist is always at the origin \`(0,0,0)\`.
2. **Scale Invariance:** We normalize all landmark coordinates based on the maximum distance from the wrist.
3. This guarantees that your model recognizes signs accurately, whether you are close to the camera or far away!`
        } else if (lowerQuery.includes('learning') || lowerQuery.includes('guide') || lowerQuery.includes('tips')) {
          localResponse = `👋 **Welcome to the SignEase Learning & Onboarding Guide!**
* **Step 1:** Go to the **Train AI** tab to record custom signs.
* **Step 2:** Navigate to the **Translate** tab to test real-time sign recognition.
* **Step 3:** Enable **Auto-Speak** on the Translation board to get instant text-to-speech audio feedback.
* **Step 4:** Visit **History** to review past translations, add notes/annotations, or export logs as CSV/JSON files.`
        }

        if (localResponse) {
          const localRecord: ChatRecord = {
            id: `local-msg-${Date.now()}`,
            user_id: user?.id || 'offline-user',
            role: 'assistant',
            content: `ℹ️ *[Local Fallback Mode]*\n\n${localResponse}`,
            created_at: new Date().toISOString(),
          }
          setMessages(prev => [...prev, localRecord])
          if (!isAvailable) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...updatedMessagesList, localRecord]))
          }
        } else {
          // Standard error message if no local fallback matches the user's manual query
          const errorRecord: ChatRecord = {
            id: `err-msg-${Date.now()}`,
            user_id: user?.id || 'offline-user',
            role: 'assistant',
            content: `⚠️ **OpenAI Billing Quota Exceeded**:
            
Your OpenAI API Key is currently out of credits or has expired. 

To solve this and enable full GPT conversational features:
1. Visit the [OpenAI Billing Platform](https://platform.openai.com/settings/organization/billing).
2. Purchase pre-paid credits (minimum $5).
3. If necessary, generate a new key and update the \`VITE_OPENAI_API_KEY\` variable in your \`.env\` file.
4. *Tip*: While your API key is out of quota, you can still click the prompt chips below to get instant answers using my built-in local knowledge database!`,
            created_at: new Date().toISOString(),
          }
          setMessages(prev => [...prev, errorRecord])
        }
      } finally {
        setIsSending(false)
      }
    },
    [isAvailable, user, messages, isSending]
  )

  // ── Clear Chat History ───────────────────────────────────────────────────
  const clearChat = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      if (isAvailable && user) {
        await clearChatMessages(user.id)
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY)
      }
      setMessages([
        {
          id: 'welcome-msg-reset',
          user_id: user?.id || 'offline-user',
          role: 'assistant',
          content: `🧹 Chat log cleared. How can I assist you with **SignEase** now?`,
          created_at: new Date().toISOString(),
        },
      ])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [isAvailable, user])

  return {
    messages,
    isLoading,
    isSending,
    error,
    isAvailable,
    sendMessage,
    clearChat,
    reload: loadMessages,
  }
}
