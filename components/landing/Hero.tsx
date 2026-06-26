import { ArrowRight, Shield } from 'lucide-react'

export default function Hero() {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#003087] via-[#005EB8] to-[#0080CC]" />
      <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')] bg-repeat" />

      {/* Decorative circles */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <Shield size={14} className="text-blue-200" />
              <span className="text-blue-100 text-sm font-medium">Protegiendo tus derechos laborales</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Unidos somos{' '}
              <span className="text-blue-200">más fuertes</span>
            </h1>

            <p className="text-lg text-blue-100 mb-8 leading-relaxed">
              SINTRATEL es el sindicato de los trabajadores de las Tecnologías de la Información,
              Comunicaciones y Servicios Públicos Domiciliarios. Defendemos tus derechos con solidaridad,
              transparencia y compromiso.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#contacto"
                className="inline-flex items-center justify-center rounded-lg bg-white text-[#003087] hover:bg-blue-50 font-semibold text-sm h-9 px-4 shadow-lg transition-colors"
              >
                Afíliate ahora <ArrowRight size={16} className="ml-1.5" />
              </a>
              <a
                href="#nosotros"
                className="inline-flex items-center justify-center rounded-lg border border-white/40 text-white hover:bg-white/10 backdrop-blur text-sm h-9 px-4 transition-colors"
              >
                Conoce más
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L1440 60L1440 30C1200 0 960 60 720 30C480 0 240 60 0 30V60Z" fill="white" />
        </svg>
      </div>
    </section>
  )
}
