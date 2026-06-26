'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Profile, UserRole } from '@/types'

interface Props {
  open: boolean
  usuario: Profile | null
  onClose: () => void
  onSaved: () => void
}

const roles: { value: UserRole; label: string; description: string }[] = [
  {
    value: 'solo_lectura',
    label: 'Solo Lectura',
    description: 'Puede ver afiliados y junta directiva, no puede modificar datos.',
  },
  {
    value: 'lectura_escritura',
    label: 'Lectura / Escritura',
    description: 'Puede crear y editar afiliados y junta directiva.',
  },
  {
    value: 'super_admin',
    label: 'Super Admin',
    description: 'Acceso completo incluyendo gestión de usuarios.',
  },
]

const emptyCreate = { nombre: '', email: '', password: '', confirmPassword: '', rol: 'solo_lectura' as UserRole }

export default function UsuarioForm({ open, usuario, onClose, onSaved }: Props) {
  const [form, setForm] = useState(emptyCreate)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (usuario) {
      setForm({ ...emptyCreate, nombre: usuario.nombre, rol: usuario.rol })
    } else {
      setForm(emptyCreate)
    }
    setError('')
  }, [usuario, open])

  function set(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!usuario && form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (!usuario && form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setSaving(true)

    if (usuario) {
      const res = await fetch(`/api/usuarios/${usuario.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: form.nombre.trim(), rol: form.rol }),
      })
      setSaving(false)
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error al actualizar'); return }
      toast.success('Usuario actualizado correctamente')
    } else {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          email: form.email.trim(),
          password: form.password,
          rol: form.rol,
        }),
      })
      setSaving(false)
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error al crear usuario'); return }
      toast.success('Usuario creado exitosamente.')
    }

    onSaved()
    onClose()
  }

  const selectedRole = roles.find(r => r.value === form.rol)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {usuario ? 'Editar Usuario' : 'Nuevo Usuario Administrador'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Nombre del usuario"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
            />
          </div>

          {!usuario && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="correo@empresa.com"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña *</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  placeholder="Repite la contraseña"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol de acceso *</label>
            <select
              value={form.rol}
              onChange={e => set('rol', e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] bg-white"
            >
              {roles.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {selectedRole && (
              <p className="text-xs text-gray-500 mt-1">{selectedRole.description}</p>
            )}
          </div>

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
              {saving ? 'Guardando...' : usuario ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
