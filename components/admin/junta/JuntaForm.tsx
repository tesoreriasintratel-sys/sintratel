'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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

const empty = { nombre: '', cargo: '', fecha_inicio: '', fecha_fin: '', activo: true }

export default function JuntaForm({ open, miembro, onClose, onSaved }: Props) {
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
    setError('')
  }, [miembro, open])

  function set(field: string, value: string | boolean) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const supabase = createClient()

    const payload = {
      nombre: form.nombre.trim(),
      cargo: form.cargo.trim(),
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin || null,
      activo: form.activo,
    }

    const { error: err } = miembro
      ? await supabase.from('junta_directiva').update(payload).eq('id', miembro.id)
      : await supabase.from('junta_directiva').insert(payload)

    setSaving(false)

    if (err) {
      console.error('[JuntaForm] error:', err)
      setError('Error al guardar: ' + err.message)
      return
    }

    toast.success(miembro ? 'Miembro actualizado' : 'Miembro registrado correctamente')
    onSaved()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {miembro ? 'Editar Miembro' : 'Nuevo Miembro de Junta'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Nombres y apellidos"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo *</label>
            <input
              type="text"
              value={form.cargo}
              onChange={e => set('cargo', e.target.value)}
              list="cargos-list"
              placeholder="Selecciona o escribe el cargo"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
            />
            <datalist id="cargos-list">
              {cargos.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label>
              <input
                type="date"
                value={form.fecha_inicio}
                onChange={e => set('fecha_inicio', e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input
                type="date"
                value={form.fecha_fin}
                onChange={e => set('fecha_fin', e.target.value)}
                min={form.fecha_inicio}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
              />
              <p className="text-xs text-gray-400 mt-1">Vacío si está vigente</p>
            </div>
          </div>

          {miembro && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => set('activo', !form.activo)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${form.activo ? 'bg-[#003087]' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.activo ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
              <span className="text-sm font-medium text-gray-700">Miembro activo</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
              style={{ backgroundColor: '#003087' }}
            >
              {saving ? 'Guardando...' : miembro ? 'Guardar cambios' : 'Registrar miembro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
