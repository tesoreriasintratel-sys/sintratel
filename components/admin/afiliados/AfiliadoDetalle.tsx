'use client'

import { X, FileDown } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Afiliado } from '@/types'
import { exportFichaAfiliadoPDF } from '@/lib/reports/pdf'

interface Props {
  afiliado: Afiliado | null
  onClose: () => void
}

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const formatDate = (d: string) => format(new Date(d + 'T00:00:00'), 'dd/MM/yyyy', { locale: es })

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value || '—'}</span>
    </div>
  )
}

export default function AfiliadoDetalle({ afiliado, onClose }: Props) {
  if (!afiliado) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{afiliado.nombre_completo}</h2>
            <p className="text-xs text-gray-500">Ficha del afiliado</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#003087] mb-1">
            Datos Personales
          </h3>
          <Row label="Cédula" value={afiliado.cedula} />
          <Row label="Email" value={afiliado.email} />
          <Row label="Celular" value={afiliado.celular} />
          <Row label="Fecha de ingreso" value={formatDate(afiliado.fecha_ingreso)} />

          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#003087] mb-1 mt-5">
            Datos Laborales
          </h3>
          <Row label="Empresa" value={afiliado.empresa} />
          <Row label="Cargo" value={afiliado.cargo} />
          <Row label="Rol sindical" value={afiliado.rol_sindical} />
          <Row label="Municipio" value={afiliado.municipio} />
          <Row label="Sede laboral" value={afiliado.sede_laboral} />
          <Row label="Departamento" value={afiliado.departamento} />

          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#003087] mb-1 mt-5">
            Datos Sindicales
          </h3>
          <Row label="Salario" value={formatCOP(afiliado.salario)} />
          <Row label="Cuota sindicato" value={formatCOP(afiliado.cuota_sindicato)} />
          <Row label="Estado" value={afiliado.estado === 'activo' ? 'Activo' : 'Inactivo'} />
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 sticky bottom-0 bg-white">
          <button
            onClick={() => exportFichaAfiliadoPDF(afiliado)}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg gap-1.5 flex items-center"
            style={{ backgroundColor: '#003087' }}
          >
            <FileDown size={14} /> Exportar ficha PDF
          </button>
        </div>
      </div>
    </div>
  )
}
