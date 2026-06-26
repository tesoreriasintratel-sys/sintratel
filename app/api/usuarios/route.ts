import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { pbkdf2Sync, randomBytes } from 'crypto'

const ADMIN_SECRET = process.env.ADMIN_TOKEN_SECRET ?? 'sintratel-secret-k9x2m7p4q8'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'tesoreriasintratel@gmail.com'

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex')
  return `${salt}:${hash}`
}

async function getRequester() {
  const cookieStore = cookies()
  const token = cookieStore.get('sintratel_token')?.value
  if (!token || token !== ADMIN_SECRET) return null

  const email = cookieStore.get('sintratel_user')?.value ?? ADMIN_EMAIL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return null

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/admin_users?email=eq.${encodeURIComponent(email)}&select=id,rol&limit=1`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    )
    if (res.ok) {
      const rows = await res.json()
      return rows[0] ?? null
    }
  } catch {
    // fallback: assume super_admin if can't reach DB (super admin uses hardcoded creds)
  }

  // If we can't query DB but token is valid, grant access (super admin fallback)
  return { id: '00000000-0000-0000-0000-000000000001', rol: 'super_admin' }
}

export async function GET() {
  const cookieStore = cookies()
  const token = cookieStore.get('sintratel_token')?.value
  if (!token || token !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'No configurado' }, { status: 500 })
  }

  const res = await fetch(
    `${supabaseUrl}/rest/v1/admin_users?select=id,email,nombre,rol,activo,created_at,updated_at&order=nombre.asc`,
    { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
  )

  if (!res.ok) return NextResponse.json({ error: 'Error al listar usuarios' }, { status: 500 })
  return NextResponse.json(await res.json())
}

export async function POST(request: Request) {
  const me = await getRequester()
  if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (me.rol !== 'super_admin') {
    return NextResponse.json({ error: 'Solo el Super Admin puede crear usuarios' }, { status: 403 })
  }

  const body = await request.json()
  const { nombre, email, password, rol } = body

  if (!nombre || !email || !password || !rol) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }
  if (!['super_admin', 'lectura_escritura', 'solo_lectura'].includes(rol)) {
    return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const password_hash = hashPassword(password)

  const res = await fetch(`${supabaseUrl}/rest/v1/admin_users`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ nombre: nombre.trim(), email: email.trim().toLowerCase(), rol, password_hash, activo: true }),
  })

  if (res.status === 409 || res.status === 422) {
    return NextResponse.json({ error: 'Ya existe un usuario con ese correo' }, { status: 400 })
  }
  if (!res.ok) {
    const text = await res.text()
    if (text.includes('duplicate')) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese correo' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
