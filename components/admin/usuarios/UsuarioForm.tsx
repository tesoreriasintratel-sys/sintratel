'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Info } from 'lucide-react'
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
    const supabase = createClient()

    if (usuario) {
      // Only update profile fields (name and role)
      const { error: err } = await supabase
        .from('profiles')
        .update({ nombre: form.nombre.trim(), rol: form.rol })
        .eq('id', usuario.id)

      setSaving(false)
      if (err) { setError('Error al actualizar: ' + err.message); return }
      toast.success('Usuario actualizado correctamente')
    } else {
      // Create user via API route (needs service role key)
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

      if (!res.ok) {
        setError(data.error ?? 'Error al crear usuario')
        return
      }
      toast.success('Usuario creado. Se envió un correo de confirmación.')
    }

    onSaved()
    onClose()
  }

  const selectedRole = roles.find(r => r.value === form.rol)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{usuario ? 'Editar Usuario' : 'Nuevo Usuario Administrador'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="nombre">Nombre Completo *</Label>
            <Input
              id="nombre"
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Nombre del usuario"
              required
            />
          </div>

          {!usuario && (
            <>
              <div className="space-y-1">
                <Label htmlFor="email">Correo electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="correo@empresa.com"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirm">Confirmar contraseña *</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  placeholder="Repite la contraseña"
                  required
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <Label htmlFor="rol">Rol de acceso *</Label>
            <Select value={form.rol} onValueChange={(v: string | null) => { if (v) set('rol', v) }}>
              <SelectTrigger id="rol">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(r => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRole && (
              <p className="text-xs text-gray-500 flex items-start gap-1 mt-1">
                <Info size={11} className="mt-0.5 shrink-0" />
                {selectedRole.description}
              </p>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#003087] hover:bg-[#001F5B]" disabled={saving}>
              {saving && <Loader2 size={14} className="mr-2 animate-spin" />}
              {usuario ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
