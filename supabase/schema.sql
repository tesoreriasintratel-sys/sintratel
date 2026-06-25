-- ============================================================
-- SINTRATEL - Schema de base de datos
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: profiles (extiende auth.users de Supabase Auth)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('super_admin', 'solo_lectura', 'lectura_escritura')),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: afiliados
-- ============================================================
CREATE TABLE public.afiliados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo TEXT NOT NULL,
  cedula TEXT UNIQUE NOT NULL,
  fecha_ingreso DATE NOT NULL,
  empresa TEXT NOT NULL,
  salario DECIMAL(14,2) NOT NULL DEFAULT 0,
  cuota_sindicato DECIMAL(10,2) NOT NULL DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: junta_directiva
-- ============================================================
CREATE TABLE public.junta_directiva (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  cargo TEXT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS para updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER afiliados_updated_at
  BEFORE UPDATE ON public.afiliados
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER junta_updated_at
  BEFORE UPDATE ON public.junta_directiva
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- TRIGGER: crear perfil automático al registrar usuario
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, email, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'rol', 'solo_lectura')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.afiliados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.junta_directiva ENABLE ROW LEVEL SECURITY;

-- Profiles: cada usuario ve su propio perfil
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Profiles: super_admin ve todos los perfiles
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.rol = 'super_admin'
    )
  );

-- Profiles: super_admin gestiona todos
CREATE POLICY "profiles_all_admin" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.rol = 'super_admin'
    )
  );

-- Afiliados: solo usuarios autenticados pueden leer
CREATE POLICY "afiliados_select_auth" ON public.afiliados
  FOR SELECT USING (auth.role() = 'authenticated');

-- Afiliados: solo lectura_escritura y super_admin pueden insertar
CREATE POLICY "afiliados_insert_writers" ON public.afiliados
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.rol IN ('super_admin', 'lectura_escritura')
    )
  );

-- Afiliados: solo lectura_escritura y super_admin pueden actualizar
CREATE POLICY "afiliados_update_writers" ON public.afiliados
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.rol IN ('super_admin', 'lectura_escritura')
    )
  );

-- Afiliados: solo super_admin puede eliminar
CREATE POLICY "afiliados_delete_admin" ON public.afiliados
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.rol = 'super_admin'
    )
  );

-- Junta Directiva: mismas políticas que afiliados
CREATE POLICY "junta_select_auth" ON public.junta_directiva
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "junta_insert_writers" ON public.junta_directiva
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.rol IN ('super_admin', 'lectura_escritura')
    )
  );

CREATE POLICY "junta_update_writers" ON public.junta_directiva
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.rol IN ('super_admin', 'lectura_escritura')
    )
  );

CREATE POLICY "junta_delete_admin" ON public.junta_directiva
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.rol = 'super_admin'
    )
  );

-- ============================================================
-- DATOS INICIALES (Junta Directiva de ejemplo)
-- ============================================================
-- NOTA: Primero crear el Super Admin en Supabase Auth (Dashboard > Authentication > Users)
-- Luego actualizar manualmente su rol en la tabla profiles a 'super_admin':
-- UPDATE public.profiles SET rol = 'super_admin' WHERE email = 'admin@sintratel.com';

INSERT INTO public.junta_directiva (nombre, cargo, fecha_inicio, activo) VALUES
  ('Nombre Presidente', 'Presidente', '2024-01-01', true),
  ('Nombre Vicepresidente', 'Vicepresidente', '2024-01-01', true),
  ('Nombre Secretario General', 'Secretario General', '2024-01-01', true),
  ('Nombre Tesorero', 'Tesorero', '2024-01-01', true),
  ('Nombre Fiscal', 'Fiscal', '2024-01-01', true);

-- ============================================================
-- ÍNDICES para rendimiento
-- ============================================================
CREATE INDEX idx_afiliados_cedula ON public.afiliados(cedula);
CREATE INDEX idx_afiliados_empresa ON public.afiliados(empresa);
CREATE INDEX idx_afiliados_activo ON public.afiliados(activo);
CREATE INDEX idx_junta_activo ON public.junta_directiva(activo);
CREATE INDEX idx_profiles_rol ON public.profiles(rol);
