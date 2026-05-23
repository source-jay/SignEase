import { useCallback, useEffect, useRef, useState } from 'react'

import { useAuth } from '@/contexts/AuthContext'
import {
  clearHistory,
  deleteTranslation,
  fetchHistory,
  saveTranslation,
  updateTranslation,
  type TranslationRecord,
} from '@/services/translationHistory'
import { isSupabaseConfigured } from '@/services/supabase'

const LOCAL_STORAGE_KEY = 'signease_offline_history'

export function useTranslationHistory() {
  const { user } = useAuth()
  const [records, setRecords] = useState<TranslationRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sessionStartRef = useRef<number>(Date.now())

  const isAvailable = isSupabaseConfigured && !!user

  // ── Load History ─────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (isAvailable && user) {
        const data = await fetchHistory(user.id)
        setRecords(data)
      } else {
        // Local Storage fallback for offline mode
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (localData) {
          setRecords(JSON.parse(localData))
        } else {
          setRecords([])
        }
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [isAvailable, user])

  // Load history on mount / when availability changes
  useEffect(() => {
    void load()
  }, [load])

  // ── Save Record ──────────────────────────────────────────────────────────
  const save = useCallback(
    async (sentence: string, words: string[]) => {
      if (!sentence.trim()) return
      setIsSaving(true)
      setError(null)
      const durationSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000)

      try {
        if (isAvailable && user) {
          const record = await saveTranslation({
            userId: user.id,
            sentence,
            words,
            durationSeconds,
          })
          setRecords(prev => [record, ...prev])
        } else {
          // Offline local storage record
          const offlineRecord: TranslationRecord = {
            id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            user_id: user?.id || 'offline-user',
            sentence,
            words,
            word_count: words.length,
            duration_seconds: durationSeconds,
            is_favorite: false,
            notes: '',
            created_at: new Date().toISOString(),
          }
          const nextRecords = [offlineRecord, ...records]
          setRecords(nextRecords)
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextRecords))
        }
        // Reset session timer for the next translation
        sessionStartRef.current = Date.now()
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setIsSaving(false)
      }
    },
    [isAvailable, user, records],
  )

  // ── Update Record (Toggle Favorite / Edit Notes) ──────────────────────────
  const update = useCallback(
    async (id: string, updates: Partial<Pick<TranslationRecord, 'is_favorite' | 'notes'>>) => {
      setError(null)
      try {
        if (isAvailable && !id.startsWith('offline-')) {
          const updatedRecord = await updateTranslation(id, updates)
          setRecords(prev => prev.map(r => (r.id === id ? updatedRecord : r)))
        } else {
          // Local storage update
          const nextRecords = records.map(r => (r.id === id ? { ...r, ...updates } : r))
          setRecords(nextRecords)
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextRecords))
        }
      } catch (e) {
        setError((e as Error).message)
      }
    },
    [isAvailable, records],
  )

  // ── Remove Record ────────────────────────────────────────────────────────
  const remove = useCallback(
    async (id: string) => {
      setError(null)
      try {
        if (isAvailable && !id.startsWith('offline-')) {
          await deleteTranslation(id)
          setRecords(prev => prev.filter(r => r.id !== id))
        } else {
          // Local storage remove
          const nextRecords = records.filter(r => r.id !== id)
          setRecords(nextRecords)
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextRecords))
        }
      } catch (e) {
        setError((e as Error).message)
      }
    },
    [isAvailable, records],
  )

  // ── Clear All History ────────────────────────────────────────────────────
  const clear = useCallback(async () => {
    setError(null)
    try {
      if (isAvailable && user) {
        await clearHistory(user.id)
        setRecords([])
      } else {
        // Local storage clear
        setRecords([])
        localStorage.removeItem(LOCAL_STORAGE_KEY)
      }
    } catch (e) {
      setError((e as Error).message)
    }
  }, [isAvailable, user])

  const resetTimer = useCallback(() => {
    sessionStartRef.current = Date.now()
  }, [])

  return {
    records,
    isLoading,
    isSaving,
    error,
    isAvailable,
    save,
    update,
    remove,
    clear,
    reload: load,
    resetTimer,
  }
}
