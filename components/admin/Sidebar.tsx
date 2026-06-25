'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Users, User, LayoutDashboard, Shield, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'solo_lectura', 'lectura_escritura'] },
  { href: '/admin/dashboard/afiliados', label: 'Afiliados', icon: Users, roles: ['super_admin', 'solo_lectura', 'lectura_escritura'] },
  { href: '/admin/dashboard/junta', label: 'Junta Directiva', icon: Shield, roles: ['super_admin', 'solo_lectura', 'lectura_escritura'] },
  { href: '/admin/dashboard/usuarios', label: 'Usuarios', icon: User, roles: ['super_admin'] },
]

interface SidebarProps {
  role: UserRole
  onClose?: () => void
}

export default function Sidebar({ role, onClose }: SidebarProps) {
  const pathname = usePathname()

  const allowed = navItems.filter(i => i.roles.includes(role))

  return (
    <div className="flex flex-col h-full bg-[#003087]">
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8">
            <Image src="/logo-sintratel.jpg" alt="SINTRATEL" fill className="object-contain rounded" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">SINTRATEL</p>
            <p className="text-blue-300 text-xs">Panel Admin</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/60 hover:text-white lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {allowed.map(item => {
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-white text-[#003087] shadow-sm'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-2 text-blue-200 hover:text-white text-xs transition-colors"
        >
          ← Ir al sitio web
        </Link>
      </div>
    </div>
  )
}
