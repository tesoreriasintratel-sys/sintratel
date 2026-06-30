import type { Afiliado, JuntaDirectiva } from '@/types'
import { format } from 'date-fns'

const formatDate = (d: string) => format(new Date(d + 'T00:00:00'), 'dd/MM/yyyy')

export async function exportAfiliadosExcel(afiliados: Afiliado[]) {
  const { utils, writeFile } = await import('xlsx')
  const data = [
    ['SINTRATEL - Listado de Afiliados'],
    [`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`],
    [],
    ['Nombre Completo', 'Cédula', 'Email', 'Celular', 'Fecha Ingreso', 'Empresa', 'Cargo', 'Rol Sindical', 'Municipio', 'Sede Laboral', 'Departamento', 'Salario', 'Cuota Sindicato', 'Estado'],
    ...afiliados.map(a => [
      a.nombre_completo,
      a.cedula,
      a.email || '',
      a.celular || '',
      formatDate(a.fecha_ingreso),
      a.empresa,
      a.cargo || '',
      a.rol_sindical || '',
      a.municipio || '',
      a.sede_laboral || '',
      a.departamento || '',
      a.salario,
      a.cuota_sindicato,
      a.estado === 'activo' ? 'Activo' : 'Inactivo',
    ]),
    [],
    ['', '', '', '', '', '', '', '', '', '', 'TOTAL:', afiliados.reduce((s, a) => s + Number(a.salario), 0), afiliados.reduce((s, a) => s + Number(a.cuota_sindicato), 0), `${afiliados.length} registros`],
  ]
  const ws = utils.aoa_to_sheet(data)
  ws['!cols'] = [
    { wch: 35 }, { wch: 15 }, { wch: 28 }, { wch: 14 }, { wch: 14 }, { wch: 25 },
    { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 10 },
  ]
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Afiliados')
  writeFile(wb, `SINTRATEL_Afiliados_${format(new Date(), 'yyyyMMdd')}.xlsx`)
}

export async function exportPlantillaAfiliados() {
  const { utils, writeFile } = await import('xlsx')
  const data = [
    ['ITEM', 'NOMBRE', 'EMAIL', 'CEDULA', 'EMPRESA', 'ROL', 'CARGO', 'MUNICIPIO', 'SEDE LABORAL', 'DEPARTAMENTO', 'CELULAR'],
    [1, 'Juan Pérez Gómez', 'juan.perez@ejemplo.com', '1234567890', 'Empresa Ejemplo S.A.', 'Afiliado', 'Técnico', 'Bucaramanga', 'Sede Norte', 'Santander', '3001234567'],
  ]
  const ws = utils.aoa_to_sheet(data)
  ws['!cols'] = [
    { wch: 6 }, { wch: 30 }, { wch: 28 }, { wch: 14 }, { wch: 25 },
    { wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 14 },
  ]
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Plantilla Afiliados')
  writeFile(wb, 'SINTRATEL_Plantilla_Afiliados.xlsx')
}

export async function exportJuntaExcel(junta: JuntaDirectiva[]) {
  const { utils, writeFile } = await import('xlsx')
  const data = [
    ['SINTRATEL - Junta Directiva'],
    [`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`],
    [],
    ['Nombre', 'Cargo', 'Fecha Inicio', 'Fecha Fin', 'Estado'],
    ...junta.map(j => [
      j.nombre,
      j.cargo,
      formatDate(j.fecha_inicio),
      j.fecha_fin ? formatDate(j.fecha_fin) : 'Vigente',
      j.activo ? 'Activo' : 'Inactivo',
    ]),
    [],
    [`Total: ${junta.length} integrantes`],
  ]
  const ws = utils.aoa_to_sheet(data)
  ws['!cols'] = [
    { wch: 35 }, { wch: 25 }, { wch: 14 }, { wch: 14 }, { wch: 10 },
  ]
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Junta Directiva')
  writeFile(wb, `SINTRATEL_JuntaDirectiva_${format(new Date(), 'yyyyMMdd')}.xlsx`)
}
