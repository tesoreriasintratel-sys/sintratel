import type { Afiliado, JuntaDirectiva } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const formatDate = (d: string) =>
  format(new Date(d + 'T00:00:00'), 'dd/MM/yyyy', { locale: es })

export async function exportAfiliadosPDF(afiliados: Afiliado[]) {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'landscape' })

  // Header
  doc.setFillColor(0, 48, 135)
  doc.rect(0, 0, 297, 30, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('SINTRATEL', 148.5, 12, { align: 'center' })
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Listado de Afiliados', 148.5, 20, { align: 'center' })
  doc.setFontSize(9)
  doc.text(`Generado: ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es })}`, 148.5, 27, { align: 'center' })

  doc.setTextColor(0, 0, 0)

  autoTable(doc, {
    startY: 35,
    head: [['Nombre Completo', 'Cédula', 'F. Ingreso', 'Empresa', 'Salario', 'Cuota Sindicato', 'Estado']],
    body: afiliados.map(a => [
      a.nombre_completo,
      a.cedula,
      formatDate(a.fecha_ingreso),
      a.empresa,
      formatCurrency(a.salario),
      formatCurrency(a.cuota_sindicato),
      a.activo ? 'Activo' : 'Inactivo',
    ]),
    headStyles: { fillColor: [0, 48, 135], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [232, 240, 247] },
    styles: { fontSize: 8 },
    foot: [[
      { content: `Total afiliados: ${afiliados.length}`, colSpan: 4, styles: { fontStyle: 'bold' } },
      { content: `Total cuotas: ${formatCurrency(afiliados.reduce((s, a) => s + Number(a.cuota_sindicato), 0))}`, colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
    ]],
    footStyles: { fillColor: [0, 48, 135], textColor: [255, 255, 255] },
  })

  doc.save(`SINTRATEL_Afiliados_${format(new Date(), 'yyyyMMdd')}.pdf`)
}

export async function exportJuntaPDF(junta: JuntaDirectiva[]) {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF()

  doc.setFillColor(0, 48, 135)
  doc.rect(0, 0, 210, 30, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('SINTRATEL', 105, 12, { align: 'center' })
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Junta Directiva', 105, 20, { align: 'center' })
  doc.setFontSize(9)
  doc.text(`Generado: ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es })}`, 105, 27, { align: 'center' })

  doc.setTextColor(0, 0, 0)

  autoTable(doc, {
    startY: 35,
    head: [['Nombre', 'Cargo', 'F. Inicio', 'F. Fin', 'Estado']],
    body: junta.map(j => [
      j.nombre,
      j.cargo,
      formatDate(j.fecha_inicio),
      j.fecha_fin ? formatDate(j.fecha_fin) : 'Vigente',
      j.activo ? 'Activo' : 'Inactivo',
    ]),
    headStyles: { fillColor: [0, 48, 135], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [232, 240, 247] },
    styles: { fontSize: 9 },
  })

  doc.save(`SINTRATEL_JuntaDirectiva_${format(new Date(), 'yyyyMMdd')}.pdf`)
}
