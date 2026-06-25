'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Afiliado } from '@/types'

interface Props {
  open: boolean
  afiliado: Afiliado | null
  onClose: () => void
  onSaved: () => void
}

const empty = {
  nombre_completo: '',
  cedula: '',
  fecha_ingreso: '',
  empresa: '',
  salario: '',
  cuota_sindicato: '',
  activo: true,
}

export default function AfiliadoForm({ open, afiliado, onClose, onSaved }: Props) {
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (afiliado) {
      setForm({
        nombre_completo: afiliado.nombre_completo,
        cedula: afiliado.cedula,
        fecha_ingreso: afiliado.fecha_ingreso,
        empresa: afiliado.empresa,
        salario: String(afiliado.salario),
        cuota_sindicato: String(afiliado.cuota_sindicato),
        activo: afiliado.activo,
      })
    } else {
      setForm(empty)
    }
  }, [afiliado, open])

  function set(field: string, value: string | boolean) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()

    const payload = {
      nombre_completo: form.nombre_completo.trim(),
      cedula: form.cedula.trim(),
      fecha_ingreso: form.fecha_ingreso,
      empresa: form.empresa.trim(),
      salario: parseFloat(form.salario) || 0,
      cuota_sindicato: parseFloat(form.cuota_sindicato) || 0,
      activo: form.activo,
    }

    const { error } = afiliado
      ? await supabase.from('afiliados').update(payload).eq('id', afiliado.id)
      : await supabase.from('afiliados').insert(payload)

    setSaving(false)

    if (error) {
      if (error.code === '23505') {
        toast.error('Ya existe un afiliado con esa cédula')
      } else {
        toast.error('Error al guardar: ' + error.message)
      }
      return
    }

    toast.success(afiliado ? 'Afiliado actualizado' : 'Afiliado creado correctamente')
    onSaved()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{afiliado ? 'Editar Afiliado' : 'Nuevo Afiliado'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="nombre_completo">Nombre Completo *</Label>
              <Input
                id="nombre_completo"
                value={form.nombre_completo}
                onChange={e => set('nombre_completo', e.target.value)}
                placeholder="Nombres y apellidos completos"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="cedula">Cédula *</Label>
              <Input
                id="cedula"
                value={form.cedula}
                onChange={e => set('cedula', e.target.value)}
                placeholder="Número de cédula"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="fecha_ingreso">Fecha de Ingreso *</Label>
              <Input
                id="fecha_ingreso"
                type="date"
                value={form.fecha_ingreso}
                onChange={e => set('fecha_ingreso', e.target.value)}
                required
              />
            </div>

            <div className="col-span-2 space-y-1">
              <Label htmlFor="empresa">Empresa *</Label>
              <Input
                id="empresa"
                value={form.empresa}
                onChange={e => set('empresa', e.target.value)}
                placeholder="Nombre de la empresa"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="salario">Salario (COP) *</Label>
              <Input
                id="salario"
                type="number"
                min="0"
                step="1000"
                value={form.salario}
                onChange={e => set('salario', e.target.value)}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="cuota">Cuota Sindicato (COP) *</Label>
              <Input
                id="cuota"
                type="number"
                min="0"
                step="100"
                value={form.cuota_sindicato}
                onChange={e => set('cuota_sindicato', e.target.value)}
                placeholder="0"
                required
              />
            </div>

            {afiliado && (
              <div className="col-span-2 flex items-center gap-3">
                <Switch
                  id="activo"
                  checked={form.activo}
                  onCheckedChange={v => set('activo', v)}
                />
                <Label htmlFor="activo">Afiliado activo</Label>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#003087] hover:bg-[#001F5B]" disabled={saving}>
              {saving && <Loader2 size={14} className="mr-2 animate-spin" />}
              {afiliado ? 'Guardar cambios' : 'Crear afiliado'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
