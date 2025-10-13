import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../lib/supabase';

// ==================== SERVICIO DE GENERACIÓN DE PDF ====================
export class PDFService {
  
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

      // 2. Obtener datos del formulario específico
      const { data: formData, error: formError } = await supabase
        .from(tableName)
        .select('*')
        .eq('orden_trabajo_id', orderId)
        .single();

      if (formError) {
        console.error('Error obteniendo formulario:', formError);
        // No es crítico si no hay datos del formulario
      }

      // 3. Obtener información del servicio y local
      const { data: serviceData, error: serviceError } = await supabase
        .from('servicios')
        .select(`
          *,
          local(
            nombre_local,
            direccion,
            empresa(nombre_empresa)
          )
        `)
        .eq('servicio_id', orderData.servicio_id)
        .single();

      if (serviceError) {
        console.error('Error obteniendo servicio:', serviceError);
      }

      // 4. Obtener fotografías organizadas por componente
      console.log('📸 DEBUG: Consultando fotografías para orden:', orderId, 'tabla:', tableName);
      
      const { data: photos, error: photosError } = await supabase
        .from('informe_fotografias')
        .select('*')
        .eq('orden_trabajo_id', orderId)
        .eq('informe_tabla', tableName)
        .order('componente', { ascending: true })
        .order('seccion', { ascending: true })
        .order('uploaded_at', { ascending: true });

      console.log('📸 DEBUG: Fotografías obtenidas de la BD:', photos?.length || 0);
      if (photos && photos.length > 0) {
        console.log('📸 DEBUG: Primeras 3 fotos:', photos.slice(0, 3).map(p => ({
          id: p.id,
          componente: p.componente,
          seccion: p.seccion,
          etiqueta: p.etiqueta,
          storage_path: p.storage_path
        })));
        
        // Verificar específicamente fotos de Campana_1 ANTES
        const campana1Antes = photos.filter(p => p.componente === 'Campana_1' && p.seccion === 'ANTES');
        console.log('📸 DEBUG: Fotos Campana_1 ANTES en BD:', campana1Antes.length);
        campana1Antes.forEach((foto, index) => {
          console.log(`📸 DEBUG: Campana_1 ANTES foto ${index + 1}:`, {
            id: foto.id,
            etiqueta: foto.etiqueta,
            storage_path: foto.storage_path,
            uploaded_at: foto.uploaded_at
          });
        });
      }

      if (photosError) {
        console.error('❌ Error obteniendo fotografías:', photosError);
      }

      // 5. Obtener técnicos asignados
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
  static generatePDFHTML(data) {
    const { order, formData, service, photos, tecnicos, tableName } = data;
    
    // Determinar el título basado en el tipo de informe
    const getInformeTitle = (tableName) => {
      switch (tableName) {
        case 'informe_ansul_r102':
          return 'INFORME DE MANTEIMIENTO SEMESTRAL ANSUL R-102';
        case 'informe_limpieza_ductos':
          return 'INFORME LIMPIEZA DE DUCTOS';
        default:
          return 'INFORME LIMPIEZA DE DUCTOS';
      }
    };
    
    const informeTitle = getInformeTitle(tableName);

    // Generar contenido específico según el tipo de informe
    if (tableName === 'informe_ansul_r102') {
      return this.generateAnsulR102PDF(order, formData, service, photos, tecnicos, informeTitle);
    } else {
      return this.generateLimpiezaDuctosPDF(order, formData, service, photos, tecnicos, informeTitle);
    }
  }

  // Generar PDF específico para Limpieza de Ductos
  static generateLimpiezaDuctosPDF(order, formData, service, photos, tecnicos, informeTitle) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Informe de Limpieza de Ductos</title>
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

  // Generar PDF específico para ANSUL R-102
  static generateAnsulR102PDF(order, formData, service, photos, tecnicos, informeTitle) {
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
          ${this.generateAnsulPhotosSection(photos)}
        </body>
      </html>
    `;
  }  // Estilos CSS para el PDF
  static getPDFStyles() {
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
      
      .diagnostic-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
      }
      
      .diagnostic-table th,
      .diagnostic-table td {
        padding: 6px;
        border: 1px solid #ddd;
        text-align: left;
        font-size: 9px;
      }
      
      .diagnostic-table th {
        background-color: #f5f5f5;
        font-weight: bold;
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
          <div style="font-weight: bold; font-size: 24px;">PMDUC</div>
          <div style="font-size: 8px; color: #666;">EXPERTOS EN DUCTOS</div>
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
            <td>${service.local?.empresa?.nombre_empresa || 'No disponible'}</td>
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
            <td class="label">ENCARGADO</td>
            <td>${formData.encargado || 'No especificado'}</td>
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
      return `
        <tr>
          <td>${item.label}</td>
          <td>${value}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="section">
        <div class="section-title">Tabla de Diagnóstico</div>
        <table class="diagnostic-table">
          ${tableRows}
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

  // Generar tabla de diagnóstico específica para ANSUL R-102
  static generateAnsulDiagnosticTable(formData) {
    const ansulComponents = [
      { label: 'Cilindro Agente', field: 'cilindro_agente_estado' },
      { label: 'Cañerías Distribución', field: 'canerias_distribucion_estado' },
      { label: 'Cartuchos Gas', field: 'cartuchos_gas_estado' },
      { label: 'Prueba Neumática', field: 'prueba_neumatica_estado' },
      { label: 'Tipo Cartucho', field: 'tipo_cartucho_estado' }
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
        <table class="diagnostic-table">
          ${tableRows}
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
  static generateAnsulPhotosSection(photos) {
    let photosHTML = '';
    
    // Configuración de componentes específicos para ANSUL R-102
    const ansulComponents = [
      { 
        key: 'Cilindro_Agente', 
        title: 'Cilindro Agente',
        sections: ['ANTES', 'DESPUES'] // Solo ANTES y DESPUES, no PROCESO
      },
      { 
        key: 'Canerias_Distribucion', 
        title: 'Cañerías Distribución',
        sections: ['ANTES', 'DESPUES'] // Solo ANTES y DESPUES, no PROCESO
      },
      { 
        key: 'Cartuchos_Gas', 
        title: 'Cartuchos Gas',
        sections: ['ANTES', 'DESPUES'] // Solo ANTES y DESPUES, no PROCESO
      },
      { 
        key: 'Prueba_Neumatica', 
        title: 'Prueba Neumática',
        sections: ['PROCESO'] // Solo PROCESO (que se muestra como RESPALDO)
      },
      { 
        key: 'Tipo_Cartucho', 
        title: 'Tipo Cartucho',
        sections: ['PROCESO'] // Solo PROCESO (que se muestra como RESPALDO)
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
        
        console.log(`🔍 DEBUG ANSUL PDF ${componentKey}: Sección ${sectionKey} -> ${displaySectionName}, fotos: ${sectionPhotos.length}`);
        
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
          photosHTML += `
            <div class="no-photos-message">No hay fotografías disponibles</div>
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
      
      // 1. Obtener datos completos
      const data = await this.getCompleteOrderData(orderId, tableName);
      
      // 2. Generar HTML
      const htmlContent = this.generatePDFHTML(data);
      
      // 3. Generar PDF con nombre personalizado
      const finalFileName = `${customFileName}.pdf`;
      
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

      // 4. Compartir PDF
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

      return { success: true, uri, fileName: finalFileName };

    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      throw error;
    }
  }
}

export default PDFService;