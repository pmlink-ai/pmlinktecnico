# GUÍA TÉCNICA - IMPLEMENTACIÓN ANSUL R-102

## 🔧 EJEMPLOS DE CÓDIGO CRÍTICOS

### 1. ESTRUCTURA DE VALIDACIÓN TÍPICA

```javascript
// Patrón estándar usado en todas las validaciones ANSUL R-102
const isComponenteCompleteForm = async () => {
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('🔍 VALIDACIÓN [COMPONENTE] ([DESCRIPCIÓN])');
  console.log('═══════════════════════════════════════');
  try {
    console.log('📋 Orden ID:', order.id);
    
    // Verificar fotografías (si aplica)
    const { data: fotografias, error: errorFoto } = await supabase
      .from('informe_fotografias')
      .select('id')
      .eq('orden_trabajo_id', order.id)
      .eq('componente', '[COMPONENTE_KEY]')
      .eq('seccion', '[SECCION]');

    console.log('📸 Fotografías encontradas:', fotografias, 'Error:', errorFoto);
    
    // Verificar observaciones (si aplica)
    const { data: observaciones, error: errorObs } = await supabase
      .from('observaciones_fotografias')
      .select('observaciones')
      .eq('orden_trabajo_id', order.id)
      .eq('componente', '[COMPONENTE_KEY]')
      .eq('seccion', '[SECCION]');

    console.log('📝 Observaciones encontradas:', observaciones, 'Error:', errorObs);

    // Evaluar condiciones
    const hasFotografia = fotografias && fotografias.length > 0;
    const hasObservaciones = observaciones && observaciones.length > 0 && 
                             observaciones[0]?.observaciones && 
                             observaciones[0].observaciones.trim() !== '';

    console.log('✅ Validación resultados:');
    console.log('  - Fotografía:', hasFotografia);
    console.log('  - Observaciones:', hasObservaciones);
    
    const isComplete = hasFotografia && hasObservaciones; // Ajustar según necesidades
    console.log('');
    console.log('🎯 RESULTADO FINAL:', isComplete ? '✅ COMPLETO' : '❌ INCOMPLETO');
    console.log('═══════════════════════════════════════');
    console.log('');
    
    return isComplete;
  } catch (error) {
    console.log('');
    console.log('❌ ERROR EN VALIDACIÓN:', error.message);
    console.log('   Stack:', error.stack);
    console.log('═══════════════════════════════════════');
    console.log('');
    return false;
  }
};
```

### 2. COMPONENTE DE RENDERIZADO ESPECIALIZADO

```javascript
// Patrón para componentes con validación visual
const renderComponenteEspecial = (componenteKey) => {
  const images = imagesByComponenteAndSeccion[componenteKey]?.['SECCION'] || [];
  const uploadingKey = `${componenteKey}_SECCION`;
  const isUploading = uploading[uploadingKey];

  return (
    <View style={styles.componentContent}>
      {/* Sección de fotografía */}
      <View style={styles.componentSection}>
        <View style={[styles.sectionHeader, { backgroundColor: '#COLOR' }]}>
          <Text style={styles.sectionTitle}>FOTOGRAFÍA *</Text>
          {images.length > 0 && (
            <Text style={styles.sectionCount}>({images.length})</Text>
          )}
        </View>
        
        {images.length > 0 && (
          <FlatList
            data={images}
            renderItem={renderImage}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.sectionImagesList}
          />
        )}
        
        <TouchableOpacity 
          style={[
            styles.addSectionPhotoButton, 
            {
              borderColor: images.length === 0 ? '#FF6B6B' : '#COLOR',
              borderWidth: images.length === 0 ? 2 : 1
            }
          ]}
          onPress={() => pickImage(componenteKey, 'SECCION')}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#COLOR" />
          ) : (
            <>
              <Text style={[styles.addPhotoIcon, { color: images.length === 0 ? '#FF6B6B' : '#COLOR' }]}>📷</Text>
              <Text style={[styles.addSectionPhotoText, { color: images.length === 0 ? '#FF6B6B' : '#COLOR' }]}>
                {images.length === 0 ? 'Fotografía Obligatoria' : 'Subir Fotografía'}
              </Text>
            </>
          )}
        </TouchableOpacity>
        {images.length === 0 && (
          <Text style={styles.requiredFieldText}>* Fotografía obligatoria</Text>
        )}
        
        {/* Campo de observaciones con validación */}
        <View style={styles.observacionesContainer}>
          <Text style={styles.observacionesLabel}>CAMPO OBLIGATORIO: *</Text>
          <TextInput
            style={[
              styles.observacionesInput,
              (!observacionesSecciones[`${componenteKey}_SECCION`] || observacionesSecciones[`${componenteKey}_SECCION`].trim() === '') && {
                borderColor: '#FF6B6B',
                borderWidth: 2
              }
            ]}
            placeholder="Este campo es obligatorio..."
            multiline
            numberOfLines={3}
            value={observacionesSecciones[`${componenteKey}_SECCION`] || ''}
            onChangeText={(text) => handleObservacionSeccionChange(componenteKey, 'SECCION', text)}
            textAlignVertical="top"
            selectTextOnFocus={false}
            autoCorrect={false}
            autoCapitalize="sentences"
          />
          {(!observacionesSecciones[`${componenteKey}_SECCION`] || observacionesSecciones[`${componenteKey}_SECCION`].trim() === '') && (
            <Text style={styles.requiredFieldText}>* Campo obligatorio</Text>
          )}
        </View>
      </View>
    </View>
  );
};
```

### 3. INTEGRACIÓN EN handleSubmit

