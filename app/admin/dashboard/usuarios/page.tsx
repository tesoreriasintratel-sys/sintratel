'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import UsuariosTable from '@/components/admin/usuarios/UsuariosTable'
import type { Profile } from '@/types'

export default function UsuariosPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [usuarios, setUsuarios] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/me').then(r => r.json()),
      fetch('/api/usuarios').then(r => r.ok ? r.json() : []),
    ]).then(([me, list]) => {
      setProfile(me)
      setUsuarios(Array.isArray(list) ? list : [])
    }).catch(() => {
      setProfile(null)
    }).finally(() => {
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <Skeleton className="h-8 w-56 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  if (!profile || profile.rol !== 'super_admin') {
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
