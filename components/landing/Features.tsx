import { Scale, Handshake, Heart, GraduationCap, FileText, Users } from 'lucide-react'

const features = [
  {
    icon: Scale,
    title: 'Asesoría Jurídica',
    description: 'Defensa legal gratuita en procesos laborales, disciplinarios y cualquier conflicto con tu empleador.',
  },
  {
    icon: Handshake,
    title: 'Negociación Colectiva',
    description: 'Representación en negociaciones salariales, pliegos petitorios y convenciones colectivas.',
  },
  {
    icon: Heart,
    title: 'Bienestar y Salud',
    description: 'Programas de bienestar, auxilios médicos y apoyo en momentos difíciles para ti y tu familia.',
  },
  {
    icon: GraduationCap,
    title: 'Capacitación',
    description: 'Formación continua en temas TIC, derechos laborales y desarrollo profesional.',
  },
  {
    icon: FileText,
    title: 'Actas y Convenios',
    description: 'Seguimiento y cumplimiento de acuerdos colectivos pactados con las empresas.',
  },
  {
    icon: Users,
    title: 'Solidaridad',
    description: 'Red de apoyo mutuo entre afiliados. Juntos enfrentamos mejor cualquier situación.',
  },
]

export default function Features() {
  return (
    <section id="beneficios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-[#005EB8] text-sm font-semibold uppercase tracking-wider">Nuestros servicios</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
            Beneficios para los afiliados
          </h2>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
            En SINTRATEL trabajamos para garantizar condiciones laborales dignas y el bienestar
            integral de todos nuestros afiliados y sus familias.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="group p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-[#005EB8]/30 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-[#E8F0F7] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#003087] transition-colors">
                <f.icon size={22} className="text-[#003087] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
