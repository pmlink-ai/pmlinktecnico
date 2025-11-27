import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../lib/supabase';
import { DocumentStorageService } from './documentStorageService';
// import { DocumentStorageServiceTemp } from './documentStorageServiceTemp'; // Versión temporal

// ==================== SERVICIO DE GENERACIÓN DE PDF ====================
export class PDFService {
  
  // Mapeo de componentes a nombres de carpetas de storage
  static getStorageFolderName(componenteKey, informeTabla) {
    const mappings = {
      'informe_ansul_r102': {
        'Sistema_Supresion': 'OBSERVACIONES_FOTOGRAFICAS',
        'Cartuchos_Gas': 'RECAMBIO_FUSIBLES_TERMICOS',
        'Canerias_Distribucion': 'PRUEBA_RUPTURA_FUSIBLE',
        'Cilindro_Agente': 'SIMULACION_DISPARO_MANUAL',
        'Boquillas_Sistema': 'VALVULA_GAS',
        'Panel_Control': 'ALIMENTACION_ELECTRICA',
        'Pruebas_Sistema': 'PANEL_ALARMA',
        'Prueba_Neumatica': 'PRUEBA_NEUMATICA_CANERIAS',
        'Tipo_Cartucho': 'TIPO_CARTUCHO_EXPULSOR',
        'Recibo_Conforme': 'RECIBO_CONFORME'
      },
      'informe_limpieza_ductos': {
        'Observaciones_Fotograficas': 'OBSERVACIONES_FOTOGRAFICAS',
        'Campana_1': 'CAMPANA_1',
        'Campana_2': 'CAMPANA_2',
        'Campana_3': 'CAMPANA_3',
        'Extractor_Principal': 'EXTRACTOR_PRINCIPAL',
        'Ductos_Alimentacion': 'DUCTOS_ALIMENTACION',
        'Ductos_Salida': 'DUCTOS_SALIDA',
        'Recibo_Conforme': 'RECIBO_CONFORME'
      },
      'informe_electromecanico': {
        'Observaciones_Fotograficas': 'OBSERVACIONES_FOTOGRAFICAS',
        'Rejillas_Motor': 'REJILLAS_MOTOR',
        'Motores': 'MOTORES',
        'Fuelle': 'FUELLE',
        'Correas': 'CORREAS',
        'Rodamientos': 'RODAMIENTOS',
        'Consumo_Electrico': 'CONSUMO_ELECTRICO',
        'Recibo_Conforme': 'RECIBO_CONFORME'
      }
    };
    
    return mappings[informeTabla]?.[componenteKey] || componenteKey;
  }

  // Generar URL pública de imagen desde Supabase Storage
  static getImageUrl(storagePath) {
    if (!storagePath) return '';
    const { data } = supabase.storage
      .from('fotos_informes')
      .getPublicUrl(storagePath);
    return data?.publicUrl || '';
  }

