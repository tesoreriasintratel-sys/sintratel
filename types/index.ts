export type UserRole = 'super_admin' | 'solo_lectura' | 'lectura_escritura'

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
  fecha_ingreso: string
  empresa: string
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
