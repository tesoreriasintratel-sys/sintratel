import Header from '@/components/landing/Header'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import JuntaSection from '@/components/landing/JuntaSection'
import ContactSection from '@/components/landing/ContactSection'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <main>
      <Header />
      <Hero />

      {/* About */}
      <section id="nosotros" className="py-20 bg-[#E8F0F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#005EB8] text-sm font-semibold uppercase tracking-wider">Quiénes somos</span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Más de 15 años defendiendo a los trabajadores TIC
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                SINTRATEL nació de la necesidad de los trabajadores del sector TIC y servicios
                públicos domiciliarios de Colombia de tener una voz colectiva fuerte que defienda
                sus derechos ante las empresas y el Estado.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                A través de la negociación colectiva, la asesoría jurídica y la solidaridad,
                hemos logrado mejoras significativas en las condiciones laborales de nuestros
                afiliados en todo el territorio nacional.
              </p>
              <div className="flex gap-6">
                <div>
                  <p className="text-3xl font-bold text-[#003087]">100%</p>
                  <p className="text-gray-500 text-sm">Comprometidos</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#003087]">24/7</p>
                  <p className="text-gray-500 text-sm">Asesoría</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#003087]">0</p>
                  <p className="text-gray-500 text-sm">Costo de afiliación inicial</p>
                </div>
              </div>
            </div>
            <div className="bg-[#003087] rounded-3xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Nuestra Misión</h3>
              <p className="text-blue-100 leading-relaxed mb-6">
                Representar, defender y promover los derechos e intereses económicos, sociales,
                culturales y morales de los trabajadores afiliados, mediante la acción sindical
                democrática y participativa.
              </p>
              <h3 className="text-2xl font-bold mb-4">Nuestra Visión</h3>
              <p className="text-blue-100 leading-relaxed">
                Ser el sindicato referente del sector TIC en Colombia, reconocido por su
                fortaleza organizativa, su impacto positivo en las condiciones laborales y
                su compromiso con el desarrollo integral de los trabajadores.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Features />
      <JuntaSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
