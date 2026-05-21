-- =====================================================
-- FIX: FK constraints + Políticas RLS para app técnico
-- Ejecutar en Supabase (dev Y prod) → SQL Editor
-- =====================================================

-- -------------------------------------------------------
-- PARTE 1: FK constraints (necesarios para joins)
-- -------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'orden_trabajo_estado_id_fkey'
      AND table_name = 'orden_trabajo'
  ) THEN
    ALTER TABLE orden_trabajo
      ADD CONSTRAINT orden_trabajo_estado_id_fkey
      FOREIGN KEY (estado_id) REFERENCES estados_orden_trabajo(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'orden_trabajo_prioridad_id_fkey'
      AND table_name = 'orden_trabajo'
  ) THEN
    ALTER TABLE orden_trabajo
      ADD CONSTRAINT orden_trabajo_prioridad_id_fkey
      FOREIGN KEY (prioridad_id) REFERENCES prioridades(id);
  END IF;
END $$;

-- -------------------------------------------------------
-- PARTE 2: Políticas RLS - orden_trabajo
-- Eliminar TODAS las políticas existentes primero
-- -------------------------------------------------------
-- PARTE 2: NO modificar políticas RLS de orden_trabajo
-- (mantener las políticas multi-tenant existentes intactas)
-- La solución real es SECURITY DEFINER en las funciones (ver PARTE 5)
-- -------------------------------------------------------

-- -------------------------------------------------------
-- PARTE 3: Políticas RLS - tablas de catálogo
-- -------------------------------------------------------
ALTER TABLE estados_orden_trabajo ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso lectura estados" ON estados_orden_trabajo;
CREATE POLICY "Acceso lectura estados"
  ON estados_orden_trabajo FOR SELECT
  TO authenticated
  USING (true);

ALTER TABLE prioridades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso lectura prioridades" ON prioridades;
CREATE POLICY "Acceso lectura prioridades"
  ON prioridades FOR SELECT
  TO authenticated
  USING (true);

ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Técnicos pueden ver servicios" ON servicios;
CREATE POLICY "Técnicos pueden ver servicios"
  ON servicios FOR SELECT
  TO authenticated
  USING (true);

-- -------------------------------------------------------
-- PARTE 4: GRANT de permisos de rol en tablas
-- -------------------------------------------------------
GRANT SELECT ON orden_trabajo TO authenticated;
GRANT SELECT ON estados_orden_trabajo TO authenticated;
GRANT SELECT ON prioridades TO authenticated;
GRANT SELECT ON servicios TO authenticated;
GRANT SELECT ON local TO authenticated;
GRANT SELECT ON zona TO authenticated;
GRANT SELECT ON empresa TO authenticated;
GRANT SELECT ON informe_limpieza_ductos TO authenticated;

-- -------------------------------------------------------
-- PARTE 5: SECURITY DEFINER + STRICT en funciones RLS
-- Modifica atributos sin tocar el cuerpo de las funciones
-- -------------------------------------------------------

-- STRICT: si UUID es NULL, devuelve NULL inmediatamente sin ejecutar tablas
ALTER FUNCTION public.es_superadmin_uid(uuid) STRICT;
ALTER FUNCTION public.es_admin_o_superadmin_uid(uuid) STRICT;
ALTER FUNCTION public.usuario_tiene_alcance_orden(uuid, uuid) STRICT;

-- SECURITY DEFINER: ejecuta con privilegios del dueño (postgres), no del caller
ALTER FUNCTION public.es_superadmin_uid(uuid) SECURITY DEFINER;
ALTER FUNCTION public.es_admin_o_superadmin_uid(uuid) SECURITY DEFINER;
ALTER FUNCTION public.usuario_tiene_alcance_orden(uuid, uuid) SECURITY DEFINER;

-- Fijar search_path para evitar ataques de schema injection
ALTER FUNCTION public.es_superadmin_uid(uuid) SET search_path = public;
ALTER FUNCTION public.es_admin_o_superadmin_uid(uuid) SET search_path = public;
ALTER FUNCTION public.usuario_tiene_alcance_orden(uuid, uuid) SET search_path = public;

-- Re-asegurar permisos de ejecución para PostgREST
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO public;

-- -------------------------------------------------------
-- PARTE 6: RPC MULTI-TENANT SEGURO para app móvil
-- Recomendación Gemini: encapsular lógica en RPC con SECURITY DEFINER
-- Usa funciones existentes es_superadmin_uid + usuario_tiene_alcance_orden
-- para respetar el perímetro multi-tenant sin tocar las RLS de la web
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_ordenes_activas()
RETURNS SETOF public.orden_trabajo
LANGUAGE plpgsql
SECURITY DEFINER
STRICT
SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT ot.*
    FROM public.orden_trabajo ot
    WHERE ot.activa = true
      AND (
        -- Superadmin ve todo
        public.es_superadmin_uid(auth.uid())
        OR
        -- Técnico/admin solo ve órdenes dentro de su alcance (lógica multi-tenant)
        public.usuario_tiene_alcance_orden(auth.uid(), ot.id)
      )
    ORDER BY ot.created_at DESC;
END;
$$;

-- Solo necesitamos EXECUTE en la función, no en las tablas directamente
GRANT EXECUTE ON FUNCTION public.get_ordenes_activas() TO authenticated;

-- -------------------------------------------------------
-- PARTE 6b: RPC get_table_structure
-- Retorna columnas (column_name, data_type, is_nullable) de una tabla pública
-- Usado por la app para renderizar formularios dinámicamente
-- SECURITY DEFINER: accede a information_schema sin trabas de RLS
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_table_structure(input_table_name text)
RETURNS TABLE(column_name text, data_type text, is_nullable text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.column_name::text,
        c.data_type::text,
        c.is_nullable::text
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = input_table_name
    ORDER BY c.ordinal_position;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_table_structure(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_table_structure(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_table_structure(text) TO public;

-- Forzar recarga del esquema en PostgREST (resuelve PGRST202)
NOTIFY pgrst, 'reload schema';

-- -------------------------------------------------------
-- PARTE 7: RLS en tablas de catálogo (local, zona, empresa)
-- Estas no tienen lógica multi-tenant compleja - lectura libre para auth
-- -------------------------------------------------------
ALTER TABLE local ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso lectura local" ON local;
CREATE POLICY "Acceso lectura local"
  ON local FOR SELECT TO authenticated USING (true);

ALTER TABLE zona ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso lectura zona" ON zona;
CREATE POLICY "Acceso lectura zona"
  ON zona FOR SELECT TO authenticated USING (true);

ALTER TABLE empresa ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso lectura empresa" ON empresa;
CREATE POLICY "Acceso lectura empresa"
  ON empresa FOR SELECT TO authenticated USING (true);

-- -------------------------------------------------------
-- VERIFICAR RESULTADO
-- -------------------------------------------------------
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('orden_trabajo', 'estados_orden_trabajo', 'prioridades',
                    'servicios', 'local', 'zona', 'empresa')
ORDER BY tablename, policyname;

-- Verificar funciones con acceso
SELECT p.proname, a.rolname
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
JOIN pg_proc_grants_view a ON a.oid = p.oid
WHERE n.nspname = 'public'
  AND p.proname IN ('es_superadmin_uid', 'usuario_tiene_alcance_orden');
