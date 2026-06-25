'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Beneficios', href: '#beneficios' },
  { label: 'Junta Directiva', href: '#junta' },
  { label: 'Contacto', href: '#contacto' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image
                src="/logo-sintratel.jpg"
                alt="SINTRATEL"
                fill
                className="object-contain rounded"
              />
            </div>
            <div>
              <p className="font-bold text-[#003087] text-lg leading-none">SINTRATEL</p>
              <p className="text-xs text-gray-500 leading-none">Trabajadores TIC</p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <a
                key={l.href}
                href={l.href}
                className="px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-[#003087] transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:block">
            <a
              href="#contacto"
              className="inline-flex items-center justify-center rounded-lg bg-[#003087] hover:bg-[#001F5B] text-white text-sm font-medium h-8 px-3 transition-colors"
            >
              Afíliate
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700"
            onClick={() => setOpen(!open)}
            aria-label="Menú"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4">
          {navLinks.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium text-gray-700 hover:text-[#003087]"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contacto"
            className="mt-3 flex w-full items-center justify-center rounded-lg bg-[#003087] hover:bg-[#001F5B] text-white text-sm font-medium h-8 px-3 transition-colors"
          >
            Afíliate
          </a>
        </div>
      )}
    </header>
  )
}
