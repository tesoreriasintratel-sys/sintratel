'use client'

import { X, FileDown } from 'lucide-react'
import type { JuntaDirectiva } from '@/types'
import { exportFichaJuntaPDF } from '@/lib/reports/pdf'

interface Props {
  miembro: JuntaDirectiva | null
  onClose: () => void
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value || '—'}</span>
    </div>
  )
}

export default function JuntaDetalle({ miembro, onClose }: Props) {
  if (!miembro) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{miembro.nombre}</h2>
            <p className="text-xs text-gray-500">{miembro.cargo}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#003087] mb-1">Datos Personales</h3>
          <Row label="Cédula" value={miembro.cedula} />
          <Row label="Email" value={miembro.email} />
          <Row label="Celular" value={miembro.celular} />

          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#003087] mb-1 mt-5">Datos Laborales</h3>
          <Row label="Empresa" value={miembro.empresa} />
          <Row label="Municipio" value={miembro.municipio} />
          <Row label="Sede laboral" value={miembro.sede_laboral} />
          <Row label="Departamento" value={miembro.departamento} />

          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#003087] mb-1 mt-5">Cargo en Junta</h3>
          <Row label="Cargo" value={miembro.cargo} />
          <Row label="Fecha inicio" value={miembro.fecha_inicio ?? 'No registrada'} />
          <Row label="Fecha fin" value={miembro.fecha_fin ?? 'Vigente'} />
          <Row label="Estado" value={miembro.activo ? 'Activo' : 'Inactivo'} />
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 sticky bottom-0 bg-white">
          <button
            onClick={() => exportFichaJuntaPDF(miembro)}
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
