import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Share
} from 'react-native';
import { DocumentStorageService } from '../services/documentStorageService';
import { PDFService } from '../services/pdfService';

const DocumentManager = ({ ordenId, onRefresh }) => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState({});

  useEffect(() => {
    loadDocuments();
  }, [ordenId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await DocumentStorageService.getDocumentsByOrder(ordenId);
      setDocumentos(docs);
    } catch (error) {
      console.error('Error cargando documentos:', error);
      Alert.alert('Error', 'No se pudieron cargar los documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (documento) => {
    try {
      if (documento.urlPublica) {
        await Linking.openURL(documento.urlPublica);
      } else {
        Alert.alert('Error', 'URL del documento no disponible');
      }
    } catch (error) {
      console.error('Error abriendo documento:', error);
      Alert.alert('Error', 'No se pudo abrir el documento');
    }
  };

  const handleShareDocument = async (documento) => {
    try {
      if (documento.urlPublica) {
        await Share.share({
          message: `Documento: ${documento.nombre_archivo}`,
          url: documento.urlPublica,
          title: documento.nombre_archivo
        });
      } else {
        Alert.alert('Error', 'No se puede compartir el documento');
      }
    } catch (error) {
      console.error('Error compartiendo documento:', error);
      Alert.alert('Error', 'No se pudo compartir el documento');
    }
  };

  const handleRegenerateDocument = async (documento) => {
    Alert.alert(
      'Regenerar Documento',
      `¿Estás seguro de que quieres regenerar el documento "${getDocumentDisplayName(documento.tipo_documento)}"?\n\nEsto creará una nueva versión y actualizará el documento existente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Regenerar',
          style: 'destructive',
          onPress: () => regenerateDocument(documento)
        }
      ]
    );
  };

  const regenerateDocument = async (documento) => {
    try {
      setRegenerating(prev => ({ ...prev, [documento.id]: true }));
      
      // Determinar el nombre del archivo basado en el tipo
      const customFileName = getCustomFileName(documento.tipo_documento, ordenId);
      
      // Regenerar PDF
      const result = await PDFService.generateAndSharePDF(
        ordenId,
        documento.tipo_documento,
        customFileName
      );

      if (result.success) {
        Alert.alert(
          'Éxito',
          `Documento regenerado exitosamente.\nVersión: ${result.storage?.version || 'Nueva'}`,
          [{ text: 'OK', onPress: () => {
            loadDocuments(); // Recargar lista
            onRefresh?.(); // Notificar al componente padre
          }}]
        );
      } else {
        throw new Error('Error en la regeneración');
      }
    } catch (error) {
      console.error('Error regenerando documento:', error);
      Alert.alert('Error', 'No se pudo regenerar el documento');
    } finally {
      setRegenerating(prev => ({ ...prev, [documento.id]: false }));
    }
  };

  const handleDeleteDocument = async (documento) => {
    Alert.alert(
      'Eliminar Documento',
      `¿Estás seguro de que quieres eliminar "${documento.nombre_archivo}"?\n\nEsta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteDocument(documento)
        }
      ]
    );
  };

  const deleteDocument = async (documento) => {
    try {
      const success = await DocumentStorageService.deleteDocument(documento.id);
      
      if (success) {
        Alert.alert('Éxito', 'Documento eliminado exitosamente');
        loadDocuments(); // Recargar lista
        onRefresh?.(); // Notificar al componente padre
      } else {
        Alert.alert('Error', 'No se pudo eliminar el documento');
      }
    } catch (error) {
      console.error('Error eliminando documento:', error);
      Alert.alert('Error', 'No se pudo eliminar el documento');
    }
  };

  const getDocumentDisplayName = (tipoDocumento) => {
    const displayNames = {
      'informe_limpieza_ductos': 'Informe Limpieza Ductos',
      'informe_ansul_r102': 'Informe ANSUL R-102',
      'informe_electromecanico': 'Informe Electromecánico'
    };
    return displayNames[tipoDocumento] || tipoDocumento;
  };

  const getCustomFileName = (tipoDocumento, ordenId) => {
    const fileNames = {
      'informe_limpieza_ductos': `FORMULARIO_INFORME_LIMPIEZA_DUCTOS_${ordenId.slice(0, 8)}`,
      'informe_ansul_r102': `FORMULARIO_INFORME_ANSUL_R102_${ordenId.slice(0, 8)}`,
      'informe_electromecanico': `FORMULARIO_INFORME_ELECTROMECANICO_${ordenId.slice(0, 8)}`
    };
    return fileNames[tipoDocumento] || `FORMULARIO_${tipoDocumento.toUpperCase()}_${ordenId.slice(0, 8)}`;
  };

  const getDocumentIcon = (tipoDocumento) => {
    const icons = {
      'informe_limpieza_ductos': '🧹',
      'informe_ansul_r102': '🔥',
      'informe_electromecanico': '⚡'
    };
    return icons[tipoDocumento] || '📄';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderDocument = ({ item: documento }) => {
    const isRegenerating = regenerating[documento.id];
    
    return (
      <View style={styles.documentCard}>
        <View style={styles.documentHeader}>
          <View style={styles.documentInfo}>
            <Text style={styles.documentIcon}>{getDocumentIcon(documento.tipo_documento)}</Text>
            <View style={styles.documentDetails}>
              <Text style={styles.documentTitle}>
                {getDocumentDisplayName(documento.tipo_documento)}
              </Text>
              <Text style={styles.documentSubtitle}>
                {documento.nombre_archivo}
              </Text>
              <View style={styles.documentMeta}>
                <Text style={styles.documentMetaText}>
                  📅 {formatDate(documento.updated_at)}
                </Text>
                <Text style={styles.documentMetaText}>
                  📦 {formatFileSize(documento.tamano_archivo)}
                </Text>
                <Text style={styles.documentMetaText}>
                  🔄 v{documento.version}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.documentActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => handleViewDocument(documento)}
          >
            <Text style={styles.actionButtonText}>👁️ Ver</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={() => handleShareDocument(documento)}
          >
            <Text style={styles.actionButtonText}>📤 Compartir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.regenerateButton]}
            onPress={() => handleRegenerateDocument(documento)}
            disabled={isRegenerating}
          >
            {isRegenerating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>🔄 Regenerar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteDocument(documento)}
          >
            <Text style={styles.actionButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#45B7D1" />
        <Text style={styles.loadingText}>Cargando documentos...</Text>
      </View>
    );
  }

  if (documentos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📄</Text>
        <Text style={styles.emptyTitle}>No hay documentos</Text>
        <Text style={styles.emptySubtitle}>
          Los documentos PDF generados aparecerán aquí
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📁 Documentos Generados</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadDocuments}
        >
          <Text style={styles.refreshButtonText}>🔄 Actualizar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={documentos}
        renderItem={renderDocument}
        keyExtractor={(item) => item.id}
        style={styles.documentsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#45B7D1',
    borderRadius: 6,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  documentsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  documentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  documentHeader: {
    marginBottom: 15,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  documentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  documentDetails: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  documentSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  documentMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  documentMetaText: {
    fontSize: 11,
    color: '#999',
    marginRight: 15,
    marginBottom: 2,
  },
  documentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#45B7D1',
  },
  shareButton: {
    backgroundColor: '#28a745',
  },
  regenerateButton: {
    backgroundColor: '#ffc107',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    minWidth: 40,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default DocumentManager;