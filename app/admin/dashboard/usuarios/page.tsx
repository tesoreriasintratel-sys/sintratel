import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UsuariosTable from '@/components/admin/usuarios/UsuariosTable'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ShieldAlert } from 'lucide-react'

export default async function UsuariosPage() {
  const profile = await getProfile()
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

  const supabase = createClient()
  const { data: usuarios } = await supabase
    .from('profiles')
    .select('*')
    .order('nombre')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios del Sistema</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gestión de cuentas y permisos de acceso al panel administrativo
        </p>
      </div>

      <UsuariosTable
        initialData={usuarios ?? []}
        currentUserId={profile.id}
      />
    </div>
  )
}