  // Obtener datos completos para el PDF
  static async getCompleteOrderData(orderId, tableName) {
    try {
      console.log('📋 Obteniendo datos completos para PDF...');
      console.log('📋 DEBUG: orderId:', orderId, 'tableName:', tableName);
      
      // 1. Obtener datos de la orden de trabajo
      const { data: orderData, error: orderError } = await supabase
        .from('orden_trabajo')
        .select(`
          *,
          estados_orden_trabajo(nombre),
          prioridades(nombre)
        `)
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('Error obteniendo orden:', orderError);
        throw new Error('No se pudo obtener la información de la orden');
      }

      // 2. Obtener datos del formulario específico (FORZAR DATOS FRESCOS)
      console.log(`🔄 Consultando tabla ${tableName} para orden ${orderId}...`);
      const { data: formData, error: formError } = await supabase
        .from(tableName)
        .select('*')
        .eq('orden_trabajo_id', orderId)
        .order('created_at', { ascending: false }) // Usar created_at, el más reciente primero
        .single(); // Obtener solo un registro

      if (formError) {
        console.error('Error obteniendo formulario:', formError);
        console.log('⚠️ Continuando sin datos del formulario...');
      } else {
        console.log('✅ Datos del formulario obtenidos:', {
          campos: Object.keys(formData || {}).length,
          fecha_creacion: formData?.created_at,
          muestra_campos: {
            asist_personal: formData?.asist_personal,
            horas_trabajo: formData?.horas_trabajo,
            cliente: formData?.cliente,
            campanas_estado: formData?.campanas_estado // AGREGAR ESTE CAMPO ESPECÍFICO
          }
        });
        console.log('🔍 DEBUG: Valor específico de campanas_estado desde BD:', formData?.campanas_estado);
      }

      // 3. Obtener información del servicio y local (consulta simplificada)
      const { data: serviceData, error: serviceError } = await supabase
        .from('servicios')
        .select(`
          *,
          local(
            nombre_local,
            direccion,
            zona_id
          )
        `)
        .eq('servicio_id', orderData.servicio_id)
        .single();

      if (serviceError) {
        console.error('Error obteniendo servicio:', serviceError);
      }

      // Obtener información de la empresa y zona por separado
      let empresaInfo = null;
      let zonaInfo = null;
      if (serviceData?.local?.zona_id) {
        const { data: zonaData, error: zonaError } = await supabase
          .from('zona')
          .select('empresa_id, nombre_zona')
          .eq('zona_id', serviceData.local.zona_id)
          .single();

        if (zonaData && !zonaError) {
          // Guardar información de la zona
          zonaInfo = { nombre_zona: zonaData.nombre_zona };
          
          // Obtener información de la empresa
          if (zonaData.empresa_id) {
            const { data: empresa, error: empresaError } = await supabase
              .from('empresa')
              .select('nombre_empresa')
              .eq('empresa_id', zonaData.empresa_id)
              .single();

            if (!empresaError) {
              empresaInfo = empresa;
            }
          }
        }
      }

      // Agregar la información de empresa y zona al serviceData para mantener compatibilidad
      if (serviceData?.local) {
        if (empresaInfo || zonaInfo) {
          serviceData.local.zona = { 
            empresa: empresaInfo,
            ...zonaInfo
          };
        }
      }

      // 4. Obtener fotografías organizadas por componente (DATOS FRESCOS)
      console.log('📸 Consultando fotografías actualizadas para PDF...');
      console.log('📸 DEBUG: Parámetros consulta fotos:', { orderId, tableName });
      
      const { data: photos, error: photosError } = await supabase
        .from('informe_fotografias')
        .select('*')
        .eq('orden_trabajo_id', orderId)
        .eq('informe_tabla', tableName)
        .order('componente', { ascending: true })
        .order('seccion', { ascending: true })
        .order('uploaded_at', { ascending: false }); // Más recientes primero

      console.log('📸 Fotografías obtenidas:', {
        total: photos?.length || 0,
        error: photosError?.message
      });
      
      if (photos && photos.length > 0) {
        console.log('📸 Detalles de fotografías:', photos.slice(0, 3).map(p => ({
          id: p.id,
          componente: p.componente,
          seccion: p.seccion,
          etiqueta: p.etiqueta,
          uploaded_at: p.uploaded_at,
          storage_path: p.storage_path
        })));
        
        // Verificar específicamente fotos de Campana_1 ANTES
        const campana1Antes = photos.filter(p => p.componente === 'Campana_1' && p.seccion === 'ANTES');
        console.log('📸 DEBUG: Fotos Campana_1 ANTES en BD:', campana1Antes.length);
      } else {
        console.log('⚠️ No se encontraron fotografías para esta orden');
      }

      if (photosError) {
        console.error('❌ Error obteniendo fotografías:', photosError);
      }

      // 5. Obtener observaciones por sección
      console.log('📝 DEBUG: Consultando observaciones para orden:', orderId, 'tabla:', tableName);
      
      const { data: observaciones, error: observacionesError } = await supabase
        .from('observaciones_fotografias')
        .select('*')
        .eq('orden_trabajo_id', orderId)
        .eq('informe_tabla', tableName);

      let observacionesOrganizadas = {};
      if (observaciones && !observacionesError) {
        observaciones.forEach(obs => {
          const key = `${obs.componente}_${obs.seccion}`;
          observacionesOrganizadas[key] = obs.observaciones;
        });
        console.log('📝 DEBUG: Observaciones organizadas:', Object.keys(observacionesOrganizadas));
      } else {
        console.error('❌ Error obteniendo observaciones:', observacionesError);
      }

      // 6. Obtener técnicos asignados
      console.log('👥 DEBUG: Consultando técnicos asignados para orden:', orderId);
      
      const { data: asignaciones, error: asignacionesError } = await supabase
        .from('asignaciones_ot')
        .select('tecnico_id')
        .eq('orden_id', orderId);

      let tecnicos = [];
      if (asignaciones && asignaciones.length > 0 && !asignacionesError) {
        const tecnicoIds = asignaciones.map(asig => asig.tecnico_id);
        console.log('👥 DEBUG: IDs de técnicos encontrados:', tecnicoIds);
        
        const { data: usuariosTecnicos, error: usuariosError } = await supabase
          .from('usuario')
          .select('usuario_id, nombre, apellido')
          .in('usuario_id', tecnicoIds);

        if (usuariosTecnicos && !usuariosError) {
          tecnicos = usuariosTecnicos;
          console.log('👥 DEBUG: Técnicos obtenidos para PDF:', tecnicos);
        } else {
          console.error('❌ Error obteniendo datos de técnicos:', usuariosError);
        }
      } else {
        console.log('ℹ️ No se encontraron técnicos asignados o error:', asignacionesError);
      }

      // Organizar fotografías por componente y sección
      const organizedPhotos = this.organizePhotosByComponent(photos || []);

      return {
        order: orderData,
        formData: formData || {},
        service: serviceData || {},
        photos: organizedPhotos,
        observaciones: observacionesOrganizadas,
        tecnicos: tecnicos,
        tableName: tableName,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error obteniendo datos completos:', error);
      throw error;
    }
  }

  // Organizar fotografías por componente y sección
  static organizePhotosByComponent(photos) {
    const organized = {};
    
    console.log('🔍 DEBUG: Organizando fotografías total:', photos.length);
    console.log('🔍 DEBUG: Fotografías recibidas:', photos.map(p => ({ 
      componente: p.componente, 
      seccion: p.seccion, 
      etiqueta: p.etiqueta 
    })));
    
    photos.forEach(photo => {
      const componente = photo.componente || 'General';
      const seccion = photo.seccion || 'ANTES';
      
      // Debug específico para Campana_1
      if (componente === 'Campana_1') {
        console.log('🔍 DEBUG Campana_1: Procesando foto', {
          componente,
          seccion,
          etiqueta: photo.etiqueta,
          storage_path: photo.storage_path
        });
      }
      
      if (!organized[componente]) {
        organized[componente] = {
          ANTES: [],
          PROCESO: [],
          DESPUES: []
        };
      }
      
      if (!organized[componente][seccion]) {
        organized[componente][seccion] = [];
      }
      
      organized[componente][seccion].push({
        ...photo,
        imageUrl: this.getImageUrl(photo.storage_path)
      });
    });
    
    // Debug del resultado final
    console.log('🔍 DEBUG: Fotografías organizadas:', Object.keys(organized));
    if (organized.Campana_1) {
      console.log('🔍 DEBUG Campana_1 final:', {
        ANTES: organized.Campana_1.ANTES.length,
        PROCESO: organized.Campana_1.PROCESO.length,
        DESPUES: organized.Campana_1.DESPUES.length
      });
      console.log('🔍 DEBUG Campana_1 ANTES fotos:', organized.Campana_1.ANTES.map(p => ({
        etiqueta: p.etiqueta,
        imageUrl: p.imageUrl
      })));
    }
    
    return organized;
  }

  // Generar HTML del PDF
  static generatePDFHTML(data, forceTimestamp = null) {
    const { order, formData, service, photos, observaciones, tecnicos, tableName } = data;
    
    // ID único para forzar regeneración
    const uniqueId = forceTimestamp || new Date().toISOString();
    console.log('🆔 Generando PDF con ID único:', uniqueId.substring(0, 19));
    
    // Determinar el título basado en el tipo de informe
    const getInformeTitle = (tableName) => {
      switch (tableName) {
        case 'informe_ansul_r102':
          return 'INFORME DE MANTEIMIENTO SEMESTRAL ANSUL R-102';
        case 'informe_limpieza_ductos':
          return 'INFORME LIMPIEZA DE DUCTOS';
        case 'informe_electromecanico':
          return 'INFORME MANTENIMIENTO ELECTROMECÁNICO';
        default:
          return 'INFORME TÉCNICO';
      }
    };
    
    const informeTitle = getInformeTitle(tableName);

    // Generar contenido específico según el tipo de informe
    if (tableName === 'informe_ansul_r102') {
      return this.generateAnsulR102PDF(order, formData, service, photos, observaciones, tecnicos, informeTitle);
    } else if (tableName === 'informe_electromecanico') {
      return this.generateMttoElectromecanicosPDF(order, formData, service, photos, tecnicos, informeTitle);
    } else {
      return this.generateLimpiezaDuctosPDF(order, formData, service, photos, tecnicos, informeTitle, uniqueId);
    }
  }

