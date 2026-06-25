'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    setLoading(false)

    if (error) {
      setError('Usuario o contraseña incorrectos')
      return
    }

    toast.success('Bienvenido al sistema')
    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003087] to-[#005EB8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <Image src="/logo-sintratel.jpg" alt="SINTRATEL" fill className="object-contain rounded-lg" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SINTRATEL</h1>
            <p className="text-gray-500 text-sm mt-1">Panel Administrativo</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">Usuario (correo)</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@sintratel.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
                autoComplete="email"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-[#003087] hover:bg-[#001F5B] text-white font-semibold"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 size={16} className="mr-2 animate-spin" /> Ingresando...</>
              ) : (
                <><Lock size={16} className="mr-2" /> Ingresar</>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Acceso restringido a personal autorizado
          </p>
        </div>

        <p className="text-center text-white/50 text-xs mt-4">
          © {new Date().getFullYear()} SINTRATEL
        </p>
      </div>
    </div>
  )
}
