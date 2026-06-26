import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { pbkdf2Sync, randomBytes } from 'node:crypto'

const ADMIN_SECRET = process.env.ADMIN_TOKEN_SECRET ?? 'sintratel-secret-k9x2m7p4q8'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'tesoreriasintratel@gmail.com'

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex')
  return `${salt}:${hash}`
}

function isAuth(): boolean {
  const token = cookies().get('sintratel_token')?.value
  return !!token && token === ADMIN_SECRET
}

async function getRequesterRole(): Promise<string> {
  const email = cookies().get('sintratel_user')?.value ?? ADMIN_EMAIL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return 'super_admin'

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/admin_users?email=eq.${encodeURIComponent(email)}&select=rol&limit=1`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    )
    if (res.ok) {
      const rows = await res.json()
      if (rows[0]?.rol) return rows[0].rol
    }
  } catch {
    // fallback to super_admin
  }
  return 'super_admin'
}

export async function GET() {
  try {
    if (!isAuth()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/admin_users?select=id,email,nombre,rol,activo,created_at,updated_at&order=nombre.asc`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    )
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `Error al listar: ${err.slice(0, 200)}` }, { status: 500 })
    }
    return NextResponse.json(await res.json())
  } catch (err) {
    return NextResponse.json({ error: `Excepción GET: ${err instanceof Error ? err.message : String(err)}` }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!isAuth()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const rol = await getRequesterRole()
    if (rol !== 'super_admin') {
      return NextResponse.json({ error: 'Solo el Super Admin puede crear usuarios' }, { status: 403 })
    }

    const body = await request.json()
    const { nombre, email, password, rol: newRol } = body

    if (!nombre || !email || !password || !newRol) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }
    if (!['super_admin', 'lectura_escritura', 'solo_lectura'].includes(newRol)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
    }

    const password_hash = hashPassword(password)

    const res = await fetch(`${supabaseUrl}/rest/v1/admin_users`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        rol: newRol,
        password_hash,
        activo: true,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[POST /api/usuarios] Supabase error:', res.status, text)
      if (res.status === 409 || text.includes('duplicate') || text.includes('unique')) {
        return NextResponse.json({ error: 'Ya existe un usuario con ese correo' }, { status: 400 })
      }
      return NextResponse.json({ error: `Error al guardar (${res.status}): ${text.slice(0, 300)}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/usuarios] Excepción:', err)
    return NextResponse.json({ error: `Error interno: ${err instanceof Error ? err.message : String(err)}` }, { status: 500 })
  }
}
