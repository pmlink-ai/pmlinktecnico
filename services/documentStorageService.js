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
      const rutaStorage = this.generateStoragePath(ordenId, nombreArchivo);
      
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
      const base64Data = await FileSystem.readAsStringAsync(pdfUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 5. Convertir base64 a array buffer
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // 6. Subir archivo a Supabase Storage
      console.log('☁️ Subiendo archivo a Supabase Storage...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documentos-ordenes')
        .upload(rutaStorage, byteArray, {
          contentType: 'application/pdf',
          upsert: true // Sobrescribir si existe
        });

      if (uploadError) {
        console.error('❌ Error subiendo archivo:', uploadError);
        throw new Error(`Error subiendo archivo: ${uploadError.message}`);
      }

      console.log('✅ Archivo subido exitosamente:', uploadData);

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
      
      // 1. Eliminar archivo de Storage
      const { error: storageError } = await supabase.storage
        .from('documentos-ordenes')
        .remove([documento.ruta_storage]);

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
        .from('documentos-ordenes')
        .getPublicUrl(rutaStorage);

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
        .from('documentos-ordenes')
        .remove([documento.ruta_storage]);

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
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Normalizar el tipo de documento para nombre de archivo (sin espacios)
    let tipoNormalizado;
    if (tipoDocumento === 'Informe Limpieza Ductos') {
      tipoNormalizado = 'INFORME_LIMPIEZA_DUCTOS';
    } else if (tipoDocumento === 'Informe ANSUL R-102') {
      tipoNormalizado = 'INFORME_ANSUL_R102';
    } else if (tipoDocumento === 'Informe Electromecánico') {
      tipoNormalizado = 'INFORME_ELECTROMECANICO';
    } else {
      // Para otros tipos, convertir espacios y caracteres especiales
      tipoNormalizado = tipoDocumento.toUpperCase()
        .replace(/\s+/g, '_')
        .replace(/[^A-Z0-9_]/g, '')
        .replace(/_+/g, '_');
    }
    
    return `FORMULARIO_${tipoNormalizado}_${ordenId.slice(0, 8)}_${timestamp}.pdf`;
  }

  /**
   * Genera la ruta de almacenamiento en Storage
   * @param {string} ordenId - ID de la orden
   * @param {string} nombreArchivo - Nombre del archivo
   * @returns {string} - Ruta completa
   */
  static generateStoragePath(ordenId, nombreArchivo) {
    return `${ordenId}/${nombreArchivo}`;
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