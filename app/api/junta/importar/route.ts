import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const ADMIN_SECRET = process.env.ADMIN_TOKEN_SECRET ?? 'sintratel-secret-k9x2m7p4q8'

interface ImportRow {
  nombre: string
  email: string
  cedula: string
  empresa: string
  cargo_junta: string
  municipio: string
  sede_laboral: string
  departamento: string
  celular: string
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('sintratel_token')?.value
    if (!token || token !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const miembros: ImportRow[] = body.miembros

    if (!Array.isArray(miembros) || miembros.length === 0) {
      return NextResponse.json({ error: 'No se recibieron datos' }, { status: 400 })
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    let imported = 0
    let updated = 0
    const errors: string[] = []

    for (const row of miembros) {
      if (!row.nombre) {
        errors.push('Fila omitida: falta nombre')
        continue
      }

      const { data: existing } = await adminClient
        .from('junta_directiva')
        .select('id')
        .eq('nombre', row.nombre.trim())
        .maybeSingle()

      const payload = {
        nombre: row.nombre.trim(),
        cedula: row.cedula?.trim() || null,
        email: row.email?.trim() || null,
        celular: row.celular?.trim() || null,
        empresa: row.empresa?.trim() || null,
        municipio: row.municipio?.trim() || null,
        sede_laboral: row.sede_laboral?.trim() || null,
        departamento: row.departamento?.trim() || null,
        cargo: row.cargo_junta?.trim() || 'Sin cargo',
        activo: true,
        fecha_inicio: null,
        fecha_fin: null,
      }

      if (existing) {
        const { error: updateError } = await adminClient
          .from('junta_directiva')
          .update(payload)
          .eq('id', existing.id)
        if (updateError) {
          errors.push(`${row.nombre}: ${updateError.message}`)
        } else {
          updated++
        }
      } else {
        const { error: insertError } = await adminClient
          .from('junta_directiva')
          .insert(payload)
        if (insertError) {
          errors.push(`${row.nombre}: ${insertError.message}`)
        } else {
          imported++
        }
      }
    }

    return NextResponse.json({ success: true, imported, updated, errors })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
