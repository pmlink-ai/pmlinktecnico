import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';

export class DocumentStorageService {
  
  /**
   * Guarda un PDF en Supabase Storage y registra en la base de datos
   * @param {string} ordenId - ID de la orden de trabajo
   * @param {string} pdfUri - URI local del archivo PDF
   * @param {string} tipoDocumento - Tipo de documento (ej: 'informe_limpieza_ductos')
   * @returns {Object} - Información del documento guardado
   */
  static async saveDocument(ordenId, pdfUri, tipoDocumento) {
    try {
      console.log('📁 Guardando documento en Storage...', { ordenId, tipoDocumento });

      // 1. Generar nombre de archivo y ruta
      const nombreArchivo = this.generateFileName(tipoDocumento, ordenId);
      const rutaStorage = await this.generateStoragePath(ordenId, nombreArchivo);
      
      console.log('📋 Archivo a guardar:', { nombreArchivo, rutaStorage });

      // 2. Verificar si existe documento previo
      const documentoExistente = await this.getDocumentByType(ordenId, tipoDocumento);
      let version = 1;
      
      if (documentoExistente) {
        version = documentoExistente.version + 1;
        console.log(`🔄 Actualizando documento existente, nueva versión: ${version}`);
      }

      // 3. Leer el archivo PDF como binary
      const fileInfo = await FileSystem.getInfoAsync(pdfUri);
      if (!fileInfo.exists) {
        throw new Error('El archivo PDF no existe en la ruta especificada');
      }

      console.log('📄 Información del archivo:', {
        tamaño: fileInfo.size,
        uri: pdfUri
      });

      // 4. Leer archivo como base64
      console.log('📖 Leyendo archivo PDF desde URI:', pdfUri);
      const base64Data = await FileSystem.readAsStringAsync(pdfUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('📊 Archivo leído, tamaño en base64:', base64Data.length);

      // 5. Convertir base64 a array buffer
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      
      console.log('🔄 Archivo convertido a bytes, tamaño:', byteArray.length);

      // 6. Subir archivo a Supabase Storage
      console.log('☁️ Subiendo archivo actualizado a Supabase Storage...');
      console.log('📁 Bucket: documentos');
      console.log('📁 Ruta interna: documentos-ordenes/', rutaStorage);
      console.log('📁 Ruta completa será: documentos/documentos-ordenes/' + rutaStorage);
      console.log('📊 Tamaño del archivo (bytes):', byteArray.length);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(`documentos-ordenes/${rutaStorage}`, byteArray, {
          contentType: 'application/pdf',
          upsert: true // Sobrescribir si existe
        });

      if (uploadError) {
        console.error('❌ Error subiendo archivo:', uploadError);
        console.error('❌ Detalles del error:', {
          message: uploadError.message,
          statusCode: uploadError.statusCode,
          error: uploadError.error
        });
        throw new Error(`Error subiendo archivo: ${uploadError.message}`);
      }

      console.log('✅ Archivo subido exitosamente!');
      console.log('📊 Datos de upload:', uploadData);
      console.log('📁 Ruta final en storage:', uploadData?.path || 'No disponible');

      // 7. Registrar o actualizar en base de datos
      let dbResult;
      const documentData = {
        orden_trabajo_id: ordenId,
        nombre_archivo: nombreArchivo,
        tipo_documento: tipoDocumento,
        ruta_storage: rutaStorage,
        tamano_archivo: fileInfo.size,
        version: version,
        updated_at: new Date().toISOString()
      };

      if (documentoExistente) {
        // Actualizar documento existente
        const { data, error } = await supabase
          .from('documentos_orden_trabajo')
          .update(documentData)
          .eq('id', documentoExistente.id)
          .select()
          .single();

        dbResult = { data, error };
      } else {
        // Crear nuevo documento
        const { data, error } = await supabase
          .from('documentos_orden_trabajo')
          .insert(documentData)
          .select()
          .single();

        dbResult = { data, error };
      }

      if (dbResult.error) {
        console.error('❌ Error guardando en BD:', dbResult.error);
        throw new Error(`Error guardando en base de datos: ${dbResult.error.message}`);
      }

      console.log('✅ Documento registrado en BD:', dbResult.data);

      // 8. Generar URL pública
      const urlPublica = await this.getPublicUrl(rutaStorage);

      return {
        success: true,
        documento: dbResult.data,
        urlPublica: urlPublica,
        esNuevo: !documentoExistente,
        version: version
      };

    } catch (error) {
      console.error('💥 Error en saveDocument:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene todos los documentos de una orden de trabajo
   * @param {string} ordenId - ID de la orden de trabajo
   * @returns {Array} - Lista de documentos
   */
  static async getDocumentsByOrder(ordenId) {
    try {
      const { data, error } = await supabase
        .from('documentos_orden_trabajo')
        .select('*')
        .eq('orden_trabajo_id', ordenId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo documentos:', error);
        return [];
      }

      // Agregar URLs públicas a cada documento
      const documentosConUrls = await Promise.all(
        data.map(async (doc) => ({
          ...doc,
          urlPublica: await this.getPublicUrl(doc.ruta_storage)
        }))
      );

      return documentosConUrls;
    } catch (error) {
      console.error('Error en getDocumentsByOrder:', error);
      return [];
    }
  }

  /**
   * Obtiene un documento específico por tipo
   * @param {string} ordenId - ID de la orden de trabajo
   * @param {string} tipoDocumento - Tipo de documento
   * @returns {Object|null} - Documento encontrado o null
   */
  static async getDocumentByType(ordenId, tipoDocumento) {
    try {
      const { data, error } = await supabase
        .from('documentos_orden_trabajo')
        .select('*')
        .eq('orden_trabajo_id', ordenId)
        .eq('tipo_documento', tipoDocumento)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error obteniendo documento por tipo:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error en getDocumentByType:', error);
      return null;
    }
  }

  /**
   * Verifica si existe un documento y maneja la confirmación de actualización
   * @param {string} ordenId - ID de la orden de trabajo
   * @param {string} tipoDocumento - Tipo de documento
   * @returns {Object} - Estado y documento existente
   */
  static async checkDocumentExists(ordenId, tipoDocumento) {
    try {
      const documentoExistente = await this.getDocumentByType(ordenId, tipoDocumento);
      
      if (documentoExistente) {
        console.log('📄 Documento existente encontrado:', {
          id: documentoExistente.id,
          nombre: documentoExistente.nombre_archivo,
          fecha_creacion: documentoExistente.fecha_creacion
        });
        
        return {
          existe: true,
          documento: documentoExistente
        };
      }
      
      return {
        existe: false,
        documento: null
      };
    } catch (error) {
      console.error('Error verificando existencia de documento:', error);
      return {
        existe: false,
        documento: null
      };
    }
  }

  /**
   * Elimina completamente un documento del storage y base de datos
   * @param {Object} documento - Documento a eliminar
   * @returns {boolean} - Éxito de la operación
   */
  static async deleteDocumentCompletely(documento) {
    try {
      console.log('🗑️ Eliminando documento completamente...', documento.nombre_archivo);
      
      // Eliminar archivo de Storage
      const { error: storageError } = await supabase.storage
        .from('documentos')
        .remove([`documentos-ordenes/${documento.ruta_storage}`]);

      if (storageError) {
        console.error('⚠️ Error eliminando archivo de Storage:', storageError);
        // Continuar con eliminación de BD aunque falle Storage
      } else {
        console.log('✅ Archivo eliminado del Storage');
      }

      // 2. Eliminar registro de BD
      const { error: dbError } = await supabase
        .from('documentos_orden_trabajo')
        .delete()
        .eq('id', documento.id);

      if (dbError) {
        console.error('❌ Error eliminando documento de BD:', dbError);
        return false;
      }

      console.log('✅ Documento eliminado completamente de BD y Storage');
      return true;
    } catch (error) {
      console.error('💥 Error en deleteDocumentCompletely:', error);
      return false;
    }
  }

  /**
   * Obtiene la URL pública de un documento
   * @param {string} rutaStorage - Ruta del archivo en Storage
   * @returns {string} - URL pública
   */
  static async getPublicUrl(rutaStorage) {
    try {
      const { data } = supabase.storage
        .from('documentos')
        .getPublicUrl(`documentos-ordenes/${rutaStorage}`);

      return data.publicUrl;
    } catch (error) {
      console.error('Error obteniendo URL pública:', error);
      return null;
    }
  }

  /**
   * Elimina un documento (soft delete)
   * @param {string} documentoId - ID del documento
   * @returns {boolean} - Éxito de la operación
   */
  static async deleteDocument(documentoId) {
    try {
      // Primero obtener información del documento
      const { data: documento, error: getError } = await supabase
        .from('documentos_orden_trabajo')
        .select('*')
        .eq('id', documentoId)
        .single();

      if (getError) {
        console.error('Error obteniendo documento a eliminar:', getError);
        return false;
      }

      // Eliminar archivo de Storage
      const { error: storageError } = await supabase.storage
        .from('documentos')
        .remove([`documentos-ordenes/${documento.ruta_storage}`]);

      if (storageError) {
        console.error('Error eliminando archivo de Storage:', storageError);
        // Continuar con eliminación de BD aunque falle Storage
      }

      // Eliminar registro de BD
      const { error: dbError } = await supabase
        .from('documentos_orden_trabajo')
        .delete()
        .eq('id', documentoId);

      if (dbError) {
        console.error('Error eliminando documento de BD:', dbError);
        return false;
      }

      console.log('✅ Documento eliminado exitosamente');
      return true;
    } catch (error) {
      console.error('Error en deleteDocument:', error);
      return false;
    }
  }

  /**
   * Genera el nombre de archivo estándar
   * @param {string} tipoDocumento - Tipo de documento
   * @param {string} ordenId - ID de la orden
   * @returns {string} - Nombre del archivo
   */
  static generateFileName(tipoDocumento, ordenId) {
    // Normalizar el tipo de documento para nombre de archivo (sin espacios)
    let tipoNormalizado;
    if (tipoDocumento === 'Informe Limpieza Ductos') {
      tipoNormalizado = 'INFORME_LIMPIEZA_DUCTOS';
    } else if (tipoDocumento === 'Informe ANSUL R-102') {
      tipoNormalizado = 'INFORME_ANSUL_R102';
    } else if (tipoDocumento === 'Informe Electromecánico') {
      tipoNormalizado = 'INFORME_ELECTROMECANICO';
    } else if (tipoDocumento === 'Certificado' || tipoDocumento.includes('Certificado')) {
      // Para certificados, NO agregar timestamp - nombre fijo para reemplazar
      tipoNormalizado = 'CERTIFICADO_LIMPIEZA_DUCTOS';
      return `FORMULARIO_${tipoNormalizado}_${ordenId.slice(0, 8)}.pdf`;
    } else {
      // Para otros tipos, convertir espacios y caracteres especiales
      tipoNormalizado = tipoDocumento.toUpperCase()
        .replace(/\s+/g, '_')
        .replace(/[^A-Z0-9_]/g, '')
        .replace(/_+/g, '_');
    }
    
    // Para informes normales, agregar timestamp con segundos para forzar nueva versión
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const timeWithSeconds = new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].substring(0, 8); // HH-MM-SS
    return `FORMULARIO_${tipoNormalizado}_${ordenId.slice(0, 8)}_${timestamp}_${timeWithSeconds}.pdf`;
  }

  /**
   * Obtiene la información jerárquica de la orden para crear la estructura de carpetas
   * @param {string} ordenId - ID de la orden de trabajo
   * @returns {Object} - Información de empresa, zona, local y servicio
   */
  static async getOrderHierarchyInfo(ordenId) {
    try {
      console.log('🔍 Obteniendo información jerárquica para orden:', ordenId);
      
      // Enfoque paso a paso para evitar problemas de relaciones múltiples
      
      // 1. Obtener orden y servicio_id
      const { data: ordenData, error: ordenError } = await supabase
        .from('orden_trabajo')
        .select('id, servicio_id')
        .eq('id', ordenId)
        .single();

      if (ordenError) {
        throw new Error(`Error obteniendo orden: ${ordenError.message}`);
      }

      console.log('📋 Datos de orden:', ordenData);

      // 2. Obtener servicio y local_id
      const { data: servicioData, error: servicioError } = await supabase
        .from('servicios')
        .select('servicio_id, local_id')
        .eq('servicio_id', ordenData.servicio_id)
        .single();

      if (servicioError) {
        throw new Error(`Error obteniendo servicio: ${servicioError.message}`);
      }

      console.log('📋 Datos de servicio:', servicioData);

      // 3. Obtener local y zona_id
      const { data: localData, error: localError } = await supabase
        .from('local')
        .select('local_id, zona_id')
        .eq('local_id', servicioData.local_id)
        .single();

      if (localError) {
        throw new Error(`Error obteniendo local: ${localError.message}`);
      }

      console.log('📋 Datos de local:', localData);

      // 4. Obtener zona y empresa_id
      const { data: zonaData, error: zonaError } = await supabase
        .from('zona')
        .select('zona_id, empresa_id')
        .eq('zona_id', localData.zona_id)
        .single();

      if (zonaError) {
        throw new Error(`Error obteniendo zona: ${zonaError.message}`);
      }

      console.log('📋 Datos de zona:', zonaData);

      // 5. Obtener empresa
      const { data: empresaData, error: empresaError } = await supabase
        .from('empresa')
        .select('empresa_id')
        .eq('empresa_id', zonaData.empresa_id)
        .single();

      if (empresaError) {
        throw new Error(`Error obteniendo empresa: ${empresaError.message}`);
      }

      console.log('📋 Datos de empresa:', empresaData);

      const hierarchy = {
        empresa_id: empresaData.empresa_id,
        zona_id: zonaData.zona_id,
        local_id: localData.local_id,
        servicio_id: servicioData.servicio_id,
        orden_trabajo_id: ordenId
      };

      console.log('✅ Jerarquía obtenida con consultas paso a paso:', hierarchy);
      return hierarchy;

    } catch (error) {
      console.error('💥 Error obteniendo jerarquía:', error);
      console.error('📊 Stack trace:', error.stack);
      // Fallback a estructura simple si falla
      console.log('⚠️ Usando estructura de carpeta simple como fallback');
      return {
        empresa_id: 'unknown',
        zona_id: 'unknown', 
        local_id: 'unknown',
        servicio_id: 'unknown',
        orden_trabajo_id: ordenId
      };
    }
  }

  /**
   * Genera la ruta de almacenamiento en Storage con estructura jerárquica
   * Estructura: empresa_id/zona_id/local_id/servicio_id/orden_trabajo_id/
   * @param {string} ordenId - ID de la orden
   * @param {string} nombreArchivo - Nombre del archivo
   * @returns {string} - Ruta completa
   */
  static async generateStoragePath(ordenId, nombreArchivo) {
    try {
      console.log('🔧 Generando ruta de storage para orden:', ordenId);
      
      // Obtener información jerárquica
      const hierarchy = await this.getOrderHierarchyInfo(ordenId);
      
      // Construir ruta jerárquica: empresa_id/zona_id/local_id/servicio_id/orden_trabajo_id/
      const rutaJerarquica = [
        hierarchy.empresa_id,
        hierarchy.zona_id, 
        hierarchy.local_id,
        hierarchy.servicio_id,
        hierarchy.orden_trabajo_id,
        nombreArchivo
      ].join('/');

      console.log('📁 Ruta jerárquica generada (sin bucket):', rutaJerarquica);
      console.log('📊 Componentes de la ruta:', {
        empresa: hierarchy.empresa_id,
        zona: hierarchy.zona_id,
        local: hierarchy.local_id,
        servicio: hierarchy.servicio_id,
        orden: hierarchy.orden_trabajo_id,
        archivo: nombreArchivo
      });
      
      return rutaJerarquica;

    } catch (error) {
      console.error('💥 Error generando ruta jerárquica:', error);
      console.error('📊 Stack del error:', error.stack);
      
      // Fallback a estructura simple
      const rutaSimple = `${ordenId}/${nombreArchivo}`;
      console.log('⚠️ Usando ruta simple como fallback:', rutaSimple);
      return rutaSimple;
    }
  }

  /**
   * Verifica el estado del Storage
   * @returns {boolean} - Si el bucket está accesible
   */
  static async verifyStorageHealth() {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Error verificando buckets:', error);
        return false;
      }

      const bucketExists = data.find(bucket => bucket.id === 'documentos-ordenes');
      console.log('📁 Bucket documentos-ordenes existe:', !!bucketExists);
      
      return !!bucketExists;
    } catch (error) {
      console.error('Error en verifyStorageHealth:', error);
      return false;
    }
  }

}