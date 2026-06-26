import { NextResponse } from 'next/server'
import { pbkdf2Sync } from 'crypto'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'tesoreriasintratel@gmail.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Panel2026!'
const ADMIN_SECRET = process.env.ADMIN_TOKEN_SECRET ?? 'sintratel-secret-k9x2m7p4q8'

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const derived = pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex')
  return derived === hash
}

function setCookies(response: NextResponse, email: string) {
  const opts = { httpOnly: true, secure: true, sameSite: 'lax' as const, maxAge: 60 * 60 * 8, path: '/' }
  response.cookies.set('sintratel_token', ADMIN_SECRET, opts)
  response.cookies.set('sintratel_user', email, opts)
}

export async function POST(request: Request) {
  try {
    const { email, password } = JSON.parse(await request.text())

    // Super admin via env vars
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true })
      setCookies(response, email)
      return response
    }

    // Check admin_users table
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/admin_users?email=eq.${encodeURIComponent(email)}&select=*&limit=1`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      )
      if (res.ok) {
        const rows = await res.json()
        const user = rows[0]
        if (user && user.activo && user.password_hash && verifyPassword(password, user.password_hash)) {
          const response = NextResponse.json({ success: true })
          setCookies(response, email)
          return response
        }
      }
    }

    return NextResponse.json({ error: 'Correo o contraseña incorrectos' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
