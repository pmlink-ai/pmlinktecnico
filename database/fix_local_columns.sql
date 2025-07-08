-- Script para verificar y crear la estructura correcta de la tabla local
-- Estructura definida:
-- local_id (UUID, PK): Identificador único de la sede.
-- empresa_id (UUID, FK): Referencia a Empresas.empresa_id.
-- nombre_local (VARCHAR(255), NOT NULL): Nombre de la sede.
-- direccion (VARCHAR(255)): Dirección específica de la sede.
-- ciudad (VARCHAR(100)): Ciudad de la sede.
-- telefono (VARCHAR(50)): Teléfono de contacto de la sede.
-- email (VARCHAR(255)): Correo electrónico de contacto de la sede.
-- activo (BOOLEAN, DEFAULT TRUE): Indica si la sede está activa.
-- fecha_creacion (DATETIME, NOT NULL): Fecha y hora en que se registró la sede.

-- 1. Ver la estructura actual de la tabla local
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'local' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Agregar/corregir columnas según la estructura definida
DO $$
BEGIN
    -- Agregar direccion si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'local' 
        AND column_name = 'direccion' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE local ADD COLUMN direccion VARCHAR(255);
        RAISE NOTICE 'Columna direccion agregada';
    ELSE
        RAISE NOTICE 'Columna direccion ya existe';
    END IF;

    -- Agregar ciudad si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'local' 
        AND column_name = 'ciudad' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE local ADD COLUMN ciudad VARCHAR(100);
        RAISE NOTICE 'Columna ciudad agregada';
    ELSE
        RAISE NOTICE 'Columna ciudad ya existe';
    END IF;

    -- Agregar telefono si no existe (nota: el campo se llama 'telefono', no 'telefono_contacto')
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'local' 
        AND column_name = 'telefono' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE local ADD COLUMN telefono VARCHAR(50);
        RAISE NOTICE 'Columna telefono agregada';
    ELSE
        RAISE NOTICE 'Columna telefono ya existe';
    END IF;

    -- Agregar email si no existe (nota: el campo se llama 'email', no 'email_contacto')
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'local' 
        AND column_name = 'email' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE local ADD COLUMN email VARCHAR(255);
        RAISE NOTICE 'Columna email agregada';
    ELSE
        RAISE NOTICE 'Columna email ya existe';
    END IF;

    -- Verificar que activo existe y tiene default correcto
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'local' 
        AND column_name = 'activo' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE local ADD COLUMN activo BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Columna activo agregada';
    ELSE
        RAISE NOTICE 'Columna activo ya existe';
    END IF;

    -- Verificar que fecha_creacion existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'local' 
        AND column_name = 'fecha_creacion' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE local ADD COLUMN fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW();
        RAISE NOTICE 'Columna fecha_creacion agregada';
    ELSE
        RAISE NOTICE 'Columna fecha_creacion ya existe';
    END IF;

    -- Eliminar columnas con nombres incorrectos si existen
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'local' 
        AND column_name = 'telefono_contacto' 
        AND table_schema = 'public'
    ) THEN
        -- Copiar datos si existe telefono_contacto pero no telefono
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'local' 
            AND column_name = 'telefono' 
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE local ADD COLUMN telefono VARCHAR(50);
            UPDATE local SET telefono = telefono_contacto WHERE telefono_contacto IS NOT NULL;
        END IF;
        -- No eliminar la columna antigua por seguridad, solo informar
        RAISE NOTICE 'Encontrada columna telefono_contacto - considerar migrar datos a telefono';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'local' 
        AND column_name = 'email_contacto' 
        AND table_schema = 'public'
    ) THEN
        -- Copiar datos si existe email_contacto pero no email
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'local' 
            AND column_name = 'email' 
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE local ADD COLUMN email VARCHAR(255);
            UPDATE local SET email = email_contacto WHERE email_contacto IS NOT NULL;
        END IF;
        -- No eliminar la columna antigua por seguridad, solo informar
        RAISE NOTICE 'Encontrada columna email_contacto - considerar migrar datos a email';
    END IF;
END $$;

-- 3. Verificar la estructura final
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'local' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Deshabilitar RLS temporalmente para desarrollo
ALTER TABLE local DISABLE ROW LEVEL SECURITY;

SELECT 'Verificación y corrección de tabla local completada' as resultado;
