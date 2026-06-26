'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/admin/Sidebar'
import TopNav from '@/components/admin/TopNav'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import type { Profile } from '@/types'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    fetch('/api/me')
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          window.location.href = '/admin/login'
          return
        }
        setProfile(data)
        setAuthChecked(true)
      })
      .catch(() => {
        window.location.href = '/admin/login'
      })
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
      <aside className="hidden lg:flex w-60 shrink-0 flex-col">
        <Sidebar role={profile.rol} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-60 border-0">
          <Sidebar role={profile.rol} onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav profile={profile} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
