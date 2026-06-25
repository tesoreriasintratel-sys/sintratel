import Image from 'next/image'
import Link from 'next/link'
import { Lock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#001F5B] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Mission */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10">
                <Image src="/logo-sintratel.jpg" alt="SINTRATEL" fill className="object-contain rounded" />
              </div>
              <div>
                <p className="font-bold text-lg">SINTRATEL</p>
                <p className="text-blue-300 text-xs">Trabajadores TIC y Servicios Públicos</p>
              </div>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed max-w-xs">
              Sindicato de Trabajadores de las Tecnologías de la Información, Comunicaciones
              y Servicios Públicos Domiciliarios de Colombia.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Navegación</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              {['Inicio', 'Nosotros', 'Beneficios', 'Junta Directiva', 'Contacto'].map(l => (
                <li key={l}>
                  <a href={`#${l.toLowerCase().replace(' ', '-')}`} className="hover:text-white transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><span>Personería Jurídica</span></li>
              <li><span>Estatutos Sindicales</span></li>
              <li><span>Plan de Acción</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-blue-300 text-xs">
            © {new Date().getFullYear()} SINTRATEL. Todos los derechos reservados.
          </p>
          {/* Discrete admin access */}
          <Link
            href="/admin/login"
            className="text-white/20 hover:text-white/50 transition-colors"
            title="Acceso administrativo"
            aria-label="Acceso administrativo"
          >
            <Lock size={14} />
          </Link>
        </div>
      </div>
    </footer>
  )
}
