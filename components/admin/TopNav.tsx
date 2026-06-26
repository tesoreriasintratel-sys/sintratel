'use client'

import { useState, useRef, useEffect } from 'react'
import { Menu, LogOut, User, ChevronDown } from 'lucide-react'
import type { Profile } from '@/types'

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  read_write: 'Lectura/Escritura',
  read_only: 'Solo Lectura',
}

interface TopNavProps {
  profile: Profile
  onMenuClick: () => void
}

export default function TopNav({ profile, onMenuClick }: TopNavProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    setLoading(true)
    setOpen(false)
    await fetch('/api/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  const initials = profile.nombre
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1 lg:flex-none" />

      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(v => !v)}
          className="inline-flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer outline-none"
        >
          <div className="w-7 h-7 rounded-full bg-[#003087] flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {initials}
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[8rem] truncate">
            {profile.nombre}
          </span>
          <span className="hidden sm:block text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
            {roleLabels[profile.rol] ?? profile.rol}
          </span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">{profile.nombre}</p>
              <p className="text-xs text-gray-500 truncate">{profile.email}</p>
            </div>
            <div className="py-1">
              <button
                disabled
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
              >
                <User size={14} />
                Mi perfil
              </button>
            </div>
            <div className="border-t border-gray-100 py-1">
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <LogOut size={14} />
                {loading ? 'Cerrando sesión...' : 'Cerrar sesión'}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
