'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

const info = [
  { icon: MapPin, label: 'Nombre', value: 'Sintratel - Colombia' },
  { icon: MapPin, label: 'Dirección', value: 'Bucaramanga, Colombia' },
  { icon: Phone, label: 'Teléfono', value: '+57 3053407355' },
  { icon: Mail, label: 'Correo', value: 'sintratelcolombia@gmail.com' },
  { icon: Clock, label: 'Horario', value: 'Lunes a Viernes 8:00am - 5:00pm' },
]

const empty = { nombre: '', email: '', telefono: '', empresa: '', mensaje: '' }

export default function ContactSection() {
  const [form, setForm] = useState(empty)
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function set(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Error al enviar')
        setStatus('error')
        return
      }
      setStatus('success')
      setForm(empty)
    } catch {
      setErrorMsg('Error de conexión. Intenta de nuevo.')
      setStatus('error')
    }
  }

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

            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                <CheckCircle size={48} className="text-green-500" />
                <div>
                  <p className="text-lg font-semibold text-gray-900">¡Mensaje enviado!</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Nos comunicaremos contigo pronto al correo indicado.
                  </p>
                </div>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-2 text-sm text-[#003087] font-medium hover:underline"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Nombre completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.nombre}
                      onChange={e => set('nombre', e.target.value)}
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] focus:border-transparent"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Teléfono</label>
                    <input
                      type="tel"
                      value={form.telefono}
                      onChange={e => set('telefono', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] focus:border-transparent"
                      placeholder="+57 300 000 0000"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] focus:border-transparent"
                    placeholder="tu@correo.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Empresa donde trabaja</label>
                  <input
                    type="text"
                    value={form.empresa}
                    onChange={e => set('empresa', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] focus:border-transparent"
                    placeholder="Nombre de tu empresa"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Mensaje o motivo de afiliación</label>
                  <textarea
                    rows={4}
                    value={form.mensaje}
                    onChange={e => set('mensaje', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] focus:border-transparent resize-none"
                    placeholder="¿En qué podemos ayudarte?"
                  />
                </div>

                {status === 'error' && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full bg-[#003087] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#001F5B] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {status === 'sending' ? (
                    <><Loader2 size={16} className="animate-spin" /> Enviando...</>
                  ) : (
                    'Enviar solicitud'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
