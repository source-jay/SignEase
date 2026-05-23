import { supabase, isSupabaseConfigured } from '@/services/supabase'

export interface ChatRecord {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

function assertClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.')
  }
  return supabase
}

/**
 * Fetch chronological chat history for a user.
 */
export async function fetchChatMessages(userId: string): Promise<ChatRecord[]> {
  const client = assertClient()
  const { data, error } = await client
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as ChatRecord[]
}

/**
 * Save a new chat message (either user or assistant).
 */
export async function saveChatMessage(
  userId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<ChatRecord> {
  const client = assertClient()
  const { data, error } = await client
    .from('chat_messages')
    .insert({
      user_id: userId,
      role,
      content
    })
    .select()
    .single()

  if (error) throw error
  return data as ChatRecord
}

/**
 * Clear all chat messages for a user.
 */
export async function clearChatMessages(userId: string): Promise<void> {
  const client = assertClient()
  const { error } = await client
    .from('chat_messages')
    .delete()
    .eq('user_id', userId)

  if (error) throw error
}
