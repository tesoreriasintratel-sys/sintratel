'use client'

import { useState, useCallback } from 'react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Pencil, UserX, Search, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Profile } from '@/types'
import UsuarioForm from './UsuarioForm'

const formatDate = (d: string) => format(new Date(d), 'dd/MM/yyyy', { locale: es })

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  lectura_escritura: 'Lectura / Escritura',
  solo_lectura: 'Solo Lectura',
}

const roleBadge: Record<string, string> = {
  super_admin: 'bg-[#003087] text-white hover:bg-[#003087]',
  lectura_escritura: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  solo_lectura: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
}

interface Props {
  initialData: Profile[]
  currentUserId: string
}

export default function UsuariosTable({ initialData, currentUserId }: Props) {
  const [data, setData] = useState<Profile[]>(initialData)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Profile | null>(null)

  const filtered = data.filter(u =>
    u.nombre.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/usuarios')
      if (res.ok) setData(await res.json())
    } catch {
      toast.error('Error al refrescar usuarios')
    } finally {
      setLoading(false)
    }
  }, [])

  async function handleToggleActive(u: Profile) {
    if (u.id === currentUserId) {
      toast.error('No puedes desactivar tu propia cuenta')
      return
    }
    const res = await fetch(`/api/usuarios/${u.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !u.activo }),
    })
    if (!res.ok) { toast.error('Error al actualizar estado'); return }
    toast.success(u.activo ? 'Usuario desactivado' : 'Usuario activado')
    refresh()
  }

  function openCreate() { setEditing(null); setFormOpen(true) }
  function openEdit(u: Profile) { setEditing(u); setFormOpen(true) }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o correo..."
            className="pl-9 h-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button size="sm" onClick={openCreate} className="gap-1.5 bg-[#003087] hover:bg-[#001F5B]">
          <UserPlus size={14} /> Nuevo usuario
        </Button>
      </div>

      <p className="text-xs text-gray-500">
        {filtered.length} {filtered.length === 1 ? 'usuario' : 'usuarios'}
      </p>

      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Nombre</TableHead>
                <TableHead className="font-semibold">Correo</TableHead>
                <TableHead className="font-semibold">Rol</TableHead>
                <TableHead className="font-semibold">Creado</TableHead>
                <TableHead className="font-semibold text-center">Estado</TableHead>
                <TableHead className="font-semibold text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                    {search ? 'No se encontraron resultados' : 'No hay usuarios registrados'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(u => (
                  <TableRow key={u.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">
                      {u.nombre}
                      {u.id === currentUserId && (
                        <span className="ml-2 text-xs text-gray-400">(tú)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">{u.email}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${roleBadge[u.rol]}`}>
                        {roleLabels[u.rol]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">{formatDate(u.created_at)}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={u.activo ? 'default' : 'secondary'}
                        className={u.activo ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                      >
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(u)}
                          className="h-7 w-7 p-0"
                          title="Editar usuario"
                        >
                          <Pencil size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(u)}
                          className={`h-7 w-7 p-0 ${u.activo ? 'text-red-500 hover:text-red-700 hover:bg-red-50' : 'text-green-600 hover:text-green-800 hover:bg-green-50'}`}
                          title={u.activo ? 'Desactivar usuario' : 'Activar usuario'}
                          disabled={u.id === currentUserId}
                        >
                          <UserX size={13} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <UsuarioForm
        open={formOpen}
        usuario={editing}
        onClose={() => setFormOpen(false)}
        onSaved={refresh}
      />
    </div>
  )
}
