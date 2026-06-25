'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'
import TopNav from '@/components/admin/TopNav'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import type { Profile } from '@/types'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/admin/login'); return }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!data) { router.push('/admin/login'); return }
      setProfile(data)
    }
    load()
  }, [router])

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003087]" />
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
