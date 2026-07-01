'use client'

import { useState } from 'react'
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onClose: () => void
  onImported: () => void
}

interface RowPreview {
  nombre: string
  email: string
  cedula: string
  empresa: string
  cargo_junta: string
  municipio: string
  sede_laboral: string
  departamento: string
  celular: string
}

export default function ImportarExcelJunta({ open, onClose, onImported }: Props) {
  const [, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<RowPreview[]>([])
  const [allRows, setAllRows] = useState<RowPreview[]>([])
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number; updated: number; errors: string[] } | null>(null)
  const [error, setError] = useState('')

  function reset() {
    setFile(null)
    setPreview([])
    setAllRows([])
    setResult(null)
    setError('')
  }

  function handleClose() { reset(); onClose() }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setError('')
    setResult(null)
    setParsing(true)

    try {
      const XLSX = await import('xlsx')
      const buffer = await f.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })

      // Buscar hoja que contenga JUNTA
      const sheetName =
        wb.SheetNames.find(name => name.toUpperCase().includes('JUNTA')) ??
        wb.SheetNames[0]

      const sheet = wb.Sheets[sheetName]
      const raw: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

      // Buscar fila de encabezados (la que tenga NOMBRE)
      let headerRowIndex = -1
      for (let i = 0; i < raw.length; i++) {
        const row = raw[i].map(c => String(c ?? '').trim().toUpperCase())
        if (row.some(c => c.includes('NOMBRE'))) {
          headerRowIndex = i
          break
        }
      }

      if (headerRowIndex === -1) {
        setError('No se encontró fila de encabezados con NOMBRE.')
        setParsing(false)
        return
      }

      const dataRows = raw.slice(headerRowIndex + 1)

      // Índices fijos basados en la estructura real del Excel:
      // 0:ITEM, 1:NOMBRE, 2:EMAIL, 3:CARGO_JUNTA(sin header), 4:CEDULA,
      // 5:EMPRESA, 6:ROL, 7:CARGO(vacío), 8:MUNICIPIO, 9:SEDE LABORAL,
      // 10:DEPARTAMENTO, 11:CELULAR
      const mapped: RowPreview[] = dataRows
        .map(row => ({
          nombre: String(row[1] ?? '').trim(),
          email: String(row[2] ?? '').trim(),
          cargo_junta: String(row[3] ?? '').trim(),
          cedula: String(row[4] ?? '').trim(),
          empresa: String(row[5] ?? '').trim(),
          municipio: String(row[8] ?? '').trim(),
          sede_laboral: String(row[9] ?? '').trim(),
          departamento: String(row[10] ?? '').trim(),
          celular: String(row[11] ?? '').trim(),
        }))
        .filter(r => r.nombre && r.nombre !== 'NOMBRE')

      if (mapped.length === 0) {
        setError('No se encontraron filas válidas con datos de nombre.')
        setParsing(false)
        return
      }

      setAllRows(mapped)
      setPreview(mapped.slice(0, 5))
    } catch (err) {
      console.error(err)
      setError('No se pudo leer el archivo. Verifica que sea un Excel válido (.xlsx)')
    }
    setParsing(false)
  }

  async function handleConfirm() {
    if (allRows.length === 0) return
    setImporting(true)
    setError('')

    try {
      const res = await fetch('/api/junta/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ miembros: allRows }),
      })

      const text = await res.text()
      if (!text) throw new Error('Respuesta vacía del servidor')
      const data = JSON.parse(text)

      if (!res.ok) {
        setError(data.error || 'Error al importar')
        setImporting(false)
        return
      }

      setResult(data)
      toast.success(`Importación completa: ${data.imported} nuevos, ${data.updated} actualizados`)
      onImported()
    } catch (err) {
      console.error(err)
      const message = err instanceof Error ? err.message : 'Error al importar'
      setError(message)
    }
    setImporting(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-[#003087]" />
            Importar Junta Directiva desde Excel
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {!result && (
            <>
              <div className="bg-[#e8f0fe] rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  Sube el Excel con la hoja <strong>JUNTA DIRECTIVA</strong>. El sistema detectará automáticamente los datos.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona el archivo Excel (.xlsx)
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFile}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#003087] file:text-white hover:file:bg-[#001F5B] file:cursor-pointer cursor-pointer"
                />
              </div>

              {parsing && <p className="text-sm text-gray-500">Leyendo archivo...</p>}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />{error}
                </div>
              )}

              {preview.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Vista previa ({allRows.length} registros, mostrando los primeros 5):
                  </p>
                  <div className="border rounded-lg overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-2 text-left">Nombre</th>
                          <th className="px-2 py-2 text-left">Cédula</th>
                          <th className="px-2 py-2 text-left">Cargo en Junta</th>
                          <th className="px-2 py-2 text-left">Empresa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((r, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            <td className="px-2 py-2">{r.nombre}</td>
                            <td className="px-2 py-2 font-mono">{r.cedula}</td>
                            <td className="px-2 py-2">{r.cargo_junta}</td>
                            <td className="px-2 py-2">{r.empresa}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Importación completada</p>
                <p className="text-sm text-green-700 mt-1">
                  {result.imported} nuevos, {result.updated} actualizados.
                </p>
                {result.errors.length > 0 && (
                  <ul className="text-xs text-red-600 list-disc list-inside mt-2">
                    {result.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 sticky bottom-0 bg-white">
          <button onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
            {result ? 'Cerrar' : 'Cancelar'}
          </button>
          {!result && allRows.length > 0 && (
            <button onClick={handleConfirm} disabled={importing}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 flex items-center gap-1.5"
              style={{ backgroundColor: '#003087' }}>
              <Upload size={14} />
              {importing ? 'Importando...' : `Confirmar importación (${allRows.length})`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
