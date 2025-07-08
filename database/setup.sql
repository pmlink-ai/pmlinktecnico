-- Script SQL para crear las tablas necesarias en Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Tabla de roles
CREATE TABLE IF NOT EXISTS rol (
    rol_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre_rol VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de empresas
CREATE TABLE IF NOT EXISTS empresa (
    empresa_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre_empresa VARCHAR(200) NOT NULL,
    direccion TEXT,
    ciudad VARCHAR(100),
    pais VARCHAR(100),
    telefono_contacto VARCHAR(20),
    email_contacto VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de locales
CREATE TABLE IF NOT EXISTS local (
    local_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES empresa(empresa_id) ON DELETE CASCADE,
    nombre_local VARCHAR(200) NOT NULL,
    direccion TEXT,
    ciudad VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de usuarios (vinculada con auth.users de Supabase)
CREATE TABLE IF NOT EXISTS usuario (
    usuario_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    rol_id UUID NOT NULL REFERENCES rol(rol_id),
    empresa_id UUID REFERENCES empresa(empresa_id),
    local_id UUID REFERENCES local(local_id),
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_ultimo_acceso TIMESTAMP WITH TIME ZONE
);

-- 5. Tabla de tipos de mantenimiento
CREATE TABLE IF NOT EXISTS TiposMantenimiento (
    tipo_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre_tipo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla de equipos
CREATE TABLE IF NOT EXISTS equipos (
    equipo_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    local_id UUID NOT NULL REFERENCES local(local_id) ON DELETE CASCADE,
    nombre_equipo VARCHAR(200) NOT NULL,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    numero_serie VARCHAR(100),
    descripcion TEXT,
    ubicacion VARCHAR(200),
    estado VARCHAR(50) DEFAULT 'Operativo',
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar roles por defecto
INSERT INTO rol (nombre_rol, descripcion) VALUES 
('Administrador PM-Link', 'Administrador principal del sistema'),
('Administrador Empresa', 'Administrador de una empresa específica'),
('Técnico', 'Técnico de mantenimiento'),
('Usuario', 'Usuario básico del sistema')
ON CONFLICT (nombre_rol) DO NOTHING;

-- Insertar empresa de prueba
INSERT INTO empresa (nombre_empresa, direccion, ciudad, pais, telefono_contacto, email_contacto) 
SELECT 'Empresa Demo', 'Calle Ejemplo 123', 'Ciudad Demo', 'Colombia', '+57 300 123 4567', 'demo@empresa.com'
WHERE NOT EXISTS (
    SELECT 1 FROM empresa WHERE nombre_empresa = 'Empresa Demo'
);

-- IMPORTANTE: Para crear el usuario de prueba, usar uno de estos métodos:
-- 
-- MÉTODO 1 (RECOMENDADO): Desde el Dashboard de Supabase
-- 1. Ve a Authentication > Users
-- 2. Click "Add user"
-- 3. Email: admin@pmlink.com
-- 4. Password: admin123456
-- 5. Auto Confirm User: ✓
--
-- MÉTODO 2: Usando auth.signup() (ejecutar después de este script)
-- SELECT auth.signup('admin@pmlink.com', 'admin123456', '{"nombres": "Administrador", "apellidos": "PM-Link"}'::jsonb);
--
-- El trigger automáticamente creará el registro en la tabla usuario

-- Función para crear usuario automáticamente cuando se registra en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    admin_role_id UUID;
BEGIN
    -- Obtener el ID del rol de administrador
    SELECT rol_id INTO admin_role_id FROM rol WHERE nombre_rol = 'Administrador PM-Link' LIMIT 1;
    
    -- Insertar el usuario en la tabla usuario
    INSERT INTO public.usuario (usuario_id, rol_id, nombres, apellidos, email)
    VALUES (
        NEW.id,
        admin_role_id,
        COALESCE(NEW.raw_user_meta_data->>'nombres', 'Admin'),
        COALESCE(NEW.raw_user_meta_data->>'apellidos', 'User'),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear usuario automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE rol ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE local ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE TiposMantenimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver su propia información
CREATE POLICY "Users can view own data" ON usuario
    FOR SELECT USING (auth.uid() = usuario_id);

-- Política para que los administradores puedan ver todo
CREATE POLICY "Admins can view all users" ON usuario
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuario u 
            JOIN rol r ON u.rol_id = r.rol_id 
            WHERE u.usuario_id = auth.uid() 
            AND r.nombre_rol IN ('Administrador PM-Link', 'Administrador Empresa')
        )
    );

-- Políticas similares para otras tablas
CREATE POLICY "Users can view empresas" ON empresa
    FOR SELECT USING (true);

CREATE POLICY "Users can view locales" ON local
    FOR SELECT USING (true);

CREATE POLICY "Users can view roles" ON rol
    FOR SELECT USING (true);

CREATE POLICY "Users can view tipos mantenimiento" ON TiposMantenimiento
    FOR SELECT USING (true);

CREATE POLICY "Users can view equipos" ON equipos
    FOR SELECT USING (true);
