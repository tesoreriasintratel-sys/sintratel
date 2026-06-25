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
import type { JuntaDirectiva } from '@/types'

interface Props {
  open: boolean
  miembro: JuntaDirectiva | null
  onClose: () => void
  onSaved: () => void
}

const cargos = [
  'Presidente', 'Vicepresidente', 'Secretario General', 'Tesorero', 'Fiscal',
  'Vocal Principal', 'Vocal Suplente', 'Revisor Fiscal', 'Comité de Control',
]

const empty = {
  nombre: '',
  cargo: '',
  fecha_inicio: '',
  fecha_fin: '',
  activo: true,
}

export default function JuntaForm({ open, miembro, onClose, onSaved }: Props) {
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (miembro) {
      setForm({
        nombre: miembro.nombre,
        cargo: miembro.cargo,
        fecha_inicio: miembro.fecha_inicio,
        fecha_fin: miembro.fecha_fin ?? '',
        activo: miembro.activo,
      })
    } else {
      setForm(empty)
    }
  }, [miembro, open])

  function set(field: string, value: string | boolean) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()

    const payload = {
      nombre: form.nombre.trim(),
      cargo: form.cargo.trim(),
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin || null,
      activo: form.activo,
    }

    const { error } = miembro
      ? await supabase.from('junta_directiva').update(payload).eq('id', miembro.id)
      : await supabase.from('junta_directiva').insert(payload)

    setSaving(false)

    if (error) {
      toast.error('Error al guardar: ' + error.message)
      return
    }

    toast.success(miembro ? 'Miembro actualizado' : 'Miembro registrado correctamente')
    onSaved()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{miembro ? 'Editar Miembro' : 'Nuevo Miembro de Junta'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="nombre">Nombre Completo *</Label>
            <Input
              id="nombre"
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Nombres y apellidos"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="cargo">Cargo *</Label>
            <Input
              id="cargo"
              value={form.cargo}
              onChange={e => set('cargo', e.target.value)}
              list="cargos-list"
              placeholder="Selecciona o escribe el cargo"
              required
            />
            <datalist id="cargos-list">
              {cargos.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="fecha_inicio">Fecha Inicio *</Label>
              <Input
                id="fecha_inicio"
                type="date"
                value={form.fecha_inicio}
                onChange={e => set('fecha_inicio', e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="fecha_fin">Fecha Fin</Label>
              <Input
                id="fecha_fin"
                type="date"
                value={form.fecha_fin}
                onChange={e => set('fecha_fin', e.target.value)}
                min={form.fecha_inicio}
              />
              <p className="text-xs text-gray-400">Dejar vacío si está vigente</p>
            </div>
          </div>

          {miembro && (
            <div className="flex items-center gap-3">
              <Switch
                id="activo"
                checked={form.activo}
                onCheckedChange={v => set('activo', v)}
              />
              <Label htmlFor="activo">Miembro activo</Label>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#003087] hover:bg-[#001F5B]" disabled={saving}>
              {saving && <Loader2 size={14} className="mr-2 animate-spin" />}
              {miembro ? 'Guardar cambios' : 'Registrar miembro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
