'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  email: '',
  celular: '',
  fecha_ingreso: '',
  empresa: '',
  cargo: '',
  rol_sindical: '',
  municipio: '',
  sede_laboral: '',
  departamento: '',
  salario: '',
  cuota_sindicato: '',
  activo: true,
}

export default function AfiliadoForm({ open, afiliado, onClose, onSaved }: Props) {
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (afiliado) {
      setForm({
        nombre_completo: afiliado.nombre_completo,
        cedula: afiliado.cedula,
        email: afiliado.email ?? '',
        celular: afiliado.celular ?? '',
        fecha_ingreso: afiliado.fecha_ingreso,
        empresa: afiliado.empresa,
        cargo: afiliado.cargo ?? '',
        rol_sindical: afiliado.rol_sindical ?? '',
        municipio: afiliado.municipio ?? '',
        sede_laboral: afiliado.sede_laboral ?? '',
        departamento: afiliado.departamento ?? '',
        salario: String(afiliado.salario),
        cuota_sindicato: String(afiliado.cuota_sindicato),
        activo: afiliado.activo,
      })
    } else {
      setForm(empty)
    }
    setError('')
  }, [afiliado, open])

  function set(field: string, value: string | boolean) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const supabase = createClient()

    const payload = {
      nombre_completo: form.nombre_completo.trim(),
      cedula: form.cedula.trim(),
      email: form.email.trim() || null,
      celular: form.celular.trim() || null,
      fecha_ingreso: form.fecha_ingreso,
      empresa: form.empresa.trim(),
      cargo: form.cargo.trim() || null,
      rol_sindical: form.rol_sindical.trim() || null,
      municipio: form.municipio.trim() || null,
      sede_laboral: form.sede_laboral.trim() || null,
      departamento: form.departamento.trim() || null,
      salario: parseFloat(form.salario) || 0,
      cuota_sindicato: parseFloat(form.cuota_sindicato) || 0,
      activo: form.activo,
    }

    const { error: err } = afiliado
      ? await supabase.from('afiliados').update(payload).eq('id', afiliado.id)
      : await supabase.from('afiliados').insert(payload)

    setSaving(false)

    if (err) {
      console.error('[AfiliadoForm] error:', err)
      const msg = err.code === '23505'
        ? 'Ya existe un afiliado con esa cédula'
        : 'Error al guardar: ' + err.message
      setError(msg)
      return
    }

    toast.success(afiliado ? 'Afiliado actualizado' : 'Afiliado creado correctamente')
    onSaved()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-base font-semibold text-gray-900">
            {afiliado ? 'Editar Afiliado' : 'Nuevo Afiliado'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">

          {/* SECCIÓN: Datos Personales */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#003087] mb-3">
              Datos Personales
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={form.nombre_completo}
                  onChange={e => set('nombre_completo', e.target.value)}
                  placeholder="Nombres y apellidos completos"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cédula *</label>
                <input
                  type="text"
                  value={form.cedula}
                  onChange={e => set('cedula', e.target.value)}
                  placeholder="Número de cédula"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Ingreso *</label>
                <input
                  type="date"
                  value={form.fecha_ingreso}
                  onChange={e => set('fecha_ingreso', e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                <input
                  type="text"
                  value={form.celular}
                  onChange={e => set('celular', e.target.value)}
                  placeholder="3001234567"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN: Datos Laborales */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#003087] mb-3">
              Datos Laborales
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa *</label>
                <input
                  type="text"
                  value={form.empresa}
                  onChange={e => set('empresa', e.target.value)}
                  placeholder="Nombre de la empresa"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                <input
                  type="text"
                  value={form.cargo}
                  onChange={e => set('cargo', e.target.value)}
                  placeholder="Cargo que desempeña"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol Sindical</label>
                <input
                  type="text"
                  value={form.rol_sindical}
                  onChange={e => set('rol_sindical', e.target.value)}
                  placeholder="Rol dentro del sindicato"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
                <input
                  type="text"
                  value={form.municipio}
                  onChange={e => set('municipio', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                <input
                  type="text"
                  value={form.departamento}
                  onChange={e => set('departamento', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Sede Laboral</label>
                <input
                  type="text"
                  value={form.sede_laboral}
                  onChange={e => set('sede_laboral', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN: Datos Sindicales */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#003087] mb-3">
              Datos Sindicales
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salario (COP) *</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={form.salario}
                  onChange={e => set('salario', e.target.value)}
                  placeholder="0"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuota Sindicato (COP) *</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={form.cuota_sindicato}
                  onChange={e => set('cuota_sindicato', e.target.value)}
                  placeholder="0"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                />
              </div>

              {afiliado && (
                <div className="col-span-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => set('activo', !form.activo)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${form.activo ? 'bg-[#003087]' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.activo ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                  <span className="text-sm font-medium text-gray-700">Afiliado activo</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 sticky bottom-0 bg-white">
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
              {saving ? 'Guardando...' : afiliado ? 'Guardar cambios' : 'Crear afiliado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
