# Instrucciones de Integración - Formularios ANSUL R-102 y Reparaciones Adicionales

## Modificaciones Requeridas en la Aplicación Principal

### 1. Integración en el Componente OTDetailScreen

Busca la función `renderForm` dentro del componente `OTDetailScreen` y añade los siguientes casos en el switch:

```javascript
function renderForm() {
    if (!showForm || !order.form_type) return null;
    
    switch (order.form_type) {
        case 'informe_electromecanico':
            return React.createElement(ElectromecanicoForm, {
                order: order,
                onSaveSuccess: () => setShowForm(false)
            });
        case 'informe_limpieza_ductos':
            return React.createElement(LimpiezaDuctosForm, {
                order: order,
                onSaveSuccess: () => setShowForm(false)
            });
        // AÑADIR ESTOS DOS CASOS NUEVOS:
        case 'informe_ansul_r102':
            return React.createElement(AnsulR102Form, {
                order: order,
                onSaveSuccess: () => setShowForm(false)
            });
        case 'informe_reparaciones_adicionales':
            return React.createElement(ReparacionesAdicionalesForm, {
                order: order,
                onSaveSuccess: () => setShowForm(false)
            });
        default:
            return React.createElement('div', { className: 'no-form' },
                React.createElement('p', null, 'Formulario no disponible para este tipo de mantenimiento.')
            );
    }
}
```

### 2. Actualización en el Componente DashboardScreen

Busca la función `fetchInitialData` dentro del componente `DashboardScreen` y actualiza el mapeo de `form_type`:

```javascript
const fetchInitialData = async () => {
    setLoading(true);
    try {
        // ... código existente para obtener órdenes ...

        // ACTUALIZAR ESTE MAPEO:
        const mappedOrders = ordersData.map(o => ({
            ...o,
            form_type: o.tiposmantenimiento?.nombre?.toLowerCase().includes('electromecanico') ? 'informe_electromecanico' :
                      (o.tiposmantenimiento?.nombre?.toLowerCase().includes('limpieza') ? 'informe_limpieza_ductos' :
                      (o.tiposmantenimiento?.nombre?.toLowerCase().includes('ansul') ? 'informe_ansul_r102' :
                      (o.tiposmantenimiento?.nombre?.toLowerCase().includes('reparacion') ? 'informe_reparaciones_adicionales' : null)))
        }));

        setOrders(mappedOrders);
        // ... resto del código ...
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        setLoading(false);
    }
};
```

### 3. Inclusión de los Componentes en el HTML

Asegúrate de que los componentes estén incluidos en tu archivo HTML principal. Puedes hacerlo de dos maneras:

#### Opción A: Incluir el archivo JavaScript completo
```html
<!-- Después de tus otros scripts de componentes -->
<script src="components/FormulariosAdicionales.js"></script>
```

#### Opción B: Incluir directamente en el HTML (si trabajas con un solo archivo)
Copia el contenido del archivo `FormulariosAdicionales.js` y pégalo en tu archivo HTML principal, dentro de las etiquetas `<script>`, después de los otros componentes existentes.

### 4. Verificación de las Tablas en Supabase

Asegúrate de que las siguientes tablas existan en tu base de datos Supabase:

#### Tabla: informe_ansul_r102
```sql
CREATE TABLE informe_ansul_r102 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_trabajo_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    inspeccion_visual_montaje TEXT,
    estado_cartuchos_gas TEXT,
    estado_canerias_distribucion TEXT,
    estado_montaje_conductos TEXT,
    prueba_fuga_caneria TEXT,
    prueba_soplado_canerias TEXT,
    revision_agente TEXT,
    estado_cilindro_agente TEXT,
    estado_disco_ruptura TEXT,
    cantidad_estado_boquillas TEXT,
    tipo_tapones_boquillas TEXT,
    estado_piola_acero TEXT,
    verificacion_automan_gas TEXT,
    verificacion_senal_alarma TEXT,
    observaciones_generales TEXT,
    CONSTRAINT informe_ansul_r102_orden_trabajo_id_fkey 
        FOREIGN KEY (orden_trabajo_id) REFERENCES orden_trabajo(id) ON DELETE CASCADE
);
```

#### Tabla: informe_reparaciones_adicionales
```sql
CREATE TABLE informe_reparaciones_adicionales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_trabajo_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    tipo_reparacion TEXT,
    resumen_trabajos TEXT,
    observaciones_generales TEXT,
    CONSTRAINT informe_reparaciones_adicionales_orden_trabajo_id_fkey 
        FOREIGN KEY (orden_trabajo_id) REFERENCES orden_trabajo(id) ON DELETE CASCADE
);
```

### 5. Configuración de Tipos de Mantenimiento

En tu tabla `tiposmantenimiento`, asegúrate de tener registros que incluyan las palabras clave para el mapeo automático:

- Para ANSUL R-102: nombre debe contener "ansul" (ej: "Mantenimiento ANSUL R-102")
- Para Reparaciones: nombre debe contener "reparacion" (ej: "Reparaciones Adicionales")

### 6. Prueba de Funcionamiento

1. **Reinicia la aplicación** después de hacer las modificaciones
2. **Verifica que los nuevos formularios aparezcan** en las órdenes de trabajo correspondientes
3. **Prueba el guardado** de cada formulario para asegurar que los datos se inserten correctamente
4. **Revisa la consola** del navegador para detectar posibles errores

### 7. Estilos CSS (Opcional)

Si necesitas estilos específicos para los nuevos formularios, puedes añadir:

```css
.form-container .form-title {
    color: #2c3e50;
    border-bottom: 2px solid #3498db;
    padding-bottom: 10px;
    margin-bottom: 25px;
}

.form-actions {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
```

## Resumen de Archivos Creados

1. ✅ `components/FormulariosAdicionales.js` - Contiene los componentes AnsulR102Form y ReparacionesAdicionalesForm
2. ✅ Este archivo de instrucciones con todos los pasos de integración

¡Los formularios están listos para ser integrados en tu aplicación CMMS!
