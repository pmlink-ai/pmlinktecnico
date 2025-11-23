import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';

export class DocumentStorageServiceTemp {
  
  /**
   * Versión temporal usando bucket fotos_informes (más permisivo)
   */
  static async saveDocument(ordenId, pdfUri, tipoDocumento) {
    try {
      console.log('📁 [TEMP] Guardando documento en Storage...', { ordenId, tipoDocumento });

      // 1. Generar nombre de archivo y ruta (en bucket fotos_informes)
      const nombreArchivo = this.generateFileName(tipoDocumento, ordenId);
      const rutaStorage = `public/documentos/${ordenId}/${nombreArchivo}`;
      
      console.log('📋 [TEMP] Archivo a guardar:', { nombreArchivo, rutaStorage });

      // 2. Leer el archivo PDF como binary
      const fileInfo = await FileSystem.getInfoAsync(pdfUri);
      if (!fileInfo.exists) {
        throw new Error('El archivo PDF no existe en la ruta especificada');
      }

      console.log('📄 [TEMP] Información del archivo:', {
        tamaño: fileInfo.size,
        uri: pdfUri
      });

      // 3. Leer archivo como base64
      const base64Data = await FileSystem.readAsStringAsync(pdfUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 4. Convertir base64 a array buffer
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // 5. Subir archivo a Supabase Storage (usando bucket fotos_informes temporalmente)
      console.log('☁️ [TEMP] Subiendo archivo a bucket fotos_informes...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('fotos_informes')
        .upload(rutaStorage, byteArray, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ [TEMP] Error subiendo archivo:', uploadError);
        throw new Error(`Error subiendo archivo: ${uploadError.message}`);
      }

      console.log('✅ [TEMP] Archivo subido exitosamente:', uploadData);

      // 6. Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('fotos_informes')
        .getPublicUrl(rutaStorage);

      console.log('🔗 [TEMP] URL pública generada:', urlData.publicUrl);

      // 7. Crear o actualizar registro en tabla (usando tabla de fotos temporalmente)
      const documentoData = {
        informe_id: ordenId,
        componente: 'DOCUMENTO_PDF',
        numero_foto: 1,
        ruta_foto: rutaStorage,
        url_foto: urlData.publicUrl,
        metadatos: JSON.stringify({
          tipo_documento: tipoDocumento,
          nombre_original: nombreArchivo,
          tamaño_bytes: fileInfo.size,
          fecha_generacion: new Date().toISOString()
        })
      };

      // Verificar si ya existe
      const { data: existente } = await supabase
        .from('fotografias')
        .select('*')
        .eq('informe_id', ordenId)
        .eq('componente', 'DOCUMENTO_PDF')
        .single();

      let dbResult;
      if (existente) {
        // Actualizar existente
        const { data, error } = await supabase
          .from('fotografias')
          .update(documentoData)
          .eq('id', existente.id)
          .select();
        dbResult = { data, error };
      } else {
        // Insertar nuevo
        const { data, error } = await supabase
          .from('fotografias')
          .insert([documentoData])
          .select();
        dbResult = { data, error };
      }

      if (dbResult.error) {
        console.error('❌ [TEMP] Error en base de datos:', dbResult.error);
        throw new Error(`Error en base de datos: ${dbResult.error.message}`);
      }

      console.log('✅ [TEMP] Documento guardado exitosamente en BD');

      return {
        success: true,
        esNuevo: !existente,
        version: 1,
        urlPublica: urlData.publicUrl,
        documento: dbResult.data[0]
      };

    } catch (error) {
      console.error('💥 [TEMP] Error en saveDocument:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static generateFileName(tipoDocumento, ordenId) {
    const timestamp = new Date().toISOString().split('T')[0];
    
    let tipoNormalizado;
    if (tipoDocumento === 'Informe Limpieza Ductos') {
      tipoNormalizado = 'INFORME_LIMPIEZA_DUCTOS';
    } else if (tipoDocumento === 'Informe ANSUL R-102') {
      tipoNormalizado = 'INFORME_ANSUL_R102';
    } else if (tipoDocumento === 'Informe Electromecánico') {
      tipoNormalizado = 'INFORME_ELECTROMECANICO';
    } else {
      tipoNormalizado = tipoDocumento.toUpperCase()
        .replace(/\s+/g, '_')
        .replace(/[^A-Z0-9_]/g, '')
        .replace(/_+/g, '_');
    }
    
    return `FORMULARIO_${tipoNormalizado}_${ordenId.slice(0, 8)}_${timestamp}.pdf`;
  }
}