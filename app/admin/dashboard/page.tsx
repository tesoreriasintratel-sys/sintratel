import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Shield, User, DollarSign, TrendingUp, Activity } from 'lucide-react'

async function getStats() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return { totalAfiliados: 0, afiliadosActivos: 0, juntaActiva: 0, totalUsuarios: 0, cuotaTotal: 0 }
  }

  const headers = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', Prefer: 'count=exact' }

  const [totalAf, actAf, juntaAct, totalUs, cuotas] = await Promise.allSettled([
    fetch(`${supabaseUrl}/rest/v1/afiliados?select=id`, { headers }),
    fetch(`${supabaseUrl}/rest/v1/afiliados?activo=eq.true&select=id`, { headers }),
    fetch(`${supabaseUrl}/rest/v1/junta_directiva?activo=eq.true&select=id`, { headers }),
    fetch(`${supabaseUrl}/rest/v1/admin_users?activo=eq.true&select=id`, { headers }),
    fetch(`${supabaseUrl}/rest/v1/afiliados?activo=eq.true&select=cuota_sindicato`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    }),
  ])

  function parseCount(r: PromiseSettledResult<Response>): number {
    if (r.status !== 'fulfilled' || !r.value.ok) return 0
    const range = r.value.headers.get('content-range')
    if (!range) return 0
    const match = range.match(/\/(\d+)$/)
    return match ? parseInt(match[1]) : 0
  }

  let cuotaTotal = 0
  if (cuotas.status === 'fulfilled' && cuotas.value.ok) {
    try {
      const rows = await cuotas.value.json() as { cuota_sindicato: number }[]
      cuotaTotal = rows.reduce((s, a) => s + Number(a.cuota_sindicato), 0)
    } catch {
      cuotaTotal = 0
    }
  }

  return {
    totalAfiliados: parseCount(totalAf),
    afiliadosActivos: parseCount(actAf),
    juntaActiva: parseCount(juntaAct),
    totalUsuarios: parseCount(totalUs),
    cuotaTotal,
  }
}

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default async function DashboardPage() {
  const stats = await getStats()

  const cards = [
    {
      title: 'Total Afiliados',
      value: stats.totalAfiliados,
      sub: `${stats.afiliadosActivos} activos`,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Junta Directiva',
      value: stats.juntaActiva,
      sub: 'miembros activos',
      icon: Shield,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Cuota Mensual',
      value: formatCOP(stats.cuotaTotal),
      sub: 'total recaudado',
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Usuarios Admin',
      value: stats.totalUsuarios,
      sub: 'cuentas activas',
      icon: User,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen general del sistema SINTRATEL</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{c.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
                </div>
                <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center`}>
                  <c.icon size={20} className={c.color} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity size={16} className="text-[#003087]" />
              Acceso rápido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Gestionar Afiliados', href: '/admin/dashboard/afiliados', icon: Users },
              { label: 'Junta Directiva', href: '/admin/dashboard/junta', icon: Shield },
              { label: 'Administrar Usuarios', href: '/admin/dashboard/usuarios', icon: User },
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-8 h-8 bg-[#E8F0F7] rounded-lg flex items-center justify-center group-hover:bg-[#003087] transition-colors">
                  <item.icon size={15} className="text-[#003087] group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-[#003087]">{item.label}</span>
              </a>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp size={16} className="text-[#003087]" />
              Resumen sindical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Afiliados activos</span>
                <span className="font-bold text-gray-900">{stats.afiliadosActivos}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Afiliados inactivos</span>
                <span className="font-bold text-gray-900">{stats.totalAfiliados - stats.afiliadosActivos}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Junta activa</span>
                <span className="font-bold text-gray-900">{stats.juntaActiva} miembros</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">Recaudo mensual</span>
                <span className="font-bold text-[#003087]">{formatCOP(stats.cuotaTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
