import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const ADMIN_SECRET = process.env.ADMIN_TOKEN_SECRET ?? 'sintratel-secret-k9x2m7p4q8'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'tesoreriasintratel@gmail.com'

export async function GET() {
  const token = cookies().get('sintratel_token')?.value

  if (!token || token !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/profiles?email=eq.${ADMIN_EMAIL}&select=*&limit=1`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      )
      if (res.ok) {
        const rows = await res.json()
        if (rows.length > 0) return NextResponse.json(rows[0])
      }
    } catch {
      // fallback
    }
  }

  return NextResponse.json({
    id: 'admin',
    email: ADMIN_EMAIL,
    nombre: 'Administrador',
    rol: 'super_admin',
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
}
