import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import WorkOrderService from '../../services/WorkOrderService';
import { globalStyles, colors } from '../../styles';

const { width } = Dimensions.get('window');

export default function WorkOrderDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params;

  // Estados principales
  const [workOrder, setWorkOrder] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');

  // Estados de control
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState('');

  // Cargar detalles de la orden - se ejecuta cada vez que la pantalla obtiene el foco
  useFocusEffect(
    React.useCallback(() => {
      loadWorkOrderDetails();
    }, [orderId])
  );

  const loadWorkOrderDetails = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Cargando detalles para orderId:', orderId);

      // Cargar la orden de trabajo básica primero
      const { data: orderData, error: orderError } = await supabase
        .from('orden_trabajo')
        .select(`
          id,
          titulo,
          descripcion_corta,
          descripcion_larga,
          estado_id,
          prioridad_id,
          equipo_id,
          tipo_mantenimiento_id,
          fecha_inicio,
          fecha_estimada_fin,
          fecha_cierre,
          usuario_id,
          created_at,
          updated_at
        `)
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('Error cargando orden desde Supabase:', orderError);
        throw orderError;
      }

      console.log('Orden básica cargada:', orderData);

      // Cargar datos relacionados por separado
      const [estadoData, prioridadData, equipoData, tipoData] = await Promise.all([
        // Cargar estado
        supabase
          .from('estados_orden_trabajo')
          .select('id, nombre, descripcion')
          .eq('id', orderData.estado_id)
          .single(),
        
        // Cargar prioridad
        orderData.prioridad_id ? supabase
          .from('prioridades')
          .select('id, nombre, nivel, descripcion')
          .eq('id', orderData.prioridad_id)
          .single() : Promise.resolve({ data: null }),
        
        // Cargar equipo
        orderData.equipo_id ? supabase
          .from('equipo')
          .select('equipo_id, nombre_equipo, codigo_equipo, descripcion, marca, modelo')
          .eq('equipo_id', orderData.equipo_id)
          .single() : Promise.resolve({ data: null }),
        
        // Cargar tipo de mantenimiento
        orderData.tipo_mantenimiento_id ? supabase
          .from('tiposmantenimiento')
          .select('tipo_id, nombre_tipo, descripcion')
          .eq('tipo_id', orderData.tipo_mantenimiento_id)
          .single() : Promise.resolve({ data: null })
      ]);

      // Formatear datos para compatibilidad con el componente
      const formattedData = {
        ...orderData,
        numero_ot: `OT-${orderData.id.substring(0, 8).toUpperCase()}`,
        estado_nombre: estadoData.data?.nombre || 'Sin estado',
        prioridad_nombre: prioridadData.data?.nombre || 'Sin prioridad',
        prioridad_nivel: prioridadData.data?.nivel || 1,
        equipo_nombre: equipoData.data?.nombre_equipo || 'Sin equipo',
        equipo_codigo: equipoData.data?.codigo_equipo || null,
        equipo_descripcion: equipoData.data?.descripcion || null,
        equipo_marca: equipoData.data?.marca || null,
        equipo_modelo: equipoData.data?.modelo || null,
        tipo_mantenimiento_nombre: tipoData.data?.nombre_tipo || 'Sin tipo',
        tipo_mantenimiento_descripcion: tipoData.data?.descripcion || null,
        // Mantener referencias para compatibilidad
        estados_orden_trabajo: estadoData.data,
        prioridades: prioridadData.data,
        equipo: equipoData.data,
        tiposmantenimiento: tipoData.data
      };

      setWorkOrder(formattedData);
      setAttachments([]);
      
      // Cargar comentarios después de cargar la orden
      await loadComments();

    } catch (error) {
      console.error('Error inesperado al cargar detalles:', error);
      
      // Usar datos de fallback en caso de error
      const fallbackData = route.params?.workOrder || {
        id: orderId,
        numero_ot: 'OT-ERROR-001',
        titulo: 'Error al cargar orden',
        descripcion_corta: 'No se pudieron cargar los detalles',
        estado_id: 1,
        estados_orden_trabajo: { nombre: 'Pendiente' },
        prioridad_id: 2,
        prioridades: { nombre: 'Media' }
      };
      
      setWorkOrder(fallbackData);
      setError('Error al cargar los detalles. Mostrando información limitada.');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      // Por ahora, usar comentarios de ejemplo hasta que esté implementada la tabla
      const sampleComments = [
        {
          id: 1,
          texto_comentario: 'Comentario de ejemplo para esta orden de trabajo.',
          created_at: new Date().toISOString(),
          usuario_email: 'usuario@demo.com'
        }
      ];
      
      setComments(sampleComments);
      console.log('Comentarios de ejemplo cargados');
    } catch (error) {
      console.warn('Error al cargar comentarios:', error);
      setComments([]);
    }
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim()) {
      Alert.alert('Error', 'Por favor ingresa un comentario');
      return;
    }

    try {
      setSubmittingComment(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Usuario no autenticado');
        return;
      }

      // Crear comentario local de demostración
      const newComment = {
        id: comments.length + 1,
        texto_comentario: newCommentText.trim(),
        created_at: new Date().toISOString(),
        usuario_email: user.email || 'usuario@demo.com'
      };

      // Agregar el comentario a la lista local
      setComments(prevComments => [...prevComments, newComment]);
      setNewCommentText('');

      Alert.alert('Éxito', 'Comentario agregado exitosamente');
      console.log('Comentario agregado:', newComment);
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      Alert.alert('Error', 'Error inesperado al agregar el comentario');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditWorkOrder = () => {
    // Navegar a la pantalla de edición pasando los datos de la orden
    navigation.navigate('EditWorkOrder', { 
      workOrder: workOrder,
      orderId: orderId 
    });
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatear fecha simple
  const formatSimpleDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obtener color por prioridad
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'alta':
        return colors.danger;
      case 'media':
        return colors.warning;
      case 'baja':
        return colors.success;
      default:
        return colors.textMuted;
    }
  };

  // Obtener color por estado
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pendiente':
        return colors.warning;
      case 'en progreso':
        return colors.info;
      case 'completada':
        return colors.success;
      case 'cancelada':
        return colors.danger;
      default:
        return colors.textMuted;
    }
  };

  // Renderizar adjunto
  const renderAttachment = ({ item }) => (
    <TouchableOpacity style={styles.attachmentItem}>
      <Image 
        source={{ uri: item.url_foto }} 
        style={styles.attachmentImage}
        resizeMode="cover"
      />
      <Text style={styles.attachmentName} numberOfLines={1}>
        {item.nombre_archivo || 'Imagen'}
      </Text>
    </TouchableOpacity>
  );

  // Renderizar comentario
  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentAuthor}>
          {item.usuario?.nombre_usuario || item.usuario?.email || 'Usuario'}
        </Text>
        <Text style={styles.commentDate}>
          {formatDate(item.created_at)}
        </Text>
      </View>
      <Text style={styles.commentText}>{item.texto_comentario}</Text>
    </View>
  );

  // Componente de información detallada
  const DetailRow = ({ icon, label, value, valueColor }) => (
    <View style={styles.detailRow}>
      <View style={styles.detailIconContainer}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, valueColor && { color: valueColor }]}>
          {value || 'N/A'}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando detalles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.danger} />
          <Text style={styles.errorTitle}>Error al cargar</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={[globalStyles.button, styles.retryButton]}
            onPress={loadWorkOrderDetails}
          >
            <Text style={globalStyles.buttonText}>Reintentar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[globalStyles.buttonSecondary, styles.backButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={globalStyles.buttonSecondaryText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!workOrder) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={64} color={colors.textMuted} />
          <Text style={styles.errorTitle}>Orden no encontrada</Text>
          <Text style={styles.errorText}>La orden de trabajo no existe o no tienes permisos para verla</Text>
          <TouchableOpacity
            style={[globalStyles.buttonSecondary, styles.backButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={globalStyles.buttonSecondaryText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles de Orden</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Título y Estado */}
        <View style={styles.titleSection}>
          <Text style={styles.workOrderTitle}>{workOrder.titulo}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(workOrder.estados_orden_trabajo?.nombre) }
          ]}>
            <Text style={styles.statusText}>
              {workOrder.estados_orden_trabajo?.nombre || 'Sin estado'}
            </Text>
          </View>
        </View>

        {/* Descripciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.descriptionText}>
            {workOrder.descripcion_corta}
          </Text>
          {workOrder.descripcion_larga && (
            <>
              <Text style={styles.sectionSubtitle}>Descripción Detallada</Text>
              <Text style={styles.descriptionText}>
                {workOrder.descripcion_larga}
              </Text>
            </>
          )}
        </View>

        {/* Información Detallada */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Detallada</Text>
          
          <DetailRow
            icon="flag-outline"
            label="Prioridad"
            value={workOrder.prioridades?.nombre}
            valueColor={getPriorityColor(workOrder.prioridades?.nombre)}
          />
          
          <DetailRow
            icon="construct-outline"
            label="Equipo"
            value={workOrder.equipo ? `${workOrder.equipo.nombre_equipo} (${workOrder.equipo.codigo_equipo})` : null}
          />
          
          <DetailRow
            icon="build-outline"
            label="Tipo de Mantenimiento"
            value={workOrder.tiposmantenimiento?.nombre_tipo}
          />
          
          <DetailRow
            icon="calendar-outline"
            label="Fecha de Creación"
            value={formatDate(workOrder.created_at)}
          />
          
          <DetailRow
            icon="play-outline"
            label="Fecha de Inicio"
            value={formatSimpleDate(workOrder.fecha_inicio)}
          />
          
          <DetailRow
            icon="stop-outline"
            label="Fecha Estimada de Fin"
            value={formatSimpleDate(workOrder.fecha_estimada_fin)}
          />

          {workOrder.fecha_cierre && (
            <DetailRow
              icon="checkmark-outline"
              label="Fecha de Cierre"
              value={formatDate(workOrder.fecha_cierre)}
            />
          )}
        </View>

        {/* Adjuntos */}
        {attachments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Adjuntos ({attachments.length})</Text>
            <FlatList
              data={attachments}
              renderItem={renderAttachment}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.attachmentsList}
            />
          </View>
        )}

        {/* Comentarios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comentarios ({comments.length})</Text>
          
          {/* Lista de comentarios */}
          {comments.length > 0 ? (
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.commentsList}
            />
          ) : (
            <View style={styles.noCommentsContainer}>
              <Text style={styles.noCommentsText}>No hay comentarios aún</Text>
            </View>
          )}

          {/* Agregar nuevo comentario */}
          <View style={styles.addCommentSection}>
            <Text style={styles.addCommentLabel}>Agregar Comentario</Text>
            <TextInput
              style={styles.commentInput}
              value={newCommentText}
              onChangeText={setNewCommentText}
              placeholder="Escribe tu comentario aquí..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              editable={!submittingComment}
            />
            <TouchableOpacity
              style={[
                globalStyles.button,
                styles.submitCommentButton,
                submittingComment && styles.disabledButton
              ]}
              onPress={handleAddComment}
              disabled={submittingComment}
            >
              <Text style={globalStyles.buttonText}>
                {submittingComment ? 'Enviando...' : 'Enviar Comentario'}
              </Text>
              {submittingComment && (
                <ActivityIndicator 
                  color={colors.white} 
                  size="small" 
                  style={styles.buttonLoader} 
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón de Editar */}
        <View style={styles.editButtonContainer}>
          <TouchableOpacity
            style={[globalStyles.button, styles.editButton]}
            onPress={handleEditWorkOrder}
          >
            <Ionicons name="create-outline" size={20} color={colors.white} style={styles.editButtonIcon} />
            <Text style={globalStyles.buttonText}>Editar Orden de Trabajo</Text>
          </TouchableOpacity>
        </View>

        {/* Espaciado inferior */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textMuted,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },

  errorText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },

  retryButton: {
    marginBottom: 10,
  },

  backButton: {
    marginTop: 10,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.white,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },

  headerSpacer: {
    width: 24,
  },

  titleSection: {
    backgroundColor: colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  workOrderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    lineHeight: 26,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },

  statusText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },

  section: {
    backgroundColor: colors.white,
    padding: 20,
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
  },

  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 15,
    marginBottom: 8,
  },

  descriptionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },

  detailIconContainer: {
    width: 40,
    alignItems: 'center',
    paddingTop: 2,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: 2,
  },

  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },

  attachmentsList: {
    paddingVertical: 10,
  },

  attachmentItem: {
    marginRight: 15,
    alignItems: 'center',
  },

  attachmentImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.backgroundLight,
    marginBottom: 5,
  },

  attachmentName: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 100,
  },

  commentsList: {
    marginBottom: 20,
  },

  commentItem: {
    backgroundColor: colors.backgroundLight,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },

  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },

  commentDate: {
    fontSize: 12,
    color: colors.textMuted,
  },

  commentText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 18,
  },

  noCommentsContainer: {
    padding: 20,
    alignItems: 'center',
  },

  noCommentsText: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },

  addCommentSection: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 20,
  },

  addCommentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },

  commentInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 15,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.white,
    textAlignVertical: 'top',
    marginBottom: 15,
    minHeight: 80,
  },

  submitCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonLoader: {
    marginLeft: 10,
  },

  editButtonContainer: {
    padding: 20,
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
  },

  editButtonIcon: {
    marginRight: 8,
  },

  bottomSpacing: {
    height: 30,
  },
});
