-- Habilitar RLS en la tabla observaciones_fotografias
ALTER TABLE observaciones_fotografias ENABLE ROW LEVEL SECURITY;

-- Política para permitir SELECT a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden ver observaciones" ON observaciones_fotografias
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir INSERT a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden insertar observaciones" ON observaciones_fotografias
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir UPDATE a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden actualizar observaciones" ON observaciones_fotografias
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir DELETE a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden eliminar observaciones" ON observaciones_fotografias
    FOR DELETE USING (auth.role() = 'authenticated');