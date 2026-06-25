import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import JuntaTable from '@/components/admin/junta/JuntaTable'

export default async function JuntaPage() {
  const profile = await getProfile()
  if (!profile) redirect('/admin/login')

  const supabase = createClient()
  const { data: junta } = await supabase
    .from('junta_directiva')
    .select('*')
    .order('fecha_inicio', { ascending: false })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Junta Directiva</h1>
        <p className="text-gray-500 text-sm mt-1">
          Integrantes actuales e históricos de la junta directiva de SINTRATEL
        </p>
      </div>

      <JuntaTable
        initialData={junta ?? []}
        role={profile.rol}
      />
    </div>
  )
}
