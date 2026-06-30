'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import JuntaTable from '@/components/admin/junta/JuntaTable'
import type { JuntaDirectiva, Profile } from '@/types'

export default function JuntaPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [junta, setJunta] = useState<JuntaDirectiva[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const meRes = await fetch('/api/me')
      const meData = await meRes.json()
      if (meData.error) {
        window.location.href = '/admin/login'
        return
      }
      setProfile(meData)

      const supabase = createClient()
      const { data } = await supabase
        .from('junta_directiva')
        .select('*')
        .order('nombre')
      setJunta(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003087]" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Junta Directiva</h1>
        <p className="text-gray-500 text-sm mt-1">
          Integrantes actuales e históricos de la junta directiva de SINTRATEL
        </p>
      </div>
      <JuntaTable
        initialData={junta}
        role={profile.rol}
      />
    </div>
  )
}
