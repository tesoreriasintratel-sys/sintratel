import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  let step = 'start'
  try {
    step = 'reading_body'
    const body = await request.text()

    step = 'parsing_json'
    const { email, password } = JSON.parse(body)

    step = 'checking_env'
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'ENV VARS MISSING', step }, { status: 500 })
    }

    step = 'fetching_supabase'
    const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: supabaseKey },
      body: JSON.stringify({ email, password }),
    })

    step = 'reading_response'
    const data = await res.json()

    step = 'checking_result'
    if (!res.ok) {
      const msg = data.error_description ?? data.msg ?? data.error ?? 'Credenciales incorrectas'
      return NextResponse.json({ error: msg, step }, { status: 400 })
    }

    step = 'setting_cookies'
    const response = NextResponse.json({ success: true })
    response.cookies.set('sintratel_token', data.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: data.expires_in ?? 3600,
      path: '/',
    })
    if (data.refresh_token) {
      response.cookies.set('sintratel_refresh', data.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
    }
    return response

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const type = err instanceof Error ? err.constructor.name : typeof err
    return NextResponse.json({ error: msg, errorType: type, step }, { status: 500 })
  }
}
