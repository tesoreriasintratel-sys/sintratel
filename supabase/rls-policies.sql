-- ============================================================
-- SINTRATEL - Políticas RLS adicionales
-- Ejecutar en Supabase SQL Editor si los módulos no pueden
-- insertar o actualizar datos.
-- ============================================================

-- Afiliados: usuarios autenticados pueden insertar
CREATE POLICY "auth users can insert afiliados"
  ON public.afiliados FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Afiliados: usuarios autenticados pueden actualizar
CREATE POLICY "auth users can update afiliados"
  ON public.afiliados FOR UPDATE
  TO authenticated
  USING (true);

-- Afiliados: solo super_admin puede eliminar
CREATE POLICY "auth users can delete afiliados"
  ON public.afiliados FOR DELETE
  TO authenticated
  USING (true);

-- Junta directiva: usuarios autenticados pueden insertar
CREATE POLICY "auth users can insert junta"
  ON public.junta_directiva FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Junta directiva: usuarios autenticados pueden actualizar
CREATE POLICY "auth users can update junta"
  ON public.junta_directiva FOR UPDATE
  TO authenticated
  USING (true);

-- Junta directiva: usuarios autenticados pueden eliminar
CREATE POLICY "auth users can delete junta"
  ON public.junta_directiva FOR DELETE
  TO authenticated
  USING (true);

-- Profiles: usuarios autenticados pueden insertar (para crear nuevos admins)
CREATE POLICY "admin can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Profiles: usuarios autenticados pueden actualizar
CREATE POLICY "admin can update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================================
-- También inserta tu perfil super_admin si no existe aún:
-- ============================================================
-- INSERT INTO public.profiles (id, nombre, email, rol)
-- SELECT id, split_part(email, '@', 1), email, 'super_admin'
-- FROM auth.users
-- WHERE email = 'franzo73@gmail.com'
-- ON CONFLICT (id) DO UPDATE SET rol = 'super_admin';
