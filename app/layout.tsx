import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'SINTRATEL - Sindicato de Trabajadores TIC y Servicios Públicos',
  description: 'Sindicato de Trabajadores de las Tecnologías de la Información, Comunicaciones y Servicios Públicos Domiciliarios',
  keywords: 'sindicato, trabajadores, TIC, telecomunicaciones, servicios públicos, Colombia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
