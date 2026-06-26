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

export async function POST(request: Request) {
  try {
    console.log('[POST /api/usuarios/crear] inicio')

    // 1. Verificar autenticación
    const token = cookies().get('sintratel_token')?.value
    if (!token || token !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // 2. Verificar rol super_admin via admin_users
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
    }

    const email_solicitante = cookies().get('sintratel_user')?.value ?? ADMIN_EMAIL
    const roleRes = await fetch(
      `${supabaseUrl}/rest/v1/admin_users?email=eq.${encodeURIComponent(email_solicitante)}&select=rol&limit=1`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    )
    let rolSolicitante = 'super_admin'
    if (roleRes.ok) {
      const rows = await roleRes.json()
      if (rows[0]?.rol) rolSolicitante = rows[0].rol
    }

    if (rolSolicitante !== 'super_admin') {
      return NextResponse.json({ error: 'Solo el Super Admin puede crear usuarios' }, { status: 403 })
    }

    // 3. Leer y validar body
    const bodyText = await request.text()
    console.log('[POST /api/usuarios/crear] body recibido:', bodyText)
    if (!bodyText) {
      return NextResponse.json({ error: 'Body vacío' }, { status: 400 })
    }

    const { nombre, email, password, rol } = JSON.parse(bodyText)

    if (!nombre || !email || !password || !rol) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }
    if (!['super_admin', 'read_write', 'read_only'].includes(rol)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }

    const emailLower = email.trim().toLowerCase()
    const nombreTrim = nombre.trim()

    // 4. Crear usuario en Supabase Auth (requiere service_role key)
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    console.log('[POST /api/usuarios/crear] service key exists:', !!serviceKey)
    console.log('[POST /api/usuarios/crear] service key starts with:', serviceKey?.substring(0, 20))

    if (!serviceKey) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY no configurado' }, { status: 500 })
    }

    let newUserId: string | null = null

    const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ email: emailLower, password, email_confirm: true }),
    })

    const authText = await authRes.text()
    console.log('[POST /api/usuarios/crear] auth response:', authRes.status, authText)

    if (!authRes.ok) {
      const errMsg = authText.includes('already registered') || authText.includes('already exists')
        ? 'Ya existe un usuario con ese correo'
        : `Error auth (${authRes.status}): ${authText.slice(0, 300)}`
      return NextResponse.json({ error: errMsg }, { status: 400 })
    }

    const authData = JSON.parse(authText)
    newUserId = authData.id ?? authData.user?.id ?? null

    // 5. Insertar en user_profiles
    if (newUserId) {
      const profileRes = await fetch(`${supabaseUrl}/rest/v1/user_profiles`, {
        method: 'POST',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ id: newUserId, nombre: nombreTrim, email: emailLower, rol, activo: true }),
      })
      const profileText = await profileRes.text()
      console.log('[POST /api/usuarios/crear] user_profiles insert:', profileRes.status, profileText)
      if (!profileRes.ok) {
        console.error('[POST /api/usuarios/crear] user_profiles error:', profileText)
      }
    }

    // 6. Insertar en admin_users para que pueda iniciar sesión
    const password_hash = hashPassword(password)
    const adminRes = await fetch(`${supabaseUrl}/rest/v1/admin_users`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ nombre: nombreTrim, email: emailLower, rol, password_hash, activo: true }),
    })
    const adminText = await adminRes.text()
    console.log('[POST /api/usuarios/crear] admin_users insert:', adminRes.status, adminText)

    if (!adminRes.ok && !adminText.includes('duplicate') && !adminText.includes('unique')) {
      console.error('[POST /api/usuarios/crear] admin_users error:', adminText)
    }

    return NextResponse.json({ success: true, user: { id: newUserId, email: emailLower, nombre: nombreTrim, rol } })
  } catch (err) {
    console.error('[POST /api/usuarios/crear] excepción:', err)
    return NextResponse.json({ error: `Error interno: ${err instanceof Error ? err.message : String(err)}` }, { status: 500 })
  }
}
