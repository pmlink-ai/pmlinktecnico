import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import FormularioDinamico from './FormularioDinamico';

export default function DetalleOrdenScreen({ route, navigation }) {
  const { orden } = route.params;
  const [loading, setLoading] = useState(true);
  const [formularioData, setFormularioData] = useState(null);
  const [tablaCampos, setTablaCampos] = useState([]);
  const [error, setError] = useState(null);
  const [ordenCompleta, setOrdenCompleta] = useState({
    servicio: null,
    local: null,
    empresa: null
  });

  // Función para obtener la cadena: servicio_id → formulario_id → form_key → tabla
  const obtenerFormularioDinamico = async () => {
    try {
      console.log('🔍 Iniciando cadena de consultas para orden:', orden.id);
      console.log('📋 Servicio ID:', orden.servicio_id);

      if (!orden.servicio_id) {
        setError('Esta orden no tiene un servicio asignado');
        setLoading(false);
        return;
      }

      // Paso 1: Obtener formulario_id desde servicios (consulta simple primero)
      console.log('🔗 Paso 1: Obteniendo datos básicos del servicio...');
      const { data: servicioBasic, error: servicioBasicError } = await supabase
        .from('servicios')
        .select('formulario_id, nombre, descripcion, local_id, empresa_id')
        .eq('servicio_id', orden.servicio_id)
        .single();

      if (servicioBasicError) {
        console.error('❌ Error obteniendo servicio:', servicioBasicError);
        throw new Error('No se pudo obtener información del servicio: ' + servicioBasicError.message);
      }

      if (!servicioBasic?.formulario_id) {
        setError('El servicio no tiene un formulario asignado');
        setLoading(false);
        return;
      }

      console.log('✅ Datos básicos del servicio obtenidos:', servicioBasic);

      // Paso 1.1: Obtener información del local si existe local_id
      let localData = null;
      if (servicioBasic.local_id) {
        console.log('🔗 Obteniendo información del local...');
        const { data: local, error: localError } = await supabase
          .from('locales')
          .select('nombre, direccion, empresa_id')
          .eq('id', servicioBasic.local_id)
          .single();
        
        if (!localError && local) {
          localData = local;
          console.log('✅ Información del local obtenida:', local);
        }
      }

      // Paso 1.2: Obtener información de la empresa
      let empresaData = null;
      const empresaId = localData?.empresa_id || servicioBasic.empresa_id;
      
      if (empresaId) {
        console.log('🔗 Obteniendo información de la empresa...');
        const { data: empresa, error: empresaError } = await supabase
          .from('empresas')
          .select('nombre, rut')
          .eq('id', empresaId)
          .single();
        
        if (!empresaError && empresa) {
          empresaData = empresa;
          console.log('✅ Información de la empresa obtenida:', empresa);
        }
      }

      // Guardar información completa del servicio
      setOrdenCompleta(prev => ({
        ...prev,
        servicio: servicioBasic,
        local: localData,
        empresa: empresaData
      }));

      // Paso 2: Obtener form_key desde formularios
      console.log('🔗 Paso 2: Obteniendo form_key desde formularios...');
      const { data: formularioData, error: formularioError } = await supabase
        .from('formularios')
        .select('form_key, nombre, descripcion')
        .eq('id', servicioBasic.formulario_id)
        .single();

      if (formularioError) {
        console.error('❌ Error obteniendo formulario:', formularioError);
        throw new Error('No se pudo obtener información del formulario: ' + formularioError.message);
      }

      if (!formularioData?.form_key) {
        setError('El formulario no tiene una clave de tabla asignada');
        setLoading(false);
        return;
      }

      console.log('✅ Form key obtenido:', formularioData.form_key);
      setFormularioData(formularioData);

      // Paso 3: Obtener estructura de la tabla dinámica
      console.log('🔗 Paso 3: Obteniendo estructura de tabla:', formularioData.form_key);
      await obtenerEstructuraTabla(formularioData.form_key);

    } catch (error) {
      console.error('❌ Error en cadena de consultas:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Función para obtener la estructura de la tabla dinámica
  const obtenerEstructuraTabla = async (nombreTabla) => {
    try {
      // Primero verificamos si la tabla existe haciendo una consulta simple
      const { data: testData, error: testError } = await supabase
        .from(nombreTabla.toLowerCase())
        .select('*')
        .limit(1);

      if (testError) {
        console.error('❌ Error accediendo a tabla:', nombreTabla, testError);
        throw new Error(`La tabla ${nombreTabla} no existe o no es accesible: ${testError.message}`);
      }

      console.log('✅ Tabla accesible:', nombreTabla);

      // Método alternativo: obtener estructura desde los datos de ejemplo
      let columnas = [];
      
      if (testData && testData.length > 0) {
        // Si hay datos, inferir tipos desde el primer registro
        columnas = Object.keys(testData[0]).map(key => {
          const value = testData[0][key];
          let dataType = 'text';
          
          if (typeof value === 'boolean') dataType = 'boolean';
          else if (typeof value === 'number') dataType = 'numeric';
          else if (value && typeof value === 'string' && value.includes('T')) dataType = 'timestamp';
          
          return {
            column_name: key,
            data_type: dataType,
            is_nullable: true
          };
        });
      } else {
        // Si no hay datos, crear estructura básica esperada
        console.log('⚠️ No hay datos en la tabla, usando estructura básica');
        columnas = [
          { column_name: 'id', data_type: 'uuid', is_nullable: false },
          { column_name: 'orden_trabajo_id', data_type: 'uuid', is_nullable: false },
          { column_name: 'created_at', data_type: 'timestamp', is_nullable: false },
          { column_name: 'updated_at', data_type: 'timestamp', is_nullable: false },
          // Campos comunes de formularios
          { column_name: 'observaciones', data_type: 'text', is_nullable: true },
          { column_name: 'resultado', data_type: 'text', is_nullable: true },
          { column_name: 'estado', data_type: 'text', is_nullable: true },
          { column_name: 'tecnico_responsable', data_type: 'text', is_nullable: true },
          { column_name: 'fecha_inspeccion', data_type: 'timestamp', is_nullable: true },
        ];
      }

      console.log('✅ Estructura de tabla obtenida:', columnas);
      setTablaCampos(columnas);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error obteniendo estructura de tabla:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Cargar datos al iniciar
  useEffect(() => {
    obtenerFormularioDinamico();
  }, []);

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Función para obtener color según estado
  const getStatusColor = (estadoObj) => {
    const estado = estadoObj?.nombre?.toLowerCase();
    switch (estado) {
      case 'pendiente': return '#f39c12';
      case 'en progreso': return '#3498db';
      case 'en_progreso': return '#3498db';
      case 'completada': return '#27ae60';
      case 'cancelada': return '#e74c3c';
      case 'asignada': return '#9b59b6';
      default: return '#95a5a6';
    }
  };

  // Función para obtener texto de estado
  const getStatusText = (estadoObj) => {
    const estado = estadoObj?.nombre;
    if (!estado) return 'Sin estado';
    
    switch (estado.toLowerCase()) {
      case 'pendiente': return 'Pendiente';
      case 'en progreso': return 'En Progreso';
      case 'en_progreso': return 'En Progreso';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      case 'asignada': return 'Asignada';
      default: return estado;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Orden</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Cargando formulario...</Text>
          <Text style={styles.loadingSubtext}>
            Obteniendo estructura de formulario dinámico
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>❌ Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              setError(null);
              setLoading(true);
              obtenerFormularioDinamico();
            }}
          >
            <Text style={styles.retryButtonText}>🔄 Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de Orden</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Información de la orden */}
        <View style={styles.ordenInfo}>
          <Text style={styles.sectionTitle}>📋 Información de la Orden de Trabajo</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Número:</Text>
            <Text style={styles.infoValue}>#{orden.id}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Título:</Text>
            <Text style={styles.infoValue}>{orden.titulo || 'Sin título'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Descripción:</Text>
            <Text style={styles.infoValue}>
              {orden.descripcion_corta || orden.descripcion_larga || 'Sin descripción'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha:</Text>
            <Text style={styles.infoValue}>{formatDate(orden.created_at)}</Text>
          </View>

          {/* Información del local */}
          {ordenCompleta.local && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Local:</Text>
                <Text style={styles.infoValue}>{ordenCompleta.local.nombre || 'Sin nombre'}</Text>
              </View>
              
              {ordenCompleta.local.direccion && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Dirección:</Text>
                  <Text style={styles.infoValue}>{ordenCompleta.local.direccion}</Text>
                </View>
              )}
            </>
          )}

          {/* Información de la empresa */}
          {ordenCompleta.empresa && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Empresa:</Text>
                <Text style={styles.infoValue}>{ordenCompleta.empresa.nombre || 'Sin nombre'}</Text>
              </View>
              
              {ordenCompleta.empresa.rut && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>RUT:</Text>
                  <Text style={styles.infoValue}>{ordenCompleta.empresa.rut}</Text>
                </View>
              )}
            </>
          )}

          {/* Estado de la orden */}
          {orden.estados_orden_trabajo && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estado:</Text>
              <View style={styles.estadoContainer}>
                <View style={[styles.estadoBadge, { backgroundColor: getStatusColor(orden.estados_orden_trabajo) }]}>
                  <Text style={styles.estadoText}>{getStatusText(orden.estados_orden_trabajo)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Información adicional si existe */}
          {orden.fecha_inicio && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Inicio:</Text>
              <Text style={styles.infoValue}>{formatDate(orden.fecha_inicio)}</Text>
            </View>
          )}

          {orden.fecha_estimada_fin && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fin Estimado:</Text>
              <Text style={styles.infoValue}>{formatDate(orden.fecha_estimada_fin)}</Text>
            </View>
          )}
        </View>

        {/* Información del formulario */}
        {formularioData && (
          <View style={styles.formularioInfo}>
            <Text style={styles.sectionTitle}>📝 Información del Servicio y Formulario</Text>
            
            {/* Información del servicio */}
            {ordenCompleta.servicio && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Servicio:</Text>
                  <Text style={styles.infoValue}>{ordenCompleta.servicio.nombre || 'Sin nombre'}</Text>
                </View>
                
                {ordenCompleta.servicio.descripcion && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Desc. Servicio:</Text>
                    <Text style={styles.infoValue}>{ordenCompleta.servicio.descripcion}</Text>
                  </View>
                )}
              </>
            )}

            {/* Información del formulario */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Formulario:</Text>
              <Text style={styles.infoValue}>{formularioData.nombre}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tabla BD:</Text>
              <Text style={styles.infoValue}>{formularioData.form_key}</Text>
            </View>
            
            {formularioData.descripcion && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Desc. Form.:</Text>
                <Text style={styles.infoValue}>{formularioData.descripcion}</Text>
              </View>
            )}
          </View>
        )}

        {/* Formulario dinámico */}
        {tablaCampos.length > 0 && formularioData && (
          <FormularioDinamico
            tablaCampos={tablaCampos}
            nombreTabla={formularioData.form_key}
            ordenId={orden.id}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ordenInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formularioInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  estadoContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  estadoBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  estadoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});