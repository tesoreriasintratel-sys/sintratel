'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from 'lucide-react'

interface Member {
  nombre: string
  cargo: string
}

const placeholder: Member[] = [
  { nombre: 'Presidente', cargo: 'Presidente' },
  { nombre: 'Vicepresidente', cargo: 'Vicepresidente' },
  { nombre: 'Secretario General', cargo: 'Secretario General' },
  { nombre: 'Tesorero', cargo: 'Tesorero' },
  { nombre: 'Fiscal', cargo: 'Fiscal' },
]

export default function JuntaSection() {
  const [members, setMembers] = useState<Member[]>(placeholder)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('junta_directiva')
      .select('nombre, cargo')
      .eq('activo', true)
      .order('fecha_inicio')
      .then(({ data }) => {
        if (data && data.length > 0) setMembers(data)
      })
  }, [])

  return (
    <section id="junta" className="py-20 bg-[#E8F0F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-[#005EB8] text-sm font-semibold uppercase tracking-wider">Directivos</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">Junta Directiva</h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Líderes elegidos democráticamente para representar los intereses de todos los afiliados.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {members.map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-[#003087] rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={28} className="text-white" />
              </div>
              <p className="font-semibold text-gray-900 text-sm">{m.nombre}</p>
              <p className="text-[#005EB8] text-xs font-medium mt-1">{m.cargo}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