  // Generar PDF específico para Limpieza de Ductos
  static generateLimpiezaDuctosPDF(order, formData, service, photos, tecnicos, informeTitle, uniqueId = null) {
    console.log('📄 DEBUG: Generando PDF de Limpieza de Ductos...');
    console.log('📄 DEBUG: formData completo:', JSON.stringify(formData, null, 2));
    console.log('📄 DEBUG: Valor específico campanas_estado:', formData?.campanas_estado);
    console.log('🆔 PDF con ID único:', uniqueId?.substring(0, 19));
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Informe de Limpieza de Ductos</title>
          <!-- Versión CSS FORZADA: ${uniqueId || new Date().toISOString()} -->
          <!-- ESTILOS ACTUALIZADOS 30/70 -->
          <style>
            ${this.getPDFStyles()}
          </style>
        </head>
        <body>
          ${this.generateHeaderSection(order, service, informeTitle)}
          ${this.generateTecnicosSection(tecnicos)}
          ${this.generateServiceDataSection(order, service, formData)}
          ${this.generateDiagnosticTable(formData)}
          ${this.generatePhotosSection(photos)}
        </body>
      </html>
    `;
  }

  // Generar PDF específico para Mantenimiento Electromecánico
  static generateMttoElectromecanicosPDF(order, formData, service, photos, tecnicos, informeTitle) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Informe de Mantenimiento Electromecánico</title>
          <style>
            ${this.getPDFStyles()}
          </style>
        </head>
        <body>
          ${this.generateHeaderSection(order, service, informeTitle)}
          ${this.generateTecnicosSection(tecnicos)}
          ${this.generateServiceDataSection(order, service, formData)}
          ${this.generateElectromecanicosDiagnosticTable(formData)}
          ${this.generatePhotosSection(photos)}
        </body>
      </html>
    `;
  }

  // Generar PDF específico para ANSUL R-102
  static generateAnsulR102PDF(order, formData, service, photos, observaciones, tecnicos, informeTitle) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Informe ANSUL R-102</title>
          <style>
            ${this.getPDFStyles()}
          </style>
        </head>
        <body>
          ${this.generateHeaderSection(order, service, informeTitle)}
          ${this.generateTecnicosSection(tecnicos)}
          ${this.generateServiceDataSection(order, service, formData)}
          ${this.generateAnsulDiagnosticTable(formData)}
          ${this.generateAnsulPhotosSection(photos, observaciones)}
        </body>
      </html>
    `;
  }

  // Estilos CSS para el PDF
  static getPDFStyles() {
    const timestamp = new Date().toISOString();
    const uniqueId = Math.random().toString(36).substr(2, 9);
    return `
      @page {
        margin: 20px;
        size: A4;
      }
      
      body {
        font-family: Arial, sans-serif;
        font-size: 10px;
        line-height: 1.3;
        color: #333;
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 2px solid #333;
      }
      
      .logo-section {
        flex: 1;
        display: flex;
        align-items: center;
      }
      
      .header-logo {
        max-width: 150px;
        max-height: 80px;
        width: auto;
        height: auto;
        object-fit: contain;
      }
      
      .title-section {
        flex: 2;
        text-align: center;
      }
      
      .reference-section {
        flex: 1;
        text-align: right;
      }
      
      .company-logo {
        width: 80px;
        height: auto;
      }
      
      .main-title {
        font-size: 16px;
        font-weight: bold;
        margin: 0;
      }
      
      .subtitle {
        font-size: 12px;
        color: #666;
        margin: 5px 0;
      }
      
      .reference-number {
        font-size: 12px;
        font-weight: bold;
      }
      
      .section {
        margin: 15px 0;
      }
      
      .section-title {
        background-color: #2196F3;
        color: white;
        padding: 8px;
        font-weight: bold;
        font-size: 11px;
        margin: 0 0 10px 0;
      }
      
