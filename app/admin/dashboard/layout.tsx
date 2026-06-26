'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/admin/Sidebar'
import TopNav from '@/components/admin/TopNav'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import type { Profile } from '@/types'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    async function load() {
      console.log('[Layout] Iniciando verificación de auth...')
      const supabase = createClient()

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log('[Layout] getUser resultado:', { userId: user?.id, email: user?.email, error: userError })

      if (!user) {
        console.log('[Layout] No hay usuario autenticado → redirigiendo a login')
        window.location.href = '/admin/login'
        return
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      console.log('[Layout] profiles query resultado:', { data, error: profileError })

      if (data) {
        console.log('[Layout] Perfil cargado:', data)
        setProfile(data)
      } else {
        // Perfil no existe en tabla profiles → usar fallback desde auth.user
        // Esto puede ocurrir si el trigger handle_new_user no corrió al crear el usuario
        console.warn('[Layout] No se encontró perfil en tabla profiles. Error:', profileError?.message)
        console.warn('[Layout] Usando fallback de auth.user — actualiza la tabla profiles en Supabase')
        const fallback: Profile = {
          id: user.id,
          nombre: user.user_metadata?.nombre ?? user.email?.split('@')[0] ?? 'Admin',
          email: user.email ?? '',
          rol: user.user_metadata?.rol ?? 'super_admin',
          activo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setProfile(fallback)
      }

      setAuthChecked(true)
    }

    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!authChecked || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003087]" />
        <p className="text-sm text-gray-400">Verificando sesión...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col">
        <Sidebar role={profile.rol} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-60 border-0">
          <Sidebar role={profile.rol} onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav profile={profile} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
