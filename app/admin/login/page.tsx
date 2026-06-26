'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      setError('Completa todos los campos')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error al iniciar sesión')
        setLoading(false)
        return
      }

      window.location.href = '/admin/dashboard'
    } catch (e) {
      setError('Error de red. Intenta de nuevo.')
      setLoading(false)
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Panel Administrativo</h1>
          <p className="text-sm text-gray-500 mt-1 text-center">
            Acceso restringido a personal autorizado
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="correo@ejemplo.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#003087' }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">© 2026 SINTRATEL</p>
      </div>
    </div>
  )
}
