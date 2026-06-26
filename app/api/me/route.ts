import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function decodeJWTPayload(token: string) {
  try {
    const base64url = token.split('.')[1]
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'))
  } catch {
    return null
  }
}

export async function GET() {
  const token = cookies().get('sintratel_token')?.value

  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const payload = decodeJWTPayload(token)
  if (!payload || payload.exp < Math.floor(Date.now() / 1000)) {
    return NextResponse.json({ error: 'Sesión expirada' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${payload.sub}&select=*&limit=1`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${token}`,
          },
        }
      )
      if (res.ok) {
        const profiles = await res.json()
        if (profiles.length > 0) return NextResponse.json(profiles[0])
      }
    } catch {
      // fallback below
    }
  }

  return NextResponse.json({
    id: payload.sub,
    email: payload.email ?? '',
    nombre: payload.email?.split('@')[0] ?? 'Admin',
    rol: 'super_admin',
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
}
