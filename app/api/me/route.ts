import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const token = cookies().get('sintratel_token')?.value
  const secret = process.env.ADMIN_TOKEN_SECRET

  if (!token || !secret || token !== secret) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? ''
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/profiles?email=eq.${adminEmail}&select=*&limit=1`,
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
    id: 'admin',
    email: adminEmail,
    nombre: 'Administrador',
    rol: 'super_admin',
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
}
