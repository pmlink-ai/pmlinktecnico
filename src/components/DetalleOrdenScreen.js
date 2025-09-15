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

      // Paso 1: Obtener formulario_id desde servicios
      console.log('🔗 Paso 1: Obteniendo formulario_id desde servicios...');
      const { data: servicioData, error: servicioError } = await supabase
        .from('servicios')
        .select('formulario_id')
        .eq('servicio_id', orden.servicio_id)
        .single();

      if (servicioError) {
        console.error('❌ Error obteniendo servicio:', servicioError);
        throw new Error('No se pudo obtener información del servicio: ' + servicioError.message);
      }

      if (!servicioData?.formulario_id) {
        setError('El servicio no tiene un formulario asignado');
        setLoading(false);
        return;
      }

      console.log('✅ Formulario ID obtenido:', servicioData.formulario_id);

      // Paso 2: Obtener form_key desde formularios
      console.log('🔗 Paso 2: Obteniendo form_key desde formularios...');
      const { data: formularioData, error: formularioError } = await supabase
        .from('formularios')
        .select('form_key, nombre, descripcion')
        .eq('id', servicioData.formulario_id)
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
          <Text style={styles.sectionTitle}>📋 Información de la Orden</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID:</Text>
            <Text style={styles.infoValue}>#{orden.id.split('-')[0]}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Título:</Text>
            <Text style={styles.infoValue}>{orden.titulo}</Text>
          </View>
          {orden.descripcion_corta && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Descripción:</Text>
              <Text style={styles.infoValue}>{orden.descripcion_corta}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Creada:</Text>
            <Text style={styles.infoValue}>{formatDate(orden.created_at)}</Text>
          </View>
        </View>

        {/* Información del formulario */}
        {formularioData && (
          <View style={styles.formularioInfo}>
            <Text style={styles.sectionTitle}>📝 Formulario Dinámico</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre:</Text>
              <Text style={styles.infoValue}>{formularioData.nombre}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tabla:</Text>
              <Text style={styles.infoValue}>{formularioData.form_key}</Text>
            </View>
            {formularioData.descripcion && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Descripción:</Text>
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
});