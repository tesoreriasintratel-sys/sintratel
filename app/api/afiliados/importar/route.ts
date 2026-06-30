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

interface ImportRow {
  nombre_completo: string
  email: string
  cedula: string
  empresa: string
  rol_sindical: string
  cargo: string
  municipio: string
  sede_laboral: string
  departamento: string
  celular: string
}

export async function POST(request: Request) {
  try {
    const supabase = getRequestingUserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (profile?.rol !== 'super_admin' && profile?.rol !== 'read_write') {
      return NextResponse.json({ error: 'No tienes permisos para importar afiliados' }, { status: 403 })
    }

    const body = await request.json()
    const afiliados: ImportRow[] = body.afiliados

    if (!Array.isArray(afiliados) || afiliados.length === 0) {
      return NextResponse.json({ error: 'No se recibieron datos para importar' }, { status: 400 })
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    if (!serviceKey || serviceKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        error: 'SUPABASE_SERVICE_ROLE_KEY no está configurado correctamente.',
      }, { status: 500 })
    }

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    let imported = 0
    let updated = 0
    const errors: string[] = []
    const today = new Date().toISOString().split('T')[0]

    for (const row of afiliados) {
      if (!row.nombre_completo || !row.cedula) {
        errors.push(`Fila omitida: faltan nombre o cédula`)
        continue
      }

      const { data: existing } = await adminClient
        .from('afiliados')
        .select('id')
        .eq('cedula', row.cedula.trim())
        .maybeSingle()

      const payload = {
        nombre_completo: row.nombre_completo.trim(),
        cedula: row.cedula.trim(),
        email: row.email?.trim() || null,
        celular: row.celular?.trim() || null,
        empresa: row.empresa?.trim() || 'No especificada',
        cargo: row.cargo?.trim() || null,
        rol_sindical: row.rol_sindical?.trim() || null,
        municipio: row.municipio?.trim() || null,
        sede_laboral: row.sede_laboral?.trim() || null,
        departamento: row.departamento?.trim() || null,
        salario: 0,
        cuota_sindicato: 0,
        estado: 'activo',
        ...(existing ? {} : { fecha_ingreso: today }),
      }

      if (existing) {
        const { error: updateError } = await adminClient
          .from('afiliados')
          .update(payload)
          .eq('id', existing.id)

        if (updateError) {
          errors.push(`${row.nombre_completo} (${row.cedula}): ${updateError.message}`)
        } else {
          updated++
        }
      } else {
        const { error: insertError } = await adminClient
          .from('afiliados')
          .insert(payload)

        if (insertError) {
          errors.push(`${row.nombre_completo} (${row.cedula}): ${insertError.message}`)
        } else {
          imported++
        }
      }
    }

    return NextResponse.json({ success: true, imported, updated, errors })

  } catch (err) {
    console.error('[/api/afiliados/importar] error:', err)
    const message = err instanceof Error ? err.message : 'Error interno del servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
