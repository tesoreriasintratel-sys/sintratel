import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Test actual connection to Supabase
  let supabaseOk = false
  let supabaseError = ''
  try {
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key ?? '' },
    })
    supabaseOk = res.ok
    if (!res.ok) supabaseError = `HTTP ${res.status}`
  } catch (e: unknown) {
    supabaseError = e instanceof Error ? e.message : 'fetch failed'
  }

  return NextResponse.json({
    env: {
      SUPABASE_URL: url ? `${url.slice(0, 35)}...` : 'NO CONFIGURADO',
      SUPABASE_KEY: key ? `${key.slice(0, 20)}...` : 'NO CONFIGURADO',
    },
    supabase_connection: supabaseOk ? 'OK' : `ERROR: ${supabaseError}`,
  })
}