```javascript
// Patrón de validación en handleSubmit
if (informeTabla === 'informe_ansul_r102') {
  // Validación específica para [COMPONENTE]
  console.log('🔍 Ejecutando validación [Componente]...');
  const componenteComplete = await isComponenteCompleteForm();
  console.log('📋 Resultado validación [Componente]:', componenteComplete);
  
  if (!componenteComplete) {
    console.log('❌ Validación [Componente] falló - mostrando alerta');
    Alert.alert(
      '[TÍTULO] Incompleto',
      'Para actualizar los datos debes completar la sección "[DESCRIPCIÓN]":\n\n• Fotografía (obligatoria)\n• Campo observaciones (obligatorio)\n\nVe a la sección FOTOGRAFÍAS para completar estos campos.',
      [
        { 
          text: 'Saltar validación (temporal)', 
          onPress: () => {
            console.log('⚠️ Usuario saltó validación [Componente] - continuando guardado');
            // Continuar con el guardado sin validación
          }, 
          style: 'destructive' 
        },
        { text: 'Entendido', style: 'default' }
      ]
    );
    return;
  } else {
    console.log('✅ Validación [Componente] pasó - continuando con guardado');
  }
}
```

## 📊 MAPEO DE DATOS ESPECÍFICOS ANSUL R-102

### Componentes y Sus Características

| Componente | Secciones | Validaciones | Renderizado Especial |
|------------|-----------|--------------|---------------------|
| Cartuchos_Gas | ANTES, DESPUES | Fotos ANTES+DESPUES, Observaciones | renderCartuchosGasComponent |
| Boquillas_Sistema | FOTO | Foto, Medida de toma | renderValvulaGasComponent |
| Panel_Control | FOTO | Foto, Estado | renderAlimentacionElectricaComponent |
| Pruebas_Sistema | FOTO | Foto, Estado y observaciones | renderPanelAlarmaComponent |
| Prueba_Neumatica | PROCESO | Foto, Estado y observaciones | renderPruebaNeumaticaComponent |
| Tipo_Cartucho | PROCESO | Foto, Estado y observaciones | renderTipoCartuchoComponent |
| Recibo_Conforme | ANTES | Solo foto de conformidad | renderReciboConformeSection |

### Configuración de Colores por Componente

```javascript
// Colores usados en la interfaz
const componentColors = {
  'Cartuchos_Gas': '#DC3545',     // Rojo para fusibles térmicos
  'Boquillas_Sistema': '#45B7D1', // Azul para válvula de gas
  'Panel_Control': '#45B7D1',     // Azul para alimentación eléctrica
  'Pruebas_Sistema': '#45B7D1',   // Azul para panel de alarma
  'Prueba_Neumatica': '#45B7D1',  // Azul para prueba neumática
  'Tipo_Cartucho': '#45B7D1',     // Azul para tipo de cartucho
  'Recibo_Conforme': '#28A745'    // Verde para recibo conforme
};
```

## 🎨 ESTILOS DE VALIDACIÓN

### CSS para Elementos de Validación

```javascript
// Estilos críticos para validación visual
const validationStyles = {
  requiredFieldText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
    textAlign: 'center'
  },
  
  // Borde rojo para campos obligatorios vacíos
  invalidField: {
    borderColor: '#FF6B6B',
    borderWidth: 2
  },
  
  // Color para texto obligatorio
  requiredColor: '#FF6B6B',
  
  // Color normal para campos completos
  validColor: '#45B7D1' // o el color específico del componente
};
```

## 📄 ESTRUCTURA HTML DEL PDF

### Template Base para PDF ANSUL R-102

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    /* CSS específico para ANSUL R-102 */
    .header { /* Encabezado con logo */ }
    .form-section { /* Sección de campos */ }
    .photos-section { /* Sección de fotografías */ }
    .component-photos { /* Fotos por componente */ }
  </style>
</head>
<body>
  <!-- Estructura del PDF -->
</body>
</html>
```

### Mapeo de Fotografías en PDF

```javascript
// Lógica para organizar fotos en el PDF
const photoSections = [
  'RECAMBIO_FUSIBLES_TERMICOS',
  'VALVULA_GAS', 
  'ALIMENTACION_ELECTRICA',
  'PANEL_ALARMA',
  'PRUEBA_NEUMATICA_CANERIAS',
  'TIPO_CARTUCHO_EXPULSOR',
  'RECIBO_CONFORME'
];
```

## 🔄 FLUJO DE DATOS

### 1. Carga de Estructura
```
componentesAnsulR102 → secciones → renderizado
```

### 2. Captura de Fotografías  
```
pickImage → componente/sección → Supabase Storage → imagesByComponenteAndSeccion
```

### 3. Observaciones
```
TextInput → observacionesSecciones → handleObservacionSeccionChange → Supabase
```

### 4. Validación
```
handleSubmit → validaciones secuenciales → Alert o guardado
```

### 5. PDF
```
generateAnsulR102PDF → HTML → expo-print → PDF file
```

## ⚡ OPTIMIZACIONES IMPLEMENTADAS

### Carga Lazy de Imágenes
```javascript
// Las imágenes se cargan bajo demanda por página
const currentComponent = componentes[currentPhotoPage];
```

### Validación Asíncrona Eficiente
```javascript
// Una consulta por validación, logging detallado
const { data, error } = await supabase.from('tabla').select('campos').eq('condicion');
```

### Estado Local Optimizado
```javascript
// Estados separados para mejor rendimiento
const [imagesByComponenteAndSeccion, setImagesByComponenteAndSeccion] = useState({});
const [observacionesSecciones, setObservacionesSecciones] = useState({});
const [uploading, setUploading] = useState({});
```

---

**FECHA:** 16 de Octubre de 2025  
**VERSIÓN:** 1.0 - Guía Técnica Completa  
**ESTADO:** DOCUMENTACIÓN PRESERVADA ✅