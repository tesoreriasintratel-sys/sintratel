import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Test 1: GET
  let getResult = ''
  try {
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key ?? '' },
    })
    getResult = `HTTP ${res.status}`
  } catch (e) {
    getResult = `FAIL: ${e instanceof Error ? e.message : 'unknown'}`
  }

  // Test 2: POST (credenciales falsas — esperamos HTTP 400, no "fetch failed")
  let postResult = ''
  try {
    const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: key ?? '' },
      body: JSON.stringify({ email: 'test@test.com', password: 'wrongpass' }),
    })
    postResult = `HTTP ${res.status}`
  } catch (e) {
    postResult = `FAIL: ${e instanceof Error ? e.message : 'unknown'}`
  }

  return NextResponse.json({
    runtime: 'live',
    supabase: {
      url: url ? url.slice(0, 42) : 'MISSING',
      key: key ? 'SET' : 'MISSING',
      get_test: getResult,
      post_test: postResult,
    },
    admin: {
      ADMIN_EMAIL: process.env.ADMIN_EMAIL ? 'SET' : 'MISSING',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? 'SET' : 'MISSING',
      ADMIN_TOKEN_SECRET: process.env.ADMIN_TOKEN_SECRET ? 'SET' : 'MISSING',
    },
  })
}
