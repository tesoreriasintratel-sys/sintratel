import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AfiliadosPage() {
  const profile = await getProfile()
  if (!profile) redirect('/admin/login')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Afiliados - PRUEBA</h1>
      <p>Si ves esto, el problema está en AfiliadosTable o en la consulta a Supabase.</p>
    </div>
  )
}
