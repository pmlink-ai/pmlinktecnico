// Componente para el Formulario ANSUL R-102
function AnsulR102Form({ order, onSaveSuccess }) {
    // Estado para manejar todos los campos del formulario
    const [formData, setFormData] = React.useState({
        inspeccion_visual_montaje: '',
        estado_cartuchos_gas: '',
        estado_canerias_distribucion: '',
        estado_montaje_conductos: '',
        prueba_fuga_caneria: '',
        prueba_soplado_canerias: '',
        revision_agente: '',
        estado_cilindro_agente: '',
        estado_disco_ruptura: '',
        cantidad_estado_boquillas: '',
        tipo_tapones_boquillas: '',
        estado_piola_acero: '',
        verificacion_automan_gas: '',
        verificacion_senal_alarma: '',
        observaciones_generales: ''
    });

    const [isSaving, setIsSaving] = React.useState(false);

    // Función para manejar cambios en los campos
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Función para guardar el formulario
    const handleSave = async () => {
        setIsSaving(true);
        
        try {
            // Construir el objeto con todos los datos del formulario
            const dataToSave = {
                ...formData,
                orden_trabajo_id: order.id
            };

            // Insertar en la tabla informe_ansul_r102
            const { data, error } = await sbClient
                .from('informe_ansul_r102')
                .insert([dataToSave]);

            if (error) throw error;

            // Mostrar mensaje de éxito
            alert('¡Informe ANSUL R-102 guardado con éxito!');
            
            // Llamar a la función de éxito
            onSaveSuccess();

        } catch (error) {
            console.error('Error al guardar informe ANSUL R-102:', error);
            alert('Error al guardar el informe: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return React.createElement('div', { className: 'form-container' },
        React.createElement('h2', { className: 'form-title' }, 'Informe Semestral ANSUL R-102'),
        
        // Sección: Diagnóstico General
        React.createElement(FormSection, { title: 'Diagnóstico General' },
            React.createElement(FormInput, {
                label: 'Inspección Visual del Montaje',
                value: formData.inspeccion_visual_montaje,
                onChange: (value) => handleInputChange('inspeccion_visual_montaje', value),
                placeholder: 'Sistema montado correctamente'
            }),
            React.createElement(FormInput, {
                label: 'Estado de Cartuchos de Gas',
                value: formData.estado_cartuchos_gas,
                onChange: (value) => handleInputChange('estado_cartuchos_gas', value),
                placeholder: 'Cartuchos en buen estado, sin fugas'
            }),
            React.createElement(FormInput, {
                label: 'Estado de Cañerías de Distribución',
                value: formData.estado_canerias_distribucion,
                onChange: (value) => handleInputChange('estado_canerias_distribucion', value),
                placeholder: 'Cañerías sin obstrucciones ni daños'
            }),
            React.createElement(FormInput, {
                label: 'Estado de Montaje de Conductos',
                value: formData.estado_montaje_conductos,
                onChange: (value) => handleInputChange('estado_montaje_conductos', value),
                placeholder: 'Conductos bien fijados y sellados'
            })
        ),

        // Sección: Pruebas del Sistema
        React.createElement(FormSection, { title: 'Pruebas del Sistema' },
            React.createElement(FormInput, {
                label: 'Prueba de Fuga en Cañería',
                value: formData.prueba_fuga_caneria,
                onChange: (value) => handleInputChange('prueba_fuga_caneria', value),
                placeholder: 'Sin fugas detectadas en el sistema'
            }),
            React.createElement(FormInput, {
                label: 'Prueba de Soplado de Cañerías',
                value: formData.prueba_soplado_canerias,
                onChange: (value) => handleInputChange('prueba_soplado_canerias', value),
                placeholder: 'Flujo de aire correcto en todas las líneas'
            }),
            React.createElement(FormInput, {
                label: 'Revisión del Agente',
                value: formData.revision_agente,
                onChange: (value) => handleInputChange('revision_agente', value),
                placeholder: 'Agente extintor en condiciones óptimas'
            })
        ),

        // Sección: Componentes del Sistema
        React.createElement(FormSection, { title: 'Componentes del Sistema' },
            React.createElement(FormInput, {
                label: 'Estado del Cilindro de Agente',
                value: formData.estado_cilindro_agente,
                onChange: (value) => handleInputChange('estado_cilindro_agente', value),
                placeholder: 'Cilindro sin corrosión, presión correcta'
            }),
            React.createElement(FormInput, {
                label: 'Estado del Disco de Ruptura',
                value: formData.estado_disco_ruptura,
                onChange: (value) => handleInputChange('estado_disco_ruptura', value),
                placeholder: 'Disco íntegro, sin deformaciones'
            }),
            React.createElement(FormInput, {
                label: 'Cantidad y Estado de Boquillas',
                value: formData.cantidad_estado_boquillas,
                onChange: (value) => handleInputChange('cantidad_estado_boquillas', value),
                placeholder: '12 boquillas en buen estado'
            }),
            React.createElement(FormInput, {
                label: 'Tipos de Tapones de Boquillas',
                value: formData.tipo_tapones_boquillas,
                onChange: (value) => handleInputChange('tipo_tapones_boquillas', value),
                placeholder: 'Tapones estándar, bien sellados'
            }),
            React.createElement(FormInput, {
                label: 'Estado de Piola de Acero',
                value: formData.estado_piola_acero,
                onChange: (value) => handleInputChange('estado_piola_acero', value),
                placeholder: 'Cable de acero sin corte ni desgaste'
            })
        ),

        // Sección: Verificaciones Finales
        React.createElement(FormSection, { title: 'Verificaciones Finales' },
            React.createElement(FormInput, {
                label: 'Verificación Automática/Manual de Gas',
                value: formData.verificacion_automan_gas,
                onChange: (value) => handleInputChange('verificacion_automan_gas', value),
                placeholder: 'Sistema responde correctamente'
            }),
            React.createElement(FormInput, {
                label: 'Verificación de Señal de Alarma',
                value: formData.verificacion_senal_alarma,
                onChange: (value) => handleInputChange('verificacion_senal_alarma', value),
                placeholder: 'Alarma audible y visual funcionando'
            })
        ),

        // Sección: Observaciones
        React.createElement(FormSection, { title: 'Observaciones' },
            React.createElement(FormTextarea, {
                label: 'Observaciones Generales',
                value: formData.observaciones_generales,
                onChange: (value) => handleInputChange('observaciones_generales', value),
                placeholder: 'Registre aquí cualquier observación adicional sobre el sistema ANSUL R-102...'
            })
        ),

        // Botones de acción
        React.createElement('div', { className: 'form-actions' },
            React.createElement('button', {
                className: 'btn btn-primary',
                onClick: handleSave,
                disabled: isSaving
            }, isSaving ? 'Guardando...' : 'Guardar Informe'),
            
            React.createElement('button', {
                className: 'btn btn-secondary',
                onClick: onSaveSuccess,
                disabled: isSaving
            }, 'Cancelar')
        )
    );
}

// Componente para el Formulario de Reparaciones Adicionales
function ReparacionesAdicionalesForm({ order, onSaveSuccess }) {
    // Estado para manejar los campos del formulario
    const [formData, setFormData] = React.useState({
        tipo_reparacion: '',
        resumen_trabajos: '',
        observaciones_generales: ''
    });

    const [isSaving, setIsSaving] = React.useState(false);

    // Función para manejar cambios en los campos
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Función para guardar el formulario
    const handleSave = async () => {
        setIsSaving(true);
        
        try {
            // Construir el objeto con todos los datos del formulario
            const dataToSave = {
                ...formData,
                orden_trabajo_id: order.id
            };

            // Insertar en la tabla informe_reparaciones_adicionales
            const { data, error } = await sbClient
                .from('informe_reparaciones_adicionales')
                .insert([dataToSave]);

            if (error) throw error;

            // Mostrar mensaje de éxito
            alert('¡Informe de Reparaciones Adicionales guardado con éxito!');
            
            // Llamar a la función de éxito
            onSaveSuccess();

        } catch (error) {
            console.error('Error al guardar informe de reparaciones:', error);
            alert('Error al guardar el informe: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return React.createElement('div', { className: 'form-container' },
        React.createElement('h2', { className: 'form-title' }, 'Informe de Reparaciones Adicionales'),
        
        // Sección: Información de la Reparación
        React.createElement(FormSection, { title: 'Información de la Reparación' },
            React.createElement(FormInput, {
                label: 'Tipo de Reparación',
                value: formData.tipo_reparacion,
                onChange: (value) => handleInputChange('tipo_reparacion', value),
                placeholder: 'Ej: Levantamiento, Montaje, Soldadura, Instalación'
            })
        ),

        // Sección: Detalles del Trabajo
        React.createElement(FormSection, { title: 'Detalles del Trabajo' },
            React.createElement(FormTextarea, {
                label: 'Resumen de Trabajos Realizados',
                value: formData.resumen_trabajos,
                onChange: (value) => handleInputChange('resumen_trabajos', value),
                placeholder: 'Describa detalladamente los trabajos realizados, materiales utilizados, procedimientos aplicados...'
            }),
            React.createElement(FormTextarea, {
                label: 'Observaciones Generales',
                value: formData.observaciones_generales,
                onChange: (value) => handleInputChange('observaciones_generales', value),
                placeholder: 'Incluya observaciones adicionales, recomendaciones, seguimiento requerido...'
            })
        ),

        // Botones de acción
        React.createElement('div', { className: 'form-actions' },
            React.createElement('button', {
                className: 'btn btn-primary',
                onClick: handleSave,
                disabled: isSaving
            }, isSaving ? 'Guardando...' : 'Guardar Informe'),
            
            React.createElement('button', {
                className: 'btn btn-secondary',
                onClick: onSaveSuccess,
                disabled: isSaving
            }, 'Cancelar')
        )
    );
}
