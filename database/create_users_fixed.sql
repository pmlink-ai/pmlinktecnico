-- Script corregido para crear usuarios simples
-- Sin ambigüedades en las columnas

-- Paso 1: Agregar columna password si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuario' AND column_name = 'password') THEN
        ALTER TABLE usuario ADD COLUMN password VARCHAR(255);
        RAISE NOTICE 'Columna password agregada';
    ELSE
        RAISE NOTICE 'Columna password ya existe';
    END IF;
END $$;

-- Paso 2: Eliminar constraint de foreign key si existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name LIKE '%usuario_usuario_id_fkey%') THEN
        ALTER TABLE usuario DROP CONSTRAINT usuario_usuario_id_fkey;
        RAISE NOTICE 'Foreign key eliminada';
    END IF;
    
    ALTER TABLE usuario ALTER COLUMN usuario_id SET DEFAULT gen_random_uuid();
    RAISE NOTICE 'Default UUID configurado';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
END $$;

-- Paso 3: Obtener el rol de administrador
DO $$
DECLARE
    admin_role_id UUID;
BEGIN
    SELECT rol_id INTO admin_role_id FROM rol WHERE nombre_rol = 'Administrador PM-Link' LIMIT 1;
    
    IF admin_role_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el rol Administrador PM-Link';
    END IF;
    
    -- Crear usuario admin
    INSERT INTO usuario (rol_id, nombres, apellidos, email, password, activo)
    VALUES (admin_role_id, 'Administrador', 'PM-Link', 'admin@pmlink.com', 'admin123456', true)
    ON CONFLICT (email) DO UPDATE SET
        nombres = EXCLUDED.nombres,
        apellidos = EXCLUDED.apellidos,
        password = EXCLUDED.password,
        activo = EXCLUDED.activo;
    
    -- Crear usuario admin2
    INSERT INTO usuario (rol_id, nombres, apellidos, email, password, activo)
    VALUES (admin_role_id, 'Admin2', 'PM-Link', 'admin2@pmlink.com', 'admin123456', true)
    ON CONFLICT (email) DO UPDATE SET
        nombres = EXCLUDED.nombres,
        apellidos = EXCLUDED.apellidos,
        password = EXCLUDED.password,
        activo = EXCLUDED.activo;
    
    RAISE NOTICE 'Usuarios creados exitosamente';
END $$;

-- Verificación final
SELECT 'VERIFICACIÓN FINAL:' as resultado;

-- Mostrar usuarios creados
SELECT 
    u.email,
    u.nombres,
    u.apellidos,
    r.nombre_rol as rol,
    u.activo,
    u.password
FROM usuario u
JOIN rol r ON u.rol_id = r.rol_id
WHERE u.email IN ('admin@pmlink.com', 'admin2@pmlink.com')
ORDER BY u.email;

-- Contar total de usuarios
SELECT 'Total usuarios:' as info, COUNT(*) as cantidad FROM usuario;

-- Credenciales
SELECT 'CREDENCIALES:' as info;
SELECT 'admin@pmlink.com / admin123456' as login;
SELECT 'admin2@pmlink.com / admin123456' as login;
