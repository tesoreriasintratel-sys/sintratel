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
import type { Afiliado } from '@/types'
import type { UserRole } from '@/types'
import AfiliadoForm from './AfiliadoForm'
import { exportAfiliadosPDF } from '@/lib/reports/pdf'
import { exportAfiliadosExcel } from '@/lib/reports/excel'

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const formatDate = (d: string) => format(new Date(d + 'T00:00:00'), 'dd/MM/yyyy', { locale: es })

interface Props {
  initialData: Afiliado[]
  role: UserRole
}

export default function AfiliadosTable({ initialData, role }: Props) {
  const [data, setData] = useState<Afiliado[]>(initialData)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Afiliado | null>(null)

  const canWrite = role === 'super_admin' || role === 'read_write'
  const isAdmin = role === 'super_admin'

  const filtered = data.filter(a =>
    a.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
    a.cedula.includes(search) ||
    a.empresa.toLowerCase().includes(search.toLowerCase())
  )

  const refresh = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: fresh } = await supabase
      .from('afiliados')
      .select('*')
      .order('nombre_completo')
    setData(fresh ?? [])
    setLoading(false)
  }, [])

  async function handleDelete(id: string, nombre: string) {
    if (!confirm(`¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`)) return
    const supabase = createClient()
    const { error } = await supabase.from('afiliados').delete().eq('id', id)
    if (error) { toast.error('Error al eliminar'); return }
    toast.success('Afiliado eliminado')
    refresh()
  }

  function openCreate() { setEditing(null); setFormOpen(true) }
  function openEdit(a: Afiliado) { setEditing(a); setFormOpen(true) }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, cédula o empresa..."
            className="pl-9 h-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportAfiliadosPDF(filtered)}
            className="gap-1.5"
          >
            <FileText size={14} /> PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportAfiliadosExcel(filtered)}
            className="gap-1.5"
          >
            <FileSpreadsheet size={14} /> Excel
          </Button>
          {canWrite && (
            <Button size="sm" onClick={openCreate} className="gap-1.5 bg-[#003087] hover:bg-[#001F5B]">
              <Plus size={14} /> Nuevo Afiliado
            </Button>
          )}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-gray-500">
        {filtered.length} {filtered.length === 1 ? 'afiliado' : 'afiliados'}
        {search && ` que coinciden con "${search}"`}
      </p>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Nombre Completo</TableHead>
                <TableHead className="font-semibold">Cédula</TableHead>
                <TableHead className="font-semibold">Empresa</TableHead>
                <TableHead className="font-semibold">F. Ingreso</TableHead>
                <TableHead className="font-semibold text-right">Salario</TableHead>
                <TableHead className="font-semibold text-right">Cuota</TableHead>
                <TableHead className="font-semibold text-center">Estado</TableHead>
                {canWrite && <TableHead className="font-semibold text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: canWrite ? 8 : 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canWrite ? 8 : 7} className="text-center py-12 text-gray-400">
                    {search ? 'No se encontraron resultados' : 'No hay afiliados registrados'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(a => (
                  <TableRow key={a.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">{a.nombre_completo}</TableCell>
                    <TableCell className="text-gray-600 font-mono text-sm">{a.cedula}</TableCell>
                    <TableCell className="text-gray-600">{a.empresa}</TableCell>
                    <TableCell className="text-gray-600 text-sm">{formatDate(a.fecha_ingreso)}</TableCell>
                    <TableCell className="text-right text-gray-700 text-sm">{formatCOP(a.salario)}</TableCell>
                    <TableCell className="text-right text-gray-700 text-sm font-medium">{formatCOP(a.cuota_sindicato)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={a.activo ? 'default' : 'secondary'} className={a.activo ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}>
                        {a.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    {canWrite && (
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(a)} className="h-7 w-7 p-0">
                            <Pencil size={13} />
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(a.id, a.nombre_completo)}
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

      {/* Totals */}
      {filtered.length > 0 && (
        <div className="flex justify-end gap-6 text-sm text-gray-600 border-t pt-3">
          <span>
            Total salarios: <strong className="text-gray-900">{formatCOP(filtered.reduce((s, a) => s + Number(a.salario), 0))}</strong>
          </span>
          <span>
            Total cuotas: <strong className="text-[#003087]">{formatCOP(filtered.reduce((s, a) => s + Number(a.cuota_sindicato), 0))}</strong>
          </span>
        </div>
      )}

      {/* Form modal */}
      <AfiliadoForm
        open={formOpen}
        afiliado={editing}
        onClose={() => setFormOpen(false)}
        onSaved={refresh}
      />
    </div>
  )
}
