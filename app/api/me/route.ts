import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const ADMIN_SECRET = process.env.ADMIN_TOKEN_SECRET ?? 'sintratel-secret-k9x2m7p4q8'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'tesoreriasintratel@gmail.com'

export async function GET() {
  const cookieStore = cookies()
  const token = cookieStore.get('sintratel_token')?.value

  if (!token || token !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const email = cookieStore.get('sintratel_user')?.value ?? ADMIN_EMAIL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/admin_users?email=eq.${encodeURIComponent(email)}&select=id,email,nombre,rol,activo,created_at,updated_at&limit=1`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      )
      if (res.ok) {
        const rows = await res.json()
        if (rows.length > 0) return NextResponse.json(rows[0])
      }
    } catch {
      // fallback below
    }
  }

  return NextResponse.json({
    id: '00000000-0000-0000-0000-000000000001',
    email,
    nombre: 'Administrador',
    rol: 'super_admin',
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
}
