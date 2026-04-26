const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

export function getSupabaseConfig(): { url: string; anonKey: string } | null {
  if (!hasSupabaseConfig()) {
    return null
  }

  return {
    url: supabaseUrl as string,
    anonKey: supabaseAnonKey as string,
  }
}