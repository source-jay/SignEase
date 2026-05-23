import { supabase, isSupabaseConfigured } from '@/services/supabase'

export interface TranslationRecord {
  id: string
  user_id: string
  sentence: string
  words: string[]
  word_count: number
  duration_seconds: number
  is_favorite: boolean
  notes: string
  created_at: string
}

function assertClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.')
  }
  return supabase
}

/**
 * Save a completed translation session to the database.
 */
export async function saveTranslation(params: {
  userId: string
  sentence: string
  words: string[]
  durationSeconds: number
}): Promise<TranslationRecord> {
  const client = assertClient()
  const { data, error } = await client
    .from('translation_history')
    .insert({
      user_id: params.userId,
      sentence: params.sentence,
      words: params.words,
      word_count: params.words.length,
      duration_seconds: params.durationSeconds,
      is_favorite: false,
      notes: '',
    })
    .select()
    .single()

  if (error) throw error
  return data as TranslationRecord
}

/**
 * Fetch the most recent translation history for a user (newest first).
 */
export async function fetchHistory(
  userId: string,
  limit = 50,
): Promise<TranslationRecord[]> {
  const client = assertClient()
  const { data, error } = await client
    .from('translation_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as TranslationRecord[]
}

/**
 * Update a translation record (e.g. toggle favorite or save notes).
 */
export async function updateTranslation(
  id: string,
  updates: Partial<Pick<TranslationRecord, 'is_favorite' | 'notes'>>,
): Promise<TranslationRecord> {
  const client = assertClient()
  const { data, error } = await client
    .from('translation_history')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as TranslationRecord
}

/**
 * Delete a single history record.
 */
export async function deleteTranslation(id: string): Promise<void> {
  const client = assertClient()
  const { error } = await client
    .from('translation_history')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Delete all history for a user.
 */
export async function clearHistory(userId: string): Promise<void> {
  const client = assertClient()
  const { error } = await client
    .from('translation_history')
    .delete()
    .eq('user_id', userId)

  if (error) throw error
}
