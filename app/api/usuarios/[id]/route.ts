import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const ADMIN_SECRET = process.env.ADMIN_TOKEN_SECRET ?? 'sintratel-secret-k9x2m7p4q8'

function isAuthenticated() {
  const token = cookies().get('sintratel_token')?.value
  return !!token && token === ADMIN_SECRET
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.nombre !== undefined) patch.nombre = body.nombre
  if (body.rol !== undefined) patch.rol = body.rol
  if (body.activo !== undefined) patch.activo = body.activo

  const res = await fetch(
    `${supabaseUrl}/rest/v1/admin_users?id=eq.${params.id}`,
    {
      method: 'PATCH',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patch),
    }
  )

  if (!res.ok) return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  return NextResponse.json({ success: true })
}
