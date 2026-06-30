export type UserRole = 'super_admin' | 'read_write' | 'read_only'

export interface Profile {
  id: string
  nombre: string
  email: string
  rol: UserRole
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Afiliado {
  id: string
  nombre_completo: string
  cedula: string
  email: string | null
  celular: string | null
  fecha_ingreso: string
  empresa: string
  cargo: string | null
  rol_sindical: string | null
  municipio: string | null
  sede_laboral: string | null
  departamento: string | null
  salario: number
  cuota_sindicato: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface JuntaDirectiva {
  id: string
  nombre: string
  cargo: string
  fecha_inicio: string
  fecha_fin: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  total_afiliados: number
  afiliados_activos: number
  junta_activa: number
  total_usuarios: number
  cuota_mensual_total: number
}
