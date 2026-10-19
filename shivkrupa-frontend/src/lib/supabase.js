import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabaseUrl = typeof rawUrl === 'string' ? rawUrl.trim() : ''
const supabaseAnonKey = typeof rawKey === 'string' ? rawKey.trim() : ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here' &&
  supabaseAnonKey !== 'your-actual-supabase-anon-key'
)

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase] Environment variables VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY are missing or using placeholder values. Please check your .env file.'
  )
}

// Create Supabase client instance
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'shivkrupa_auth_token',
    },
  }
)

export default supabase
