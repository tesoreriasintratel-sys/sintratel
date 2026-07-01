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

const empty = {
  nombre: '',
  cedula: '',
  email: '',
  celular: '',
  empresa: '',
  municipio: '',
  sede_laboral: '',
  departamento: '',
  cargo: '',
  fecha_inicio: '',
  fecha_fin: '',
  activo: true,
}

export default function JuntaForm({ open, miembro, onClose, onSaved }: Props) {
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (miembro) {
      setForm({
        nombre: miembro.nombre,
        cedula: miembro.cedula ?? '',
        email: miembro.email ?? '',
        celular: miembro.celular ?? '',
        empresa: miembro.empresa ?? '',
        municipio: miembro.municipio ?? '',
        sede_laboral: miembro.sede_laboral ?? '',
        departamento: miembro.departamento ?? '',
        cargo: miembro.cargo,
        fecha_inicio: miembro.fecha_inicio ?? '',
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
      cedula: form.cedula.trim() || null,
      email: form.email.trim() || null,
      celular: form.celular.trim() || null,
      empresa: form.empresa.trim() || null,
      municipio: form.municipio.trim() || null,
      sede_laboral: form.sede_laboral.trim() || null,
      departamento: form.departamento.trim() || null,
      cargo: form.cargo.trim(),
      fecha_inicio: form.fecha_inicio || null,
      fecha_fin: form.fecha_fin || null,
      activo: form.activo,
    }

    const { error: err } = miembro
      ? await supabase.from('junta_directiva').update(payload).eq('id', miembro.id)
      : await supabase.from('junta_directiva').insert(payload)

    setSaving(false)

    if (err) {
      setError('Error al guardar: ' + err.message)
      return
    }

    toast.success(miembro ? 'Miembro actualizado' : 'Miembro creado correctamente')
    onSaved()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-base font-semibold text-gray-900">
            {miembro ? 'Editar Miembro' : 'Nuevo Miembro Junta Directiva'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#003087] mb-3">
              Datos Personales
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                <input type="text" value={form.nombre} onChange={e => set('nombre', e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
                <input type="text" value={form.cedula} onChange={e => set('cedula', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                <input type="text" value={form.celular} onChange={e => set('celular', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#003087] mb-3">
              Datos Laborales
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                <input type="text" value={form.empresa} onChange={e => set('empresa', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
                <input type="text" value={form.municipio} onChange={e => set('municipio', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                <input type="text" value={form.departamento} onChange={e => set('departamento', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Sede Laboral</label>
                <input type="text" value={form.sede_laboral} onChange={e => set('sede_laboral', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#003087] mb-3">
              Cargo en Junta Directiva
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo *</label>
                <input type="text" value={form.cargo} onChange={e => set('cargo', e.target.value)} required
                  placeholder="Ej: Presidente, Tesorero, Secretario..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                <input type="date" value={form.fecha_inicio} onChange={e => set('fecha_inicio', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                <input type="date" value={form.fecha_fin} onChange={e => set('fecha_fin', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]" />
              </div>
              {miembro && (
                <div className="col-span-2 flex items-center gap-3">
                  <button type="button" onClick={() => set('activo', !form.activo)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${form.activo ? 'bg-[#003087]' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.activo ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                  <span className="text-sm font-medium text-gray-700">Miembro activo</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 sticky bottom-0 bg-white">
            <button type="button" onClick={onClose} disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
              style={{ backgroundColor: '#003087' }}>
              {saving ? 'Guardando...' : miembro ? 'Guardar cambios' : 'Crear miembro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
