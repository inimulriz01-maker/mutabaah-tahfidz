import { createClient } from '@supabase/supabase-js'

const normalizeSupabaseUrl = (value) => {
  if (!value) return ''

  const trimmed = value.trim().replace(/\/+$/, '')
  if (!trimmed) return ''

  const dashboardMatch = trimmed.match(/https?:\/\/(?:supabase\.com|app\.supabase\.com)\/(?:dashboard\/project|project)\/([^/?#]+)/i)
  if (dashboardMatch) {
    return `https://${dashboardMatch[1]}.supabase.co`
  }

  return trimmed
}

const fallbackSupabaseUrl = 'https://qugsplokhvfiwdqzeshk.supabase.co'
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || fallbackSupabaseUrl
const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl) || fallbackSupabaseUrl
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

const isPlaceholderValue = (value) => {
  if (!value) return true
  return value.includes('<') || value.includes('your-') || value === 'your-project-ref' || value === 'your-anon-public-key'
}

export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  isConfigured: Boolean(supabaseUrl && supabaseAnonKey && !isPlaceholderValue(supabaseUrl) && !isPlaceholderValue(supabaseAnonKey)),
}

export const supabase = supabaseConfig.isConfigured
  ? createClient(supabaseConfig.url, supabaseConfig.anonKey)
  : null