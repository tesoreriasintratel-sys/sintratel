import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function getRequestingUserClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  )
}

export async function POST(request: Request) {
  const supabase = getRequestingUserClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (profile?.rol !== 'super_admin') {
    return NextResponse.json({ error: 'Solo el Super Admin puede crear usuarios' }, { status: 403 })
  }

  const body = await request.json()
  const { nombre, email, password, rol } = body

  if (!nombre || !email || !password || !rol) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const validRoles = ['super_admin', 'solo_lectura', 'lectura_escritura']
  if (!validRoles.includes(rol)) {
    return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  // Warn if service role key looks like the anon key (same JWT payload prefix)
  if (serviceKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({
      error: 'SUPABASE_SERVICE_ROLE_KEY no está configurado correctamente. Obtén la clave "service_role" en Supabase Dashboard → Settings → API y actualiza .env.local',
    }, { status: 500 })
  }

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre, rol },
  })

  if (createError) {
    console.error('[/api/usuarios/crear] createUser error:', createError)
    const message = createError.message.includes('already registered')
      ? 'Ya existe un usuario con ese correo'
      : createError.message
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (newUser?.user) {
    await adminClient
      .from('profiles')
      .update({ nombre, rol })
      .eq('id', newUser.user.id)
  }

  return NextResponse.json({ success: true })
}
