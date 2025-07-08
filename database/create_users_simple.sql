-- Script simple para crear usuarios solo en la tabla usuario
-- Sin usar auth.users de Supabase

-- Paso 1: Verificar que la tabla usuario existe y está preparada
SELECT 'VERIFICANDO TABLA USUARIO...' as status;

-- Agregar columna password si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuario' AND column_name = 'password') THEN
        ALTER TABLE usuario ADD COLUMN password VARCHAR(255);
        RAISE NOTICE 'Columna password agregada a tabla usuario';
    ELSE
        RAISE NOTICE 'Columna password ya existe';
    END IF;
END $$;

-- Modificar la columna usuario_id para que no requiera referencia a auth.users
DO $$
BEGIN
    -- Primero, eliminar la constraint de foreign key si existe
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name LIKE '%usuario_usuario_id_fkey%') THEN
        ALTER TABLE usuario DROP CONSTRAINT usuario_usuario_id_fkey;
        RAISE NOTICE 'Constraint de foreign key eliminada';
    END IF;
    
    -- Cambiar usuario_id para que genere UUID automáticamente
    ALTER TABLE usuario ALTER COLUMN usuario_id SET DEFAULT gen_random_uuid();
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error modificando tabla: %', SQLERRM;
END $$;

-- Paso 2: Limpiar usuarios existentes (opcional)
-- TRUNCATE TABLE usuario; -- Descomenta si quieres empezar limpio

-- Paso 3: Crear usuario admin simple
INSERT INTO usuario (
    rol_id,
    nombres,
    apellidos,
    email,
    password,
    activo
) 
SELECT 
    r.rol_id,
    'Administrador',
    'PM-Link',
    'admin@pmlink.com',
    'admin123456', -- En producción esto debería ser un hash
    true
FROM rol r
WHERE r.nombre_rol = 'Administrador PM-Link'
ON CONFLICT (email) DO UPDATE SET
    nombres = EXCLUDED.nombres,
    apellidos = EXCLUDED.apellidos,
    password = EXCLUDED.password,
    activo = EXCLUDED.activo;

-- Paso 4: Crear usuario admin2 simple
INSERT INTO usuario (
    rol_id,
    nombres,
    apellidos,
    email,
    password,
    activo
) 
SELECT 
    r.rol_id,
    'Admin2',
    'PM-Link',
    'admin2@pmlink.com',
    'admin123456',
    true
FROM rol r
WHERE r.nombre_rol = 'Administrador PM-Link'
ON CONFLICT (email) DO UPDATE SET
    nombres = EXCLUDED.nombres,
    apellidos = EXCLUDED.apellidos,
    password = EXCLUDED.password,
    activo = EXCLUDED.activo;

-- Paso 5: Verificación final
SELECT 'USUARIOS CREADOS:' as status;

SELECT 
    u.usuario_id,
    u.nombres,
    u.apellidos,
    u.email,
    r.nombre_rol,
    u.activo,
    u.fecha_creacion
FROM usuario u
JOIN rol r ON u.rol_id = r.rol_id
ORDER BY u.fecha_creacion;

SELECT 'CREDENCIALES DE PRUEBA:' as info;
SELECT 'admin@pmlink.com / admin123456' as credenciales
UNION ALL
SELECT 'admin2@pmlink.com / admin123456' as credenciales;

SELECT 'Sistema listo para login simple!' as resultado;
