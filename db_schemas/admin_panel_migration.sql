-- ============================================================
-- Columnas necesarias en user_data para el Panel Admin
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. Campo para marcar administradores
ALTER TABLE public.user_data
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Campo para marcar perfiles destacados
ALTER TABLE public.user_data
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================================
-- Para dar acceso admin a un usuario específico (por email):
-- ============================================================
-- UPDATE public.user_data
--   SET is_admin = TRUE
--   WHERE email = 'tu-email@ejemplo.com';

-- ============================================================
-- RLS: Permitir que admins actualicen campos de otros usuarios
-- (opcional, si tenés RLS activado en user_data)
-- ============================================================
-- CREATE POLICY "admin_can_update_users"
--   ON public.user_data
--   FOR UPDATE
--   USING (
--     EXISTS (
--       SELECT 1 FROM public.user_data
--       WHERE id = auth.uid() AND is_admin = TRUE
--     )
--   );
