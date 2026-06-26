import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import UsuariosTable from '@/components/admin/usuarios/UsuariosTable'
import type { Profile } from '@/types'

const ADMIN_SECRET = process.env.ADMIN_TOKEN_SECRET ?? 'sintratel-secret-k9x2m7p4q8'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'tesoreriasintratel@gmail.com'

async function getAdminProfile(): Promise<Profile | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('sintratel_token')?.value
  if (!token || token !== ADMIN_SECRET) return null

  const email = cookieStore.get('sintratel_user')?.value ?? ADMIN_EMAIL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return null

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/admin_users?email=eq.${encodeURIComponent(email)}&select=id,email,nombre,rol,activo,created_at,updated_at&limit=1`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }, cache: 'no-store' }
    )
    if (res.ok) {
      const rows = await res.json()
      return rows[0] ?? null
    }
  } catch {
    // fallback
  }

  return {
    id: '00000000-0000-0000-0000-000000000001',
    email,
    nombre: 'Administrador',
    rol: 'super_admin',
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

async function listUsers(): Promise<Profile[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return []

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/admin_users?select=id,email,nombre,rol,activo,created_at,updated_at&order=nombre.asc`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }, cache: 'no-store' }
    )
    if (res.ok) return await res.json()
  } catch {
    // ignore
  }
  return []
}

export default async function UsuariosPage() {
  const profile = await getAdminProfile()
  if (!profile) redirect('/admin/login')

  if (profile.rol !== 'super_admin') {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <Alert variant="destructive">
          <ShieldAlert size={16} />
          <AlertDescription>
            No tienes permisos para acceder a la gestión de usuarios.
            Esta sección es exclusiva del Super Administrador.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const usuarios = await listUsers()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios del Sistema</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gestión de cuentas y permisos de acceso al panel administrativo
        </p>
      </div>

      <UsuariosTable
        initialData={usuarios}
        currentUserId={profile.id}
      />
    </div>
  )
}