      .data-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
      }
      
      .data-table td {
        padding: 6px;
        border: 1px solid #ddd;
        font-size: 9px;
      }
      
      .data-table .label {
        background-color: #f5f5f5;
        font-weight: bold;
        width: 30%;
      }
      
      /* TABLA DIAGNÓSTICO - VERSIÓN PROFESIONAL 30/70 - ${timestamp} - ID:${uniqueId} */
      .diagnostic-table-v3070-final {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        table-layout: fixed; /* Forzar ancho fijo de columnas */
      }
      
      .diagnostic-table-v3070-final th,
      .diagnostic-table-v3070-final td {
        padding: 6px;
        border: 1px solid #ddd;
        text-align: left;
        font-size: 9px;
        vertical-align: top; /* Alinear contenido arriba */
      }
      
      /* PRIMERA COLUMNA: 30% - COMPONENTES FIJOS */
      .diagnostic-table-v3070-final td:first-child {
        width: 30% !important; /* FORZAR 30% con !important */
        min-width: 30% !important;
        max-width: 30% !important;
        white-space: nowrap; /* No permitir salto de línea */
        font-weight: bold;
        background-color: #f5f5f5; /* Mismo color que data-table .label */
        overflow: hidden;
        text-overflow: ellipsis; /* Agregar ... si es muy largo */
      }
      
      /* SEGUNDA COLUMNA: 70% - VALORES VARIABLES */
      .diagnostic-table-v3070-final td:last-child {
        width: 70% !important; /* FORZAR 70% con !important */
        min-width: 70% !important;
        max-width: 70% !important;
        white-space: pre-wrap; /* Permitir salto de línea y espacios */
        word-wrap: break-word; /* Partir palabras largas */
        line-height: 1.4;
        background-color: #ffffff;
        overflow-wrap: break-word; /* Alternativa moderna */
      }
      
      .diagnostic-table-v3070-final th {
        background-color: #f5f5f5; /* Mismo color que data-table .label */
        font-weight: bold;
        white-space: nowrap;
        font-size: 10px;
        text-align: center;
      }
      
      .component-section {
        margin: 20px 0;
        page-break-inside: avoid;
      }
      
      .component-title {
        background-color: #2196F3;
        color: white;
        padding: 8px;
        font-weight: bold;
        font-size: 11px;
        margin: 15px 0 10px 0;
        text-transform: uppercase;
        page-break-inside: avoid;
      }
      
      .photo-section {
        margin: 10px 0;
      }
      
      .photo-section-title {
        font-weight: bold;
        font-size: 10px;
        margin-bottom: 5px;
        color: #333;
      }
      
      .electric-switch-estado {
        font-weight: bold;
        font-size: 10px;
        margin: 5px 0;
        color: #333;
        text-align: left;
      }
      
      .estado-value {
        font-size: 10px;
        margin: 5px 0;
        color: #666;
        text-align: left;
        padding-left: 10px;
      }
      
      .ansul-logo-placeholder {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        min-height: 120px;
        background-color: #f9f9f9;
        border: 1px dashed #ccc;
        padding-right: 20px;
        flex: 1;
        max-width: 100%;
        width: 100%;
      }
      
      .ansul-logo {
        max-width: 200px;
        max-height: 80px;
        width: auto;
        height: auto;
        object-fit: contain;
      }
      
      .photos-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-bottom: 15px;
      }
      
      .photo-item {
        flex: 0 0 30%;
        max-width: 30%;
      }
      
      .photo-img {
        width: 100%;
        height: auto;
        max-height: 120px;
        object-fit: cover;
        border: 1px solid #ddd;
      }
      
      .no-photos-message {
        text-align: center;
        color: #999;
        font-style: italic;
        padding: 20px;
        font-size: 10px;
        background-color: #f9f9f9;
        border: 1px dashed #ccc;
        margin: 5px 0;
      }
      
      .observations {
        background-color: #f9f9f9;
        padding: 10px;
        border-left: 4px solid #2196F3;
        margin: 15px 0;
      }
      
      .observations-title {
        font-weight: bold;
        margin-bottom: 5px;
      }
      
      .section-observations {
        background-color: #f0f8ff;
        padding: 8px;
        margin: 8px 0;
        border-left: 3px solid #2196F3;
        border-radius: 3px;
      }
      
      .section-observations-title {
        font-weight: bold;
        font-size: 9px;
        color: #2196F3;
        margin-bottom: 4px;
      }
      
      .section-observations-text {
        font-size: 9px;
        line-height: 1.3;
        color: #333;
        white-space: pre-line;
      }
      
      .page-break {
        page-break-before: always;
      }
    `;
  }

  // Generar sección del encabezado
  static generateHeaderSection(order, service, informeTitle = 'INFORME LIMPIEZA DE DUCTOS') {
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return `
      <div class="header">
        <div class="logo-section">
          <img src="https://mwtdoidrjuahsejfctlm.supabase.co/storage/v1/object/public/fotos_informes/logos/pmduc-logo.png" class="header-logo" alt="PMDUC Expertos en Ductos" />
        </div>
        <div class="title-section">
          <h1 class="main-title">${informeTitle}</h1>
        </div>
        <div class="reference-section">
          <div class="reference-number">${order.id?.substring(0, 12) || 'N/A'}</div>
        </div>
      </div>
      
      <table class="data-table">
        <tr>
          <td class="label">N° DE ORDEN:</td>
          <td>${order.numero || order.id?.substring(0, 12) || 'N/A'}</td>
          <td class="label">NOMBRE INFORME:</td>
          <td>${informeTitle}</td>
        </tr>
        <tr>
          <td class="label">ENCARGADO:</td>
          <td>${order.tecnico_asignado || 'No asignado'}</td>
          <td class="label">FECHA:</td>
          <td>${formatDate(order.created_at)}</td>
        </tr>
        <tr>
          <td class="label">LOCALIZACIÓN:</td>
          <td colspan="3">${service.local?.direccion || 'Dirección no disponible'}</td>
        </tr>
      </table>
    `;
  }

  // Generar sección de técnicos asignados
  static generateTecnicosSection(tecnicos) {
    if (!tecnicos || tecnicos.length === 0) {
      return `
        <div class="section">
          <div class="section-title">TÉCNICOS ASIGNADOS</div>
          <table class="data-table">
            <tr>
              <td class="label">TÉCNICOS</td>
              <td>No hay técnicos asignados</td>
            </tr>
          </table>
        </div>
      `;
    }

    const tecnicosRows = tecnicos.map((tecnico, index) => `
      <tr>
        <td class="label">TÉCNICO ${index + 1}</td>
        <td>${tecnico.nombre} ${tecnico.apellido}</td>
      </tr>
    `).join('');

    return `
      <div class="section">
        <div class="section-title">TÉCNICOS ASIGNADOS</div>
        <table class="data-table">
          ${tecnicosRows}
        </table>
      </div>
    `;
  }

  // Generar sección de datos del servicio
  static generateServiceDataSection(order, service, formData) {
    return `
      <div class="section">
        <div class="section-title">Datos del Servicio</div>
        <table class="data-table">
          <tr>
            <td class="label">CLIENTE</td>
            <td>${service.local?.zona?.empresa?.nombre_empresa || 'No disponible'}</td>
          </tr>
          <tr>
            <td class="label">ZONA</td>
            <td>${service.local?.zona?.nombre_zona || 'No disponible'}</td>
          </tr>
          <tr>
            <td class="label">FECHA- INICIO</td>
            <td>${new Date(order.created_at).toLocaleDateString('es-CL')}</td>
          </tr>
          <tr>
            <td class="label">NOMBRE DE LOCAL</td>
            <td>${service.local?.nombre_local || 'No disponible'}</td>
          </tr>
          <tr>
            <td class="label">ASISTENCIA DE PERSONAL</td>
            <td>${formData.asist_personal || 'No especificado'}</td>
          </tr>
          <tr>
            <td class="label">HORAS DE TRABAJO</td>
            <td>${formData.horas_trabajo ? formData.horas_trabajo + ' HRS' : 'No especificado'}</td>
          </tr>
        </table>
      </div>
    `;
  }

  // Generar tabla de diagnóstico
  static generateDiagnosticTable(formData) {
    console.log('📊 DEBUG: Generando tabla de diagnóstico...');
    console.log('📊 DEBUG: formData recibido:', formData);
    
    const diagnosticItems = [
      { label: 'Campanas', field: 'campanas_estado' },
      { label: 'FILTROS', field: 'filtros_estado' },
      { label: 'DUCTOS', field: 'ductos_estado' },
      { label: 'DUMPER', field: 'damper_estado' },
      { label: 'DRENAJES', field: 'drenajes_estado' },
      { label: 'Registros dentro del Local', field: 'registros_local_estado' },
      { label: 'Registros Techumbre', field: 'registros_techumbre_estado' },
      { label: 'Rejillas en el Motor', field: 'rejillas_en_el_motor' },
      { label: 'Cantidad de Motores', field: 'cantidad_de_motores' },
      { label: 'Fuelle', field: 'fuelle' },
      { label: 'Correas', field: 'correas' },
      { label: 'Rodamientos', field: 'rodamientos' }
    ];

    let tableRows = diagnosticItems.map(item => {
      const value = formData[item.field] || 'NO ESPECIFICADO';
      console.log(`📊 DEBUG: ${item.label} (${item.field}): "${value}"`);
      
      return `
        <tr>
          <td>${item.label}</td>
          <td>${value}</td>
        </tr>
      `;
    }).join('');

    console.log('📊 DEBUG: Tabla de diagnóstico generada');

    return `
      <div class="section">
        <div class="section-title">Tabla de Diagnóstico</div>
        <table class="diagnostic-table-v3070-final">
          <thead>
            <tr>
              <th style="width: 30%;">COMPONENTE</th>
              <th style="width: 70%;">ESTADO / OBSERVACIONES</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        ${formData.observaciones ? `
          <div class="observations">
            <div class="observations-title">Observaciones</div>
            <div>${formData.observaciones}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Generar tabla de diagnóstico específica para Mantenimiento Electromecánico - ACTUALIZADO
  static generateElectromecanicosDiagnosticTable(formData) {
    console.log('🔧 Generando tabla electromecánica ACTUALIZADA');
    const electromecanicosItems = [
      // Componentes principales según la estructura real de la tabla
      { label: 'Rejillas en el Motor', field: 'rejillas_motor_estado' },
      { label: 'Cantidad de Motores', field: 'cantidad_motores' },
      { label: 'Fuelle', field: 'fuelle_estado' },
      { label: 'Correas', field: 'correas_modelo' },
      { label: 'Rodamientos', field: 'rodamientos_estado' },
      
      // Información del servicio
      { label: 'Horas de Trabajo', field: 'horas_trabajo' },
    ];

    return `
      <div class="diagnostic-section">
        <div class="section-title">TABLA DE DIAGNÓSTICO - MANTENIMIENTO ELECTROMECÁNICO</div>
        <table class="diagnostic-table-v3070-final">
          <thead>
            <tr>
              <th style="width: 30%;">COMPONENTE/PARÁMETRO</th>
              <th style="width: 70%;">ESTADO/MEDICIÓN</th>
            </tr>
          </thead>
          <tbody>
            ${electromecanicosItems.map(item => {
              const value = formData[item.field] || '';
              return `
                <tr>
                  <td class="component-name">${item.label}</td>
                  <td class="component-status">${value}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        ${formData.observaciones_generales ? `
          <div class="observations">
            <div class="observations-title">Observaciones</div>
            <div>${formData.observaciones_generales}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Generar tabla de diagnóstico específica para ANSUL R-102
  static generateAnsulDiagnosticTable(formData) {
    const ansulComponents = [
      { label: 'INSPECCIÓN VISUAL DEL CORRECTO MONTAJE DEL SISTEMA', field: 'inspeccion_visual_montaje' },
      { label: 'ESTADO DE CARTUCHOS DE GAS EXPULSOR', field: 'estado_cartuchos_gas' },
      { label: 'ESTADO DE CAÑERÍAS DE DISTRIBUCIÓN DE AGENTE ANSULEX', field: 'estado_canerias_distribucion' },
      { label: 'ESTADO DE MONTAJE DE CONDUCTOS / SIN FILTRACIONES NI OBSTRUCCIONES', field: 'estado_montaje_conductos' },
      { label: 'REALIZAR PRUEBA DE FUGA EN CAÑERIA DE DISTRIBUCION DE AGENTE', field: 'prueba_fuga_caneria' },
      { label: 'REALIZAR PRUEBA DE SOPLADO EN CAÑERIAS', field: 'prueba_soplado_canerias' },
      { label: 'REVISION DEL ESTADO Y CANTIDAD DEL AGENTE', field: 'revision_agente' },
      { label: 'ESTADO DEL DISCO DE RUPTURA', field: 'estado_disco_ruptura' },
      { label: 'CANTIDAD Y ESTADO DE BOQUILLAS', field: 'cantidad_estado_boquillas' },
      { label: 'TIPOS DE TAPONES DE BOQUILLAS / METALICAS O GOMA', field: 'tipo_tapones_boquillas' },
      { label: 'ESTADO DE PIOLA DE ACERO INOX DE LA LINEA DE DETECCIÓN', field: 'estado_piola_acero' },
      { label: 'CORROBORAR QUE AUTOMAN DE GAS SE ACTIVO LUEGO DE LA PRUEBA DE DETONACION', field: 'verificacion_automan_gas' },
      { label: 'SEÑAL DE ALARMA SE ACTIVO AL DETONAR', field: 'verificacion_senal_alarma' }
    ];

    let tableRows = ansulComponents.map(item => {
      const value = formData[item.field] || 'NO ESPECIFICADO';
      return `
        <tr>
          <td>${item.label}</td>
          <td>${value}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="section">
        <div class="section-title">Tabla de Diagnóstico ANSUL R-102</div>
        <table class="diagnostic-table-v3070-final">
          ${tableRows}
        </table>
        
        ${formData.observaciones_generales ? `
          <div class="observations">
            <div class="observations-title">Observaciones Generales</div>
            <div>${formData.observaciones_generales}</div>
          </div>
        ` : ''}
        
        ${formData.observaciones && !formData.observaciones_generales ? `
          <div class="observations">
            <div class="observations-title">Observaciones</div>
            <div>${formData.observaciones}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Generar sección de fotografías
  static generatePhotosSection(photos) {
    let photosHTML = '';
    
    // Configuración de componentes en el orden específico requerido
    const orderedComponents = [
      { 
        key: 'Campana_1', 
        title: 'Campana 1',
        sections: ['ANTES', 'PROCESO', 'DESPUES'] // Todas las secciones para Campana 1
      },
      { 
        key: 'Campana_2', 
        title: 'Campana 2',
        sections: ['ANTES', 'PROCESO', 'DESPUES'] // Todas las secciones para Campana 2
      },
      { 
        key: 'Ductos_y_Registros', 
        title: 'Ductos y Registros',
        sections: ['ANTES', 'PROCESO', 'DESPUES']
      },
      { 
        key: 'Motores_y_Cubierta', 
        title: 'Motores y Cubierta',
        sections: ['ANTES', 'PROCESO', 'DESPUES']
      },
      { 
        key: 'Panoramica_y_Sector', 
        title: 'Panorámica y/o Sector',
        sections: ['ANTES'] // Solo sección ANTES para Panorámica y/o Sector
      },
      { 
        key: 'Recibo_Conforme', 
        title: 'Recibo Conforme',
        sections: ['RECIBO_CONFORME'] // Sección especial para Recibo Conforme
      }
    ];

    // Iterar por cada componente en el orden definido
    orderedComponents.forEach(component => {
      const { key: componentKey, title: componentTitle, sections: componentSections } = component;
      
      // Debug específico para Campana_1
      if (componentKey === 'Campana_1') {
        console.log('🔍 DEBUG PDF Campana_1: Generando sección');
        console.log('🔍 DEBUG PDF Campana_1: Fotos disponibles:', photos[componentKey]);
        console.log('🔍 DEBUG PDF Campana_1: Secciones a procesar:', componentSections);
      }
      
      // Siempre mostrar el componente, incluso si no tiene fotografías
      photosHTML += `
        <div class="component-section">
          <div class="section-title" style="background-color: #2196F3; color: white; padding: 8px; font-weight: bold; font-size: 11px; margin: 15px 0 10px 0; text-transform: uppercase;">${componentTitle}</div>
      `;

      // Log para verificar que se está aplicando el nuevo formato
      console.log(`🎨 DEBUG: Aplicando formato section-title para ${componentTitle}`);

      // Para Recibo Conforme, tratamiento especial
      if (componentKey === 'Recibo_Conforme') {
        const reciboPhotos = photos[componentKey]?.ANTES || [];
        
        photosHTML += `
          <div class="photo-section">
            <div class="photo-section-title">RECIBO CONFORME</div>
        `;
        
        if (reciboPhotos.length > 0) {
          photosHTML += `
            <div class="photos-grid">
              ${reciboPhotos.map(photo => `
                <div class="photo-item">
                  <img src="${photo.imageUrl}" class="photo-img" alt="Recibo Conforme" />
                </div>
              `).join('')}
            </div>
          `;
        } else {
          photosHTML += `
            <div class="no-photos-message">No hay fotografías disponibles</div>
          `;
        }
        
        photosHTML += '</div>';
      } else {
        // Para otros componentes, mostrar las secciones definidas
        componentSections.forEach(sectionKey => {
          const sectionPhotos = photos[componentKey]?.[sectionKey] || [];
          
          // Debug específico para Campana_1 ANTES
          if (componentKey === 'Campana_1' && sectionKey === 'ANTES') {
            console.log('🔍 DEBUG PDF Campana_1 ANTES: Fotos encontradas:', sectionPhotos.length);
            console.log('🔍 DEBUG PDF Campana_1 ANTES: Detalles:', sectionPhotos.map(p => ({
              etiqueta: p.etiqueta,
              imageUrl: p.imageUrl
            })));
          }
          
          photosHTML += `
            <div class="photo-section">
              <div class="photo-section-title">${sectionKey}</div>
          `;
          
          if (sectionPhotos.length > 0) {
            photosHTML += `
              <div class="photos-grid">
                ${sectionPhotos.map(photo => `
                  <div class="photo-item">
                    <img src="${photo.imageUrl}" class="photo-img" alt="${sectionKey}" />
                  </div>
                `).join('')}
              </div>
            `;
          } else {
            photosHTML += `
              <div class="no-photos-message">No hay fotografías disponibles</div>
            `;
          }
          
          photosHTML += '</div>';
        });
      }

      photosHTML += '</div>';
    });

    return photosHTML;
  }

  // Generar sección de fotografías específica para ANSUL R-102
  static generateAnsulPhotosSection(photos, observaciones = {}) {
    let photosHTML = '';
    
    // Configuración de componentes específicos para ANSUL R-102 en orden correcto
    const ansulComponents = [
      { 
        key: 'Sistema_Supresion', 
        title: 'OBSERVACIONES FOTOGRÁFICAS',
        sections: ['ANTES'] // Solo sección ANTES para las observaciones fotográficas
      },
      { 
        key: 'Cartuchos_Gas', 
        title: 'RECAMBIO DE FUSIBLES TÉRMICOS',
        sections: ['ANTES', 'DESPUES'] // Solo ANTES y DESPUES, no PROCESO
      },
      { 
        key: 'Canerias_Distribucion', 
        title: 'PRUEBA DE RUPTURA DE FUSIBLE DE PRUEBA',
        sections: ['ANTES', 'DESPUES'] // Solo ANTES y DESPUES, no PROCESO
      },
      { 
        key: 'Cilindro_Agente', 
        title: 'SIMULACIÓN DE DISPARO MANUAL',
        sections: ['ANTES', 'DESPUES'] // Solo ANTES y DESPUES, no PROCESO
      },
      { 
        key: 'Boquillas_Sistema', 
        title: 'VÁLVULA DE GAS',
        sections: ['FOTO'] // Sección especial FOTO para Boquillas_Sistema
      },
      { 
        key: 'Alimentacion_Electrica', 
        title: 'ALIMENTACIÓN ELÉCTRICA / SI APLICARA',
        sections: ['ESTADO'] // Sección especial para mostrar solo estado
      },
      { 
        key: 'Panel_Alarma', 
        title: 'PANEL DE ALARMA / SI APLICARA',
        sections: ['SWITCH_INSTALADO'] // Sección especial para panel con foto y observaciones
      },
      { 
        key: 'Prueba_Neumatica', 
        title: 'PRUEBA NEUMÁTICA A CAÑERÍAS DE DISTRIBUCIÓN',
        sections: ['PROCESO'] // Solo PROCESO (que se muestra como RESPALDO)
      },
      { 
        key: 'Tipo_Cartucho', 
        title: 'TIPO DE CARTUCHO EXPULSOR, CANTIDAD Y SU PESO',
        sections: ['PROCESO'] // Solo PROCESO (que se muestra como RESPALDO)
      },
      { 
        key: 'Recibo_Conforme', 
        title: 'RECIBO CONFORME',
        sections: ['ANTES'] // Solo sección ANTES para Recibo Conforme
      }
    ];

    // Iterar por cada componente ANSUL
    ansulComponents.forEach(component => {
      const { key: componentKey, title: componentTitle, sections: componentSections } = component;
      
      console.log(`🔍 DEBUG ANSUL PDF: Generando sección ${componentTitle}`);
      
      // Siempre mostrar el componente, incluso si no tiene fotografías
      photosHTML += `
        <div class="component-section">
          <div class="section-title" style="background-color: #2196F3; color: white; padding: 8px; font-weight: bold; font-size: 11px; margin: 15px 0 10px 0; text-transform: uppercase;">${componentTitle}</div>
      `;

      // Mostrar las secciones definidas para cada componente
      componentSections.forEach(sectionKey => {
        const sectionPhotos = photos[componentKey]?.[sectionKey] || [];
        
        // Para Prueba_Neumatica y Tipo_Cartucho, cambiar PROCESO por RESPALDO en la visualización
        let displaySectionName = sectionKey;
        if ((componentKey === 'Prueba_Neumatica' || componentKey === 'Tipo_Cartucho') && sectionKey === 'PROCESO') {
          displaySectionName = 'RESPALDO';
        }
        
        // Manejo especial para cada componente según las imágenes
        if (componentKey === 'Alimentacion_Electrica' && sectionKey === 'ESTADO') {
          displaySectionName = 'SWITCH DE CORTE PARA SUMINISTRO ELÉCTRICO';
        }
        
        if (componentKey === 'Panel_Alarma' && sectionKey === 'SWITCH_INSTALADO') {
          displaySectionName = 'SWITCH INSTALADO';
        }
        
        console.log(`🔍 DEBUG ANSUL PDF ${componentKey}: Sección ${sectionKey} -> ${displaySectionName}, fotos: ${sectionPhotos.length}`);
        
        // Manejo especial para Recibo_Conforme
        if (componentKey === 'Recibo_Conforme' && sectionKey === 'ANTES') {
          displaySectionName = 'RECIBO CONFORME';
        }
        
        // Manejo especial para Alimentacion_Electrica - solo mostrar estado
        if (componentKey === 'Alimentacion_Electrica' && sectionKey === 'ESTADO') {
          photosHTML += `
            <div class="photo-section">
              <div class="photo-section-title">${displaySectionName}</div>
              <div class="electric-switch-estado">ESTADO</div>
              <div class="estado-value">No aplica</div>
            </div>
          `;
          return; // No procesar fotos para este componente
        }
        
        // Manejo especial para Panel_Alarma - buscar fotos en diferentes secciones posibles
        if (componentKey === 'Panel_Alarma' && sectionKey === 'SWITCH_INSTALADO') {
          // Buscar fotos en secciones comunes: FOTO, ANTES, DESPUES
          const fotosSections = ['FOTO', 'ANTES', 'DESPUES'];
          let fotosEncontradas = [];
          
          fotosSections.forEach(seccion => {
            const fotosSeccion = photos[componentKey]?.[seccion] || [];
            fotosEncontradas = [...fotosEncontradas, ...fotosSeccion];
          });
          
          photosHTML += `
            <div class="photo-section">
              <div class="photo-section-title">${displaySectionName}</div>
          `;
          
          if (fotosEncontradas.length > 0) {
            photosHTML += `
              <div class="photos-grid">
                ${fotosEncontradas.map(photo => `
                  <div class="photo-item">
                    <img src="${photo.imageUrl}" class="photo-img" alt="${displaySectionName}" />
                  </div>
                `).join('')}
              </div>
            `;
          } else {
            // Mostrar logo ANSUL alineado a la derecha
            photosHTML += `
              <div class="photos-grid">
                <div class="photo-item ansul-logo-placeholder">
                  <img src="https://mwtdoidrjuahsejfctlm.supabase.co/storage/v1/object/public/fotos_informes/logos/ansul-logo.png" class="ansul-logo" alt="ANSUL Authorized Distributor" />
                </div>
              </div>
            `;
          }
          
          // Agregar ESTADO Y OBSERVACIONES
          photosHTML += `
            <div class="electric-switch-estado">ESTADO Y OBSERVACIONES</div>
          `;
          
          // Buscar observaciones en las secciones posibles
          let observacionesTexto = null;
          fotosSections.forEach(seccion => {
            const observacionKey = `${componentKey}_${seccion}`;
            if (observaciones[observacionKey] && !observacionesTexto) {
              observacionesTexto = observaciones[observacionKey];
            }
          });
          
          if (observacionesTexto) {
            photosHTML += `
              <div class="estado-value">${observacionesTexto}</div>
            `;
          } else {
            photosHTML += `
              <div class="estado-value">Switch en buenas condiciones sin instalación completa.</div>
            `;
          }
          
          photosHTML += '</div>';
          return; // Ya procesamos todo para este componente
        }
        
        // Manejo normal para otros componentes
        photosHTML += `
          <div class="photo-section">
            <div class="photo-section-title">${displaySectionName}</div>
        `;
        
        if (sectionPhotos.length > 0) {
          photosHTML += `
            <div class="photos-grid">
              ${sectionPhotos.map(photo => `
                <div class="photo-item">
                  <img src="${photo.imageUrl}" class="photo-img" alt="${displaySectionName}" />
                </div>
              `).join('')}
            </div>
          `;
        } else {
          // Para OBSERVACIONES FOTOGRÁFICAS (Sistema_Supresion), no mostrar logo si no hay fotos
          if (componentKey === 'Sistema_Supresion') {
            // No mostrar nada cuando no hay fotos en Observaciones Fotográficas
            photosHTML += `<div class="no-photos-message">No hay fotografías disponibles</div>`;
          } else {
            // Mostrar logo ANSUL cuando no hay fotos para otros componentes de ANSUL R-102
            photosHTML += `
              <div class="photos-grid">
                <div class="photo-item ansul-logo-placeholder">
                  <img src="https://mwtdoidrjuahsejfctlm.supabase.co/storage/v1/object/public/fotos_informes/logos/ansul-logo.png" class="ansul-logo" alt="ANSUL Authorized Distributor" />
                </div>
              </div>
            `;
          }
        }
        
        // Mostrar observaciones de la sección si existen
        const observacionKey = `${componentKey}_${sectionKey}`;
        
        // Para componentes ANSUL específicos, mostrar observaciones con formato especial
        if (componentKey === 'Cartuchos_Gas' && sectionKey === 'DESPUES') {
          photosHTML += `
            <div class="electric-switch-estado">OBSERVACIONES</div>
          `;
          if (observaciones[observacionKey]) {
            photosHTML += `
              <div class="estado-value">${observaciones[observacionKey]}</div>
            `;
          }
        } else if (observaciones[observacionKey]) {
          photosHTML += `
            <div class="section-observations">
              <div class="section-observations-title">Observaciones:</div>
              <div class="section-observations-text">${observaciones[observacionKey]}</div>
            </div>
          `;
        }
        
        photosHTML += '</div>';
      });

      photosHTML += '</div>';
    });

    return photosHTML;
  }

  // Función principal para generar y compartir PDF
  static async generateAndSharePDF(orderId, tableName, customFileName = 'Informe') {
    try {
      console.log('🔄 Iniciando generación de PDF...');
      console.log('📄 Nombre de archivo solicitado:', customFileName);
      
      // FORZAR RECARGA COMPLETA: Limpiar cualquier cache
      console.log('⏱️ Forzando regeneración completa...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Aumentar tiempo de espera
      
      // 1. Obtener datos completos FRESCOS (sin cache)
      console.log('🔄 Obteniendo datos actualizados de la base de datos...');
      const data = await this.getCompleteOrderData(orderId, tableName);
      
      console.log('📊 Datos del formulario obtenidos:', {
        tieneFormData: !!data.formData,
        campos: data.formData ? Object.keys(data.formData).length : 0,
        fotosCount: data.photos?.length || 0
      });
      
      // 2. Generar HTML con timestamp único para forzar nueva versión
      const timestamp = new Date().toISOString();
      const htmlContent = this.generatePDFHTML(data, timestamp);
      
      // 3. Generar PDF con nombre completamente único y timestamp
      const uniqueId = Math.random().toString(36).substr(2, 15);
      const finalFileName = `${customFileName}_FINAL_v3070_${Date.now()}_${uniqueId}.pdf`;
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        width: 612,
        height: 792,
        margins: {
          left: 20,
          top: 20,
          right: 20,
          bottom: 20,
        },
      });

      console.log('✅ PDF generado en:', uri);
      console.log('📄 Nombre final del archivo:', finalFileName);

      // VERIFICAR CONTENIDO DEL PDF GENERADO
      console.log('🔍 Verificando contenido del HTML generado...');
      console.log('📝 HTML contiene tabla diagnóstico?', htmlContent.includes('diagnostic-table-v3070-final'));
      console.log('📝 HTML contiene estilos 30/70?', htmlContent.includes('width: 30%') && htmlContent.includes('width: 70%'));
      console.log('📝 HTML contiene versión profesional?', htmlContent.includes('VERSIÓN PROFESIONAL'));
      console.log('📝 HTML contiene colores profesionales?', htmlContent.includes('#f5f5f5'));

      // 4. Guardar en Supabase Storage - FORZAR NUEVA VERSIÓN
      console.log('☁️ Guardando PDF actualizado en Supabase Storage...');
      console.log('📁 URI del archivo FRESCO a guardar:', uri);
      
      // Determinar tipo de documento más descriptivo
      let tipoDocumento;
      if (tableName === 'informe_limpieza_ductos') {
        tipoDocumento = 'Informe Limpieza Ductos';
      } else if (tableName === 'informe_ansul_r102') {
        tipoDocumento = 'Informe ANSUL R-102';
      } else if (tableName === 'informe_electromecanico') {
        tipoDocumento = 'Informe Electromecánico';
      } else {
        tipoDocumento = tableName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
      
      // FORZAR ELIMINACIÓN MÚLTIPLE ANTES DE GUARDAR
      console.log('🗑️ ELIMINANDO TODOS los archivos anteriores para forzar nueva versión...');
      try {
        // Primera eliminación por tipo
        const existingDoc = await DocumentStorageService.getDocumentByType(orderId, tipoDocumento);
        if (existingDoc) {
          console.log('🗑️ Eliminando documento anterior del storage (primera pasada)...');
          await DocumentStorageService.deleteDocumentCompletely(existingDoc);
          console.log('✅ Primera eliminación completada');
        }
        
        // Esperar y segunda eliminación por patrón de nombre
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Segunda eliminación más agresiva para cualquier archivo relacionado
        console.log('🔄 Realizando segunda pasada de eliminación...');
        const allDocsForOrder = await DocumentStorageService.getDocumentsByOrder(orderId);
        for (const doc of allDocsForOrder.filter(d => d.tipo_documento === tipoDocumento)) {
          await DocumentStorageService.deleteDocumentCompletely(doc);
        }
        
        // Esperar adicional para limpieza completa de cache
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('✅ Eliminación múltiple completada');
        
      } catch (deleteError) {
        console.warn('⚠️ Error eliminando documentos anteriores:', deleteError);
      }
      
      console.log('💾 Guardando archivo NUEVO con proporciones 30/70:', tipoDocumento);
      const storageResult = await DocumentStorageService.saveDocument(orderId, uri, tipoDocumento);
      
      if (storageResult.success) {
        console.log('✅ PDF guardado en Storage:', {
          esNuevo: storageResult.esNuevo,
          version: storageResult.version,
          url: storageResult.urlPublica
        });
      } else {
        console.warn('⚠️ Error guardando en Storage:', storageResult.error);
        // Continuar con el proceso aunque falle el guardado
      }

      // 5. Compartir PDF - COMENTADO TEMPORALMENTE
      // Comentado para solo guardar en storage sin mostrar opciones de compartir
      /*
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Compartir ${finalFileName}`,
          UTI: 'com.adobe.pdf'
        });
        console.log('✅ PDF compartido exitosamente como:', finalFileName);
      } else {
        throw new Error('Compartir archivos no está disponible en este dispositivo');
      }
      */
      
      console.log('✅ PDF generado y guardado en storage (sin compartir):', finalFileName);

      return { 
        success: true, 
        uri, 
        fileName: finalFileName,
        storage: storageResult
      };

    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      throw error;
    }
  }
}

export default PDFService;