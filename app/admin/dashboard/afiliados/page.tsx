import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AfiliadosTable from '@/components/admin/afiliados/AfiliadosTable'

export default async function AfiliadosPage() {
  const profile = await getProfile()
  if (!profile) redirect('/admin/login')

  const supabase = createClient()
  const { data: afiliados } = await supabase
    .from('afiliados')
    .select('*')
    .order('nombre_completo')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Afiliados</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gestión del padrón de afiliados a SINTRATEL
        </p>
      </div>

      <AfiliadosTable
        initialData={afiliados ?? []}
        role={profile.rol}
      />
    </div>
  )
}
