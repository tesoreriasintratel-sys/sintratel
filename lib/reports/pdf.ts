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
    head: [['Nombre Completo', 'Cédula', 'Cargo', 'Empresa', 'Celular', 'Salario', 'Cuota', 'Estado']],
    body: afiliados.map(a => [
      a.nombre_completo,
      a.cedula,
      a.cargo || '—',
      a.empresa,
      a.celular || '—',
      formatCurrency(a.salario),
      formatCurrency(a.cuota_sindicato),
      a.estado === 'activo' ? 'Activo' : 'Inactivo',
    ]),
    headStyles: { fillColor: [0, 48, 135], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [232, 240, 247] },
    styles: { fontSize: 8 },
    foot: [[
      { content: `Total afiliados: ${afiliados.length}`, colSpan: 5, styles: { fontStyle: 'bold' } },
      { content: `Total cuotas: ${formatCurrency(afiliados.reduce((s, a) => s + Number(a.cuota_sindicato), 0))}`, colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
    ]],
    footStyles: { fillColor: [0, 48, 135], textColor: [255, 255, 255] },
  })

  doc.save(`SINTRATEL_Afiliados_${format(new Date(), 'yyyyMMdd')}.pdf`)
}

export async function exportFichaAfiliadoPDF(afiliado: Afiliado) {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF()

  doc.setFillColor(0, 48, 135)
  doc.rect(0, 0, 210, 35, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('SINTRATEL', 105, 14, { align: 'center' })
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Ficha Individual de Afiliado', 105, 22, { align: 'center' })
  doc.setFontSize(9)
  doc.text(`Generado: ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es })}`, 105, 29, { align: 'center' })

  doc.setTextColor(0, 0, 0)
  let y = 48

  const section = (title: string) => {
    doc.setFillColor(232, 240, 247)
    doc.rect(15, y - 5, 180, 8, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 48, 135)
    doc.text(title, 18, y)
    doc.setTextColor(0, 0, 0)
    y += 10
  }

  const row = (label: string, value: string) => {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(label + ':', 18, y)
    doc.setFont('helvetica', 'normal')
    doc.text(value || '—', 75, y)
    y += 7
  }

  section('DATOS PERSONALES')
  row('Nombre completo', afiliado.nombre_completo)
  row('Cédula', afiliado.cedula)
  row('Email', afiliado.email || '—')
  row('Celular', afiliado.celular || '—')
  row('Fecha de ingreso', formatDate(afiliado.fecha_ingreso))

  y += 4
  section('DATOS LABORALES')
  row('Empresa', afiliado.empresa)
  row('Cargo', afiliado.cargo || '—')
  row('Rol sindical', afiliado.rol_sindical || '—')
  row('Municipio', afiliado.municipio || '—')
  row('Sede laboral', afiliado.sede_laboral || '—')
  row('Departamento', afiliado.departamento || '—')

  y += 4
  section('DATOS SINDICALES')
  row('Salario', formatCurrency(afiliado.salario))
  row('Cuota sindicato', formatCurrency(afiliado.cuota_sindicato))
  row('Estado', afiliado.estado === 'activo' ? 'Activo' : 'Inactivo')

  doc.setFillColor(0, 48, 135)
  doc.rect(0, 280, 210, 17, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.text('SINTRATEL - Sindicato de Trabajadores de las TICs y los Servicios Públicos Domiciliarios', 105, 290, { align: 'center' })

  doc.save(`SINTRATEL_Ficha_${afiliado.cedula}.pdf`)
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
