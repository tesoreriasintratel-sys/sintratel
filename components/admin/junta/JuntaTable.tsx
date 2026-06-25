'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Pencil, Trash2, Search, Plus, FileText, FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { JuntaDirectiva, UserRole } from '@/types'
import JuntaForm from './JuntaForm'
import { exportJuntaPDF } from '@/lib/reports/pdf'
import { exportJuntaExcel } from '@/lib/reports/excel'

const formatDate = (d: string) => format(new Date(d + 'T00:00:00'), 'dd/MM/yyyy', { locale: es })

interface Props {
  initialData: JuntaDirectiva[]
  role: UserRole
}

export default function JuntaTable({ initialData, role }: Props) {
  const [data, setData] = useState<JuntaDirectiva[]>(initialData)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<JuntaDirectiva | null>(null)

  const canWrite = role === 'super_admin' || role === 'lectura_escritura'
  const isAdmin = role === 'super_admin'

  const filtered = data.filter(j =>
    j.nombre.toLowerCase().includes(search.toLowerCase()) ||
    j.cargo.toLowerCase().includes(search.toLowerCase())
  )

  const refresh = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: fresh } = await supabase
      .from('junta_directiva')
      .select('*')
      .order('fecha_inicio', { ascending: false })
    setData(fresh ?? [])
    setLoading(false)
  }, [])

  async function handleDelete(id: string, nombre: string) {
    if (!confirm(`¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`)) return
    const supabase = createClient()
    const { error } = await supabase.from('junta_directiva').delete().eq('id', id)
    if (error) { toast.error('Error al eliminar'); return }
    toast.success('Miembro eliminado')
    refresh()
  }

  function openCreate() { setEditing(null); setFormOpen(true) }
  function openEdit(j: JuntaDirectiva) { setEditing(j); setFormOpen(true) }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o cargo..."
            className="pl-9 h-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => exportJuntaPDF(filtered)} className="gap-1.5">
            <FileText size={14} /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportJuntaExcel(filtered)} className="gap-1.5">
            <FileSpreadsheet size={14} /> Excel
          </Button>
          {canWrite && (
            <Button size="sm" onClick={openCreate} className="gap-1.5 bg-[#003087] hover:bg-[#001F5B]">
              <Plus size={14} /> Nuevo miembro
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500">
        {filtered.length} {filtered.length === 1 ? 'miembro' : 'miembros'}
        {search && ` que coinciden con "${search}"`}
      </p>

      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Nombre</TableHead>
                <TableHead className="font-semibold">Cargo</TableHead>
                <TableHead className="font-semibold">Fecha Inicio</TableHead>
                <TableHead className="font-semibold">Fecha Fin</TableHead>
                <TableHead className="font-semibold text-center">Estado</TableHead>
                {canWrite && <TableHead className="font-semibold text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: canWrite ? 6 : 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canWrite ? 6 : 5} className="text-center py-12 text-gray-400">
                    {search ? 'No se encontraron resultados' : 'No hay miembros registrados'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(j => (
                  <TableRow key={j.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">{j.nombre}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[#003087] border-[#003087]/30">
                        {j.cargo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">{formatDate(j.fecha_inicio)}</TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {j.fecha_fin ? formatDate(j.fecha_fin) : (
                        <span className="text-green-600 font-medium">Vigente</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={j.activo ? 'default' : 'secondary'}
                        className={j.activo ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                      >
                        {j.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    {canWrite && (
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(j)} className="h-7 w-7 p-0">
                            <Pencil size={13} />
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(j.id, j.nombre)}
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={13} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <JuntaForm
        open={formOpen}
        miembro={editing}
        onClose={() => setFormOpen(false)}
        onSaved={refresh}
      />
    </div>
  )
}
