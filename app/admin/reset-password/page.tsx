'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleReset() {
    if (!password || !confirm) { setError('Completa todos los campos'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    if (password.length < 6) { setError('Mínimo 6 caracteres'); return }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Error: ' + error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => { window.location.href = '/admin/dashboard' }, 2000)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #003087 0%, #005EB8 100%)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md mx-4">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo-sintratel.jpg"
            alt="SINTRATEL"
            width={80}
            height={80}
            className="object-contain mb-4 rounded-lg"
            priority
          />
          <h1 className="text-2xl font-bold text-gray-900">Nueva Contraseña</h1>
          <p className="text-sm text-gray-500 mt-1 text-center">
            Escribe tu nueva contraseña de acceso
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-lg text-sm text-center">
            ✓ Contraseña actualizada correctamente. Redirigiendo...
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReset()}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReset()}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Repite la contraseña"
                />
              </div>

              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#003087' }}
              >
                {loading ? 'Guardando...' : 'Guardar contraseña'}
              </button>
            </div>
          </>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">© 2026 SINTRATEL</p>
      </div>
    </div>
  )
}
