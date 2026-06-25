'use client'

import { MapPin, Phone, Mail, Clock } from 'lucide-react'

const info = [
  { icon: MapPin, label: 'Dirección', value: 'Colombia' },
  { icon: Phone, label: 'Teléfono', value: '+57 (601) 000-0000' },
  { icon: Mail, label: 'Correo', value: 'contacto@sintratel.com' },
  { icon: Clock, label: 'Horario', value: 'Lunes a Viernes 8:00am - 5:00pm' },
]

export default function ContactSection() {
  return (
    <section id="contacto" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-[#005EB8] text-sm font-semibold uppercase tracking-wider">Contáctanos</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">Estamos para ayudarte</h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            ¿Quieres afiliarte o tienes alguna consulta? Comunícate con nosotros.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Info */}
          <div className="space-y-6">
            {info.map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#E8F0F7] rounded-xl flex items-center justify-center shrink-0">
                  <item.icon size={18} className="text-[#003087]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{item.label}</p>
                  <p className="text-gray-900 font-semibold">{item.value}</p>
                </div>
              </div>
            ))}

            <div className="mt-8 p-6 bg-[#003087] rounded-2xl text-white">
              <h3 className="font-bold text-lg mb-2">¿Quieres afiliarte?</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                La afiliación a SINTRATEL te protege y te da acceso a todos nuestros servicios.
                Contáctanos y un representante te asesorará sin costo alguno.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Envíanos un mensaje</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Nombre</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] focus:border-transparent"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Teléfono</label>
                  <input
                    type="tel"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] focus:border-transparent"
                    placeholder="Tu teléfono"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Correo electrónico</label>
                <input
                  type="email"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] focus:border-transparent"
                  placeholder="tu@correo.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Empresa donde trabaja</label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] focus:border-transparent"
                  placeholder="Nombre de tu empresa"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Mensaje</label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] focus:border-transparent resize-none"
                  placeholder="¿En qué podemos ayudarte?"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#003087] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#001F5B] transition-colors"
              >
                Enviar mensaje
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
