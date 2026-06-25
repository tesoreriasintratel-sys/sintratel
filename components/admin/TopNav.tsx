'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Menu, LogOut, User, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import type { Profile } from '@/types'

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  lectura_escritura: 'Lectura/Escritura',
  solo_lectura: 'Solo Lectura',
}

const roleColors: Record<string, 'default' | 'secondary' | 'outline'> = {
  super_admin: 'default',
  lectura_escritura: 'secondary',
  solo_lectura: 'outline',
}

interface TopNavProps {
  profile: Profile
  onMenuClick: () => void
}

export default function TopNav({ profile, onMenuClick }: TopNavProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Sesión cerrada')
    router.push('/admin/login')
    router.refresh()
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

      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer outline-none"
        >
          <Avatar className="w-7 h-7">
            <AvatarFallback className="bg-[#003087] text-white text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-32 truncate">
            {profile.nombre}
          </span>
          <Badge variant={roleColors[profile.rol]} className="hidden sm:flex text-xs px-1.5">
            {roleLabels[profile.rol]}
          </Badge>
          <ChevronDown size={14} className="text-gray-400" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>
            <p className="font-medium text-sm">{profile.nombre}</p>
            <p className="text-xs text-gray-500 font-normal">{profile.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <User size={14} className="mr-2" />
            Mi perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 focus:text-red-600 cursor-pointer"
            disabled={loading}
          >
            <LogOut size={14} className="mr-2" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
