import React, { useState, useEffect, useRef } from 'react';
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  Image,
  FlatList,
  Dimensions
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

// Configuración de Supabase
const supabaseUrl = 'https://mwtdoidrjuahsejfctlm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13dGRvaWRyanVhaHNlamZjdGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNDQsImV4cCI6MjA2NjEzMzM0NH0.QtKVhvZiY-ehpJlRMusUsjS6V7ZbyHtpMnvr60x9xEM';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

const Stack = createStackNavigator();

// ================== COMPONENTE IMAGE UPLOADER ==================
const ImageUploader = ({ orderId, informeTabla }) => {
  // Configuración de componentes por servicio
  const componentesPorServicio = {
    'informe_limpieza_ductos': [
      { key: 'Campana_1', title: 'Campana 1', icon: '🏭' },
      { key: 'Campana_2', title: 'Campana 2', icon: '🏭' },
      { key: 'Ductos_y_Registros', title: 'Ductos y Registros', icon: '🔧' },
      { key: 'Motores_y_Cubierta', title: 'Motores y Cubierta', icon: '⚙️' },
      { key: 'Panoramica_y_Sector', title: 'Panorámica y/o Sector', icon: '📷' },
      { key: 'Recibo_Conforme', title: 'Recibo Conforme', icon: '✅' }
    ],
    'informe_mantenimiento_motor': [
      { key: 'Motor_Principal', title: 'Motor Principal', icon: '⚙️' },
      { key: 'Sistema_Electrico', title: 'Sistema Eléctrico', icon: '⚡' },
      { key: 'Rodamientos', title: 'Rodamientos', icon: '🔩' }
    ],
    // Agregar más servicios según necesidad
    'default': [
      { key: 'General', title: 'General', icon: '📋' }
    ]
  };

  // Estado jerárquico: componente → sección → fotos
  const [imagesByComponenteAndSeccion, setImagesByComponenteAndSeccion] = useState({});
  const [uploading, setUploading] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedComponents, setExpandedComponents] = useState({});

  const secciones = [
    { key: 'ANTES', title: 'ANTES', color: '#FF6B6B' },
    { key: 'PROCESO', title: 'PROCESO', color: '#4ECDC4' },
    { key: 'DESPUES', title: 'DESPUÉS', color: '#45B7D1' }
  ];

  // Obtener componentes para el servicio actual
  const getComponentesActuales = () => {
    const tablaKey = informeTabla?.toLowerCase() || 'default';
    return componentesPorServicio[tablaKey] || componentesPorServicio.default;
  };

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('informe_fotografias')
        .select('*')
        .eq('orden_trabajo_id', orderId)
        .eq('informe_tabla', informeTabla)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error cargando imágenes:', error);
        Alert.alert('Error', 'No se pudieron cargar las imágenes');
        return;
      }

      // Organizar imágenes por componente y sección
      const componentesActuales = getComponentesActuales();
      const organizedImages = {};

      // Inicializar estructura
      componentesActuales.forEach(componente => {
        organizedImages[componente.key] = {
          ANTES: [],
          PROCESO: [],
          DESPUES: []
        };
      });

      // Organizar fotos existentes
      (data || []).forEach(image => {
        const seccion = image.seccion || 'ANTES';
        const componente = image.componente || 'General';
        
        // Si el componente existe en la configuración actual
        if (organizedImages[componente]) {
          organizedImages[componente][seccion]?.push(image);
        } else {
          // Para compatibilidad, asignar a 'General' o al primer componente
          const firstComponent = componentesActuales[0]?.key || 'General';
          if (organizedImages[firstComponent]) {
            organizedImages[firstComponent][seccion]?.push(image);
          }
        }
      });

      setImagesByComponenteAndSeccion(organizedImages);
      
      // Expandir automáticamente componentes que tienen fotos
      const newExpandedState = {};
      Object.keys(organizedImages).forEach(componenteKey => {
        const hasImages = secciones.some(seccion => 
          organizedImages[componenteKey][seccion.key]?.length > 0
        );
        newExpandedState[componenteKey] = hasImages;
      });
      setExpandedComponents(newExpandedState);

    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Error inesperado al cargar imágenes');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (componente, seccion) => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesitan permisos para acceder a la galería');
        return;
      }

      // Mostrar opciones de fuente de imagen
      Alert.alert(
        `Foto ${seccion} - ${componente}`,
        'Elige una opción',
        [
          { text: 'Cámara', onPress: () => openCamera(componente, seccion) },
          { text: 'Galería', onPress: () => openGallery(componente, seccion) },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      Alert.alert('Error', 'Error al solicitar permisos');
    }
  };

  const openCamera = async (componente, seccion) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesitan permisos para usar la cámara');
        return;
      }

      // Configurar estado de carga
      setUploading(prev => ({ ...prev, [`${componente}_${seccion}`]: true }));

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        uploadImage(result.assets[0], componente, seccion);
      } else {
        setUploading(prev => ({ ...prev, [`${componente}_${seccion}`]: false }));
      }
    } catch (error) {
      console.error('Error abriendo cámara:', error);
      Alert.alert('Error', 'Error al abrir la cámara');
      setUploading(prev => ({ ...prev, [`${componente}_${seccion}`]: false }));
    }
  };

  const openGallery = async (componente, seccion) => {
    try {
      // Configurar estado de carga
      setUploading(prev => ({ ...prev, [`${componente}_${seccion}`]: true }));

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        uploadImage(result.assets[0], componente, seccion);
      } else {
        setUploading(prev => ({ ...prev, [`${componente}_${seccion}`]: false }));
      }
    } catch (error) {
      console.error('Error abriendo galería:', error);
      Alert.alert('Error', 'Error al abrir la galería');
      setUploading(prev => ({ ...prev, [`${componente}_${seccion}`]: false }));
    }
  };

  const uploadImage = async (asset, componente, seccion) => {
    try {
      // Generar nombre único
      const fileExtension = asset.uri.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const filePath = `public/${orderId}/${informeTabla}/${componente}/${seccion}/${fileName}`;

      // Crear FormData
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: fileName,
      });

      // Subir a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('fotos_informes')
        .upload(filePath, formData, {
          contentType: asset.type || 'image/jpeg',
          upsert: false
        });

      if (uploadError) {
        console.error('Error subiendo imagen:', uploadError);
        Alert.alert('Error', 'No se pudo subir la imagen');
        return;
      }

      // Crear etiqueta descriptiva
      const componenteTitle = getComponentesActuales().find(c => c.key === componente)?.title || componente;
      const etiqueta = `${seccion} - ${componenteTitle}`;

      // Guardar referencia en base de datos
      const { error: dbError } = await supabase
        .from('informe_fotografias')
        .insert({
          orden_trabajo_id: orderId,
          informe_tabla: informeTabla,
          storage_path: filePath,
          seccion: seccion,
          etiqueta: etiqueta,
          componente: componente
        });

      if (dbError) {
        console.error('Error guardando en BD:', dbError);
        Alert.alert('Error', 'Imagen subida pero no se pudo guardar la referencia');
        return;
      }

      Alert.alert('Éxito', `Imagen agregada: ${componenteTitle} - ${seccion}`);
      loadImages(); // Recargar lista

    } catch (error) {
      console.error('Error general:', error);
      Alert.alert('Error', 'Error inesperado al subir la imagen');
    } finally {
      setUploading(prev => ({ ...prev, [`${componente}_${seccion}`]: false }));
    }
  };

  const deleteImage = async (imageId, storagePath) => {
    Alert.alert(
      'Eliminar Imagen',
      '¿Estás seguro de que quieres eliminar esta imagen?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Eliminar de Storage
              await supabase.storage
                .from('fotos_informes')
                .remove([storagePath]);

              // Eliminar de BD
              const { error } = await supabase
                .from('informe_fotografias')
                .delete()
                .eq('id', imageId);

              if (error) {
                console.error('Error eliminando:', error);
                Alert.alert('Error', 'No se pudo eliminar la imagen');
                return;
              }

              Alert.alert('Éxito', 'Imagen eliminada correctamente');
              loadImages();
            } catch (error) {
              console.error('Error:', error);
              Alert.alert('Error', 'Error inesperado al eliminar');
            }
          }
        }
      ]
    );
  };

  const getImageUrl = (storagePath) => {
    const { data } = supabase.storage
      .from('fotos_informes')
      .getPublicUrl(storagePath);
    return data?.publicUrl;
  };

  const renderImage = ({ item }) => (
    <TouchableOpacity 
      style={styles.imageContainer}
      onLongPress={() => deleteImage(item.id, item.storage_path)}
    >
      <Image 
        source={{ uri: getImageUrl(item.storage_path) }}
        style={styles.uploadedImage}
        resizeMode="cover"
      />
      <Text style={styles.imageLabel}>{item.etiqueta}</Text>
    </TouchableOpacity>
  );

  const renderSeccionInComponent = (seccionData, componenteKey) => {
    const images = imagesByComponenteAndSeccion[componenteKey]?.[seccionData.key] || [];
    const uploadingKey = `${componenteKey}_${seccionData.key}`;
    const isUploading = uploading[uploadingKey];

    return (
      <View key={seccionData.key} style={styles.componentSection}>
        <View style={[styles.sectionHeader, { backgroundColor: seccionData.color }]}>
          <Text style={styles.sectionTitle}>{seccionData.title}</Text>
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
          style={[styles.addSectionPhotoButton, { borderColor: seccionData.color }]}
          onPress={() => pickImage(componenteKey, seccionData.key)}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color={seccionData.color} />
          ) : (
            <>
              <Text style={[styles.addPhotoIcon, { color: seccionData.color }]}>📷</Text>
              <Text style={[styles.addSectionPhotoText, { color: seccionData.color }]}>
                Añadir Foto {seccionData.title}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const toggleComponent = (componenteKey) => {
    setExpandedComponents(prev => ({
      ...prev,
      [componenteKey]: !prev[componenteKey]
    }));
  };

  const renderReciboConformeSection = (componenteKey) => {
    // Para Recibo Conforme, solo usamos la sección 'ANTES' como sección única
    const seccionUnica = 'ANTES';
    const images = imagesByComponenteAndSeccion[componenteKey]?.[seccionUnica] || [];
    const uploadingKey = `${componenteKey}_${seccionUnica}`;
    const isUploading = uploading[uploadingKey];

    return (
      <View style={styles.componentSection}>
        <View style={[styles.sectionHeader, { backgroundColor: '#28A745' }]}>
          <Text style={styles.sectionTitle}>FOTOGRAFÍA DE CONFORMIDAD</Text>
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
          style={[styles.addSectionPhotoButton, { borderColor: '#28A745' }]}
          onPress={() => pickImage(componenteKey, seccionUnica)}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#28A745" />
          ) : (
            <>
              <Text style={[styles.addPhotoIcon, { color: '#28A745' }]}>📷</Text>
              <Text style={[styles.addSectionPhotoText, { color: '#28A745' }]}>
                Tomar Fotografía de Conformidad
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderComponent = (componenteData) => {
    const isExpanded = expandedComponents[componenteData.key];
    const totalImages = secciones.reduce((total, seccion) => {
      return total + (imagesByComponenteAndSeccion[componenteData.key]?.[seccion.key]?.length || 0);
    }, 0);

    // Renderizado especial para "Recibo Conforme" - solo una opción de foto
    if (componenteData.key === 'Recibo_Conforme') {
      return (
        <View key={componenteData.key} style={styles.componentContainer}>
          <TouchableOpacity 
            style={styles.componentHeader}
            onPress={() => toggleComponent(componenteData.key)}
          >
            <View style={styles.componentHeaderLeft}>
              <Text style={styles.componentIcon}>{componenteData.icon}</Text>
              <Text style={styles.componentTitle}>{componenteData.title}</Text>
              {totalImages > 0 && (
                <Text style={styles.componentCount}>({totalImages} fotos)</Text>
              )}
            </View>
            <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
          </TouchableOpacity>
          
          {isExpanded && (
            <View style={styles.componentContent}>
              {renderReciboConformeSection(componenteData.key)}
            </View>
          )}
        </View>
      );
    }

    // Renderizado normal para otros componentes
    return (
      <View key={componenteData.key} style={styles.componentContainer}>
        <TouchableOpacity 
          style={styles.componentHeader}
          onPress={() => toggleComponent(componenteData.key)}
        >
          <View style={styles.componentHeaderLeft}>
            <Text style={styles.componentIcon}>{componenteData.icon}</Text>
            <Text style={styles.componentTitle}>{componenteData.title}</Text>
            {totalImages > 0 && (
              <Text style={styles.componentCount}>({totalImages} fotos)</Text>
            )}
          </View>
          <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.componentContent}>
            {secciones.map(seccion => renderSeccionInComponent(seccion, componenteData.key))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.imageUploaderContainer}>
      <Text style={styles.imageUploaderTitle}>📸 Fotografías del Informe</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <View style={styles.sectionsContainer}>
          {getComponentesActuales().map(renderComponent)}
          
          <Text style={styles.imageHelperText}>
            Mantén presionada una imagen para eliminarla
          </Text>
        </View>
      )}
    </View>
  );
};

// ================== LOGIN SCREEN ==================
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('admin@pmlink.com');
  const [password, setPassword] = useState('admin123456');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        Alert.alert('Error de autenticación', error.message);
        return;
      }

      if (data?.user) {
        navigation.replace('Home');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.loginContainer}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('./assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>PMLink Técnico</Text>
        <Text style={styles.subtitle}>Sistema de Órdenes de Trabajo</Text>

        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="admin@pmlink.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Contraseña</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="admin123456"
            secureTextEntry
          />

          <TouchableOpacity 
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ================== HOME SCREEN ==================
const HomeScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log('🔍 Obteniendo órdenes de trabajo...');
      
      const { data, error } = await supabase
        .from('orden_trabajo')
        .select(`
          *,
          estados_orden_trabajo(nombre),
          prioridades(nombre),
          informe_limpieza_ductos(id)
        `)
        .eq('activa', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error cargando órdenes:', error);
        Alert.alert('Error', 'No se pudieron cargar las órdenes de trabajo');
        return;
      }

      console.log('✅ Órdenes obtenidas:', data?.length || 0);
      setOrders(data || []);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estadoId) => {
    switch (estadoId) {
      case 1: return '#FFA500'; // Pendiente
      case 2: return '#007AFF'; // En Progreso  
      case 3: return '#28A745'; // Completada
      case 4: return '#DC3545'; // Cancelada
      default: return '#6C757D';
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.replace('Login');
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.orderCard,
        item.informe_limpieza_ductos?.length > 0 && styles.orderCardWithReport
      ]}
      onPress={() => navigation.navigate('OrderDetail', { order: item })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>#{item.id.substring(0, 8)}</Text>
        <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado_id) }]}>
          <Text style={styles.estadoText}>
            {item.estados_orden_trabajo?.nombre || 'Sin estado'}
          </Text>
        </View>
        {item.informe_limpieza_ductos?.length > 0 && (
          <View style={styles.reportBadge}>
            <Text style={styles.reportBadgeText}>✅</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.orderTitle}>{item.titulo}</Text>
      <Text style={styles.orderDescription} numberOfLines={2}>
        {item.descripcion_corta}
      </Text>
      
      {item.informe_limpieza_ductos?.length > 0 && (
        <Text style={styles.reportIndicator}>📋 Informe completado</Text>
      )}
      
      <View style={styles.orderFooter}>
        <Text style={styles.orderDate}>
          📅 {new Date(item.created_at).toLocaleDateString()}
        </Text>
        {item.prioridades?.nombre && (
          <Text style={styles.orderPriority}>
            ⚡ {item.prioridades.nombre}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando órdenes...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Órdenes de Trabajo</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {orders.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No hay órdenes de trabajo</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={loadOrders}
          contentContainerStyle={styles.ordersList}
        />
      )}
    </SafeAreaView>
  );
};

// ================== ORDER DETAIL SCREEN ==================
const OrderDetailScreen = ({ route, navigation }) => {
  const { order } = route.params;
  const [servicioInfo, setServicioInfo] = useState(null);
  const [localInfo, setLocalInfo] = useState(null);
  const [empresaInfo, setEmpresaInfo] = useState(null);
  const [formularioInfo, setFormularioInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);

  useEffect(() => {
    loadOrderDetails();
  }, []);

  const loadOrderDetails = async () => {
    try {
      console.log('🔍 Iniciando cadena de consultas para orden:', order.id);
      console.log('📋 Servicio ID:', order.servicio_id);

      if (!order.servicio_id) {
        setLoading(false);
        return;
      }

      // Paso 1: Obtener local_id desde servicios
      console.log('🔗 Paso 1: Obteniendo local_id desde servicios...');
      const { data: servicioData, error: servicioError } = await supabase
        .from('servicios')
        .select('formulario_id, local_id')
        .eq('servicio_id', order.servicio_id)
        .single();

      if (servicioError) {
        console.error('❌ Error obteniendo servicio:', servicioError);
        setLoading(false);
        return;
      }

      console.log('✅ Datos del servicio obtenidos:', servicioData);
      setServicioInfo(servicioData);

      // Obtener información del local
      if (servicioData?.local_id) {
        console.log('🔗 Obteniendo información del local...');
        const { data: localData, error: localError } = await supabase
          .from('local')
          .select('nombre_local, empresa_id')
          .eq('local_id', servicioData.local_id)
          .single();

        if (localError) {
          console.error('❌ Error obteniendo local:', localError);
        } else {
          console.log('✅ Información del local obtenida:', localData);
          setLocalInfo(localData);

          // Obtener información de la empresa
          if (localData?.empresa_id) {
            console.log('🔗 Obteniendo información de la empresa...');
            const { data: empresaData, error: empresaError } = await supabase
              .from('empresa')
              .select('nombre_empresa')
              .eq('empresa_id', localData.empresa_id)
              .single();

            if (empresaError) {
              console.error('❌ Error obteniendo empresa:', empresaError);
            } else {
              console.log('✅ Información de la empresa obtenida:', empresaData);
              setEmpresaInfo(empresaData);
            }
          }
        }
      }

      // Paso 2: Obtener form_key desde formularios
      if (servicioData?.formulario_id) {
        console.log('🔗 Paso 2: Obteniendo form_key desde formularios...');
        const { data: formularioData, error: formularioError } = await supabase
          .from('formularios')
          .select('form_key, nombre, descripcion')
          .eq('id', servicioData.formulario_id)
          .single();

        if (formularioError) {
          console.error('❌ Error obteniendo formulario:', formularioError);
        } else {
          console.log('✅ Form key obtenido:', formularioData.form_key);
          setFormularioInfo(formularioData);
        }
      }
    } catch (error) {
      console.error('❌ Error cargando detalles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFormComponent = () => {
    if (!formularioInfo?.form_key) return null;

    const formKey = formularioInfo.form_key.toLowerCase();
    
    if (formKey.includes('limpieza_ductos')) {
      return <FormularioDinamico order={order} onClose={() => setShowFormModal(false)} />;
    }
    
    return (
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Formulario: {formularioInfo.nombre}</Text>
        <Text style={styles.formDescription}>
          Form Key: {formularioInfo.form_key}
        </Text>
        <Text style={styles.infoText}>
          Este formulario aún no está implementado
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setShowFormModal(false)}
        >
          <Text style={styles.buttonText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando detalles...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>📋 Información de la Orden</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ID Orden:</Text>
            <Text style={styles.detailValue}>{order.id}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Número:</Text>
            <Text style={styles.detailValue}>
              {order.numero || `#${order.id.substring(0, 8)}`}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Título:</Text>
            <Text style={styles.detailValue}>{order.titulo}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Descripción:</Text>
            <Text style={styles.detailValue}>
              {order.descripcion_corta}
              {order.descripcion_larga && ` ${order.descripcion_larga}`}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha:</Text>
            <Text style={styles.detailValue}>
              {new Date(order.created_at).toLocaleString()}
            </Text>
          </View>

          {empresaInfo && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Empresa:</Text>
              <Text style={styles.detailValue}>{empresaInfo.nombre_empresa}</Text>
            </View>
          )}

          {localInfo && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Local:</Text>
              <Text style={styles.detailValue}>{localInfo.nombre_local}</Text>
            </View>
          )}
        </View>

        {servicioInfo && (
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>🔧 Información del Servicio</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Servicio ID:</Text>
              <Text style={styles.detailValue}>{order.servicio_id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Local ID:</Text>
              <Text style={styles.detailValue}>{servicioInfo.local_id || 'No asignado'}</Text>
            </View>
          </View>
        )}

        {formularioInfo && (
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>📝 Formulario Asignado</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Formulario:</Text>
              <Text style={styles.detailValue}>{formularioInfo.nombre}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tipo:</Text>
              <Text style={styles.detailValue}>{formularioInfo.form_key}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.button}
              onPress={() => setShowFormModal(true)}
            >
              <Text style={styles.buttonText}>Abrir Formulario</Text>
            </TouchableOpacity>
          </View>
        )}

        {!servicioInfo && (
          <View style={styles.detailCard}>
            <Text style={styles.infoText}>
              Esta orden no tiene un servicio asignado o no se pudo cargar la información.
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showFormModal}
        animationType="slide"
        presentationStyle="formSheet"
      >
        {getFormComponent()}
      </Modal>
    </SafeAreaView>
  );
};

// ================== FORMULARIO DINÁMICO ==================
const FormularioDinamico = ({ order, onClose }) => {
  const [campos, setCampos] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tableName, setTableName] = useState('');
  const [existingRecord, setExistingRecord] = useState(null);

  useEffect(() => {
    cargarEstructuraFormulario();
  }, []);

  // Debug useEffect para monitorear cambios en formData
  useEffect(() => {
    console.log('📊 FormData actualizado:', formData);
    if (formData.cantidad_de_motores !== undefined) {
      console.log('🔍 cantidad_de_motores en formData:', formData.cantidad_de_motores);
    }
  }, [formData]);

  const cargarEstructuraFormulario = async () => {
    try {
      console.log('🔗 Paso 1: Obteniendo información de la orden y servicio');
      console.log('🔍 Orden recibida:', order.id);

      // Paso 1: Obtener el servicio_id de la orden de trabajo
      console.log('📋 Consultando orden_trabajo para ID:', order.id);
      const { data: ordenData, error: ordenError } = await supabase
        .from('orden_trabajo')
        .select('servicio_id')
        .eq('id', order.id)
        .single();

      console.log('📋 Datos de orden obtenidos:', ordenData);
      console.log('❌ Error de orden:', ordenError);

      if (ordenError || !ordenData?.servicio_id) {
        console.error('❌ Error obteniendo servicio de la orden:', ordenError);
        Alert.alert('Error', `No se pudo obtener el servicio de la orden: ${ordenError?.message || 'Servicio ID no encontrado'}`);
        setLoading(false);
        return;
      }

      console.log('✅ Servicio ID obtenido:', ordenData.servicio_id);

      // Paso 2: Obtener el formulario_id desde la tabla servicios
      console.log('🔍 Buscando formulario para servicio:', ordenData.servicio_id);
      
      const { data: servicioData, error: servicioError } = await supabase
        .from('servicios')
        .select('formulario_id, nombre_servicio')
        .eq('servicio_id', ordenData.servicio_id)
        .single();

      console.log('📋 Respuesta de servicios:', servicioData);
      console.log('❌ Error de servicios:', servicioError);

      if (servicioError) {
        console.error('❌ Error obteniendo formulario del servicio:', servicioError);
        Alert.alert('Error', `Error consultando servicio: ${servicioError.message}`);
        setLoading(false);
        return;
      }

      if (!servicioData) {
        console.error('❌ No se encontró el servicio:', ordenData.servicio_id);
        Alert.alert('Error', `No se encontró el servicio con ID: ${ordenData.servicio_id}`);
        setLoading(false);
        return;
      }

      if (!servicioData.formulario_id) {
        console.error('❌ El servicio no tiene formulario_id configurado');
        Alert.alert('Error', `El servicio "${servicioData.nombre_servicio}" no tiene formulario configurado`);
        setLoading(false);
        return;
      }

      console.log('✅ Formulario ID obtenido:', servicioData.formulario_id);

      // Paso 3: Obtener el form_key desde la tabla formularios
      console.log('🔍 Buscando form_key para formulario:', servicioData.formulario_id);
      
      const { data: formularioData, error: formularioError } = await supabase
        .from('formularios')
        .select('form_key, nombre')
        .eq('id', servicioData.formulario_id)
        .single();

      console.log('📋 Respuesta de formularios:', formularioData);
      console.log('❌ Error de formularios:', formularioError);

      if (formularioError) {
        console.error('❌ Error obteniendo form_key:', formularioError);
        Alert.alert('Error', `Error consultando formulario: ${formularioError.message}`);
        setLoading(false);
        return;
      }

      if (!formularioData?.form_key) {
        console.error('❌ No se encontró form_key en el formulario');
        Alert.alert('Error', `El formulario no tiene form_key configurado`);
        setLoading(false);
        return;
      }

      console.log('✅ Form Key obtenido:', formularioData.form_key);

      // Paso 4: Usar el form_key como nombre de tabla
      const tableNameQuery = formularioData.form_key.toUpperCase();
      const tableNameLower = formularioData.form_key.toLowerCase();
      
      setTableName(tableNameLower);

      console.log('🔍 Verificando acceso a tabla:', tableNameLower);
      console.log('🔍 Query de tabla en mayúsculas:', tableNameQuery);

      // Verificar si la tabla es accesible
      const { data: testData, error: testError } = await supabase
        .from(tableNameLower)
        .select('*')
        .limit(1);

      if (testError) {
        console.error('❌ Error accediendo a la tabla:', testError);
        Alert.alert('Error', `No se pudo acceder a la tabla ${tableNameLower}: ${testError.message}`);
        setLoading(false);
        return;
      }

      console.log('✅ Tabla accesible:', tableNameQuery);

      // Obtener estructura de la tabla
      console.log('🔍 Llamando a get_table_structure con:', tableNameQuery);
      const { data: estructura, error: estructuraError } = await supabase
        .rpc('get_table_structure', { input_table_name: tableNameQuery });

      if (estructuraError) {
        console.error('❌ Error obteniendo estructura:', estructuraError);
        Alert.alert('Error', `No se pudo obtener la estructura del formulario: ${estructuraError.message}`);
        setLoading(false);
        return;
      }

      console.log('✅ Estructura de tabla obtenida:', estructura);
      console.log('📊 Número de campos encontrados:', estructura?.length || 0);

      if (!estructura || estructura.length === 0) {
        console.error('❌ No se encontraron campos en la tabla');
        Alert.alert('Error', `La tabla ${tableNameLower} no tiene campos configurados`);
        setLoading(false);
        return;
      }

      // Filtrar campos que no queremos mostrar
      const camposExcluidos = ['id', 'created_at', 'updated_at', 'orden_trabajo_id'];
      const camposFiltrados = estructura.filter(campo => 
        !camposExcluidos.includes(campo.column_name.toLowerCase())
      );

      console.log('📋 Campos filtrados:', camposFiltrados);
      console.log('📈 Número de campos después del filtro:', camposFiltrados.length);

      setCampos(camposFiltrados);

      // Inicializar formData básico
      const initialData = { orden_trabajo_id: order.id };
      camposFiltrados.forEach(campo => {
        // Inicializar según el tipo de dato
        if (campo.data_type === 'integer' || campo.data_type === 'numeric' || campo.data_type === 'bigint') {
          initialData[campo.column_name] = '';  // Mantener como string vacío para el input
        } else {
          initialData[campo.column_name] = '';
        }
        
        // Debug específico para cantidad_de_motores
        if (campo.column_name === 'cantidad_de_motores') {
          console.log('🔍 Inicializando cantidad_de_motores:');
          console.log('  - Nombre del campo:', campo.column_name);
          console.log('  - Tipo de dato:', campo.data_type);
          console.log('  - Valor inicial asignado:', initialData[campo.column_name]);
        }
      });
      
      console.log('💾 FormData inicial básico:', initialData);

      // Buscar datos existentes DESPUÉS de configurar tableName
      console.log('� Buscando datos existentes en tabla:', tableNameLower);
      
      const { data: existingData, error: existingError } = await supabase
        .from(tableNameLower)
        .select('*')
        .eq('orden_trabajo_id', order.id)
        .single();

      if (existingData && !existingError) {
        console.log('✅ Datos existentes encontrados:', existingData);
        console.log('🔍 Valor de cantidad_de_motores:', existingData.cantidad_de_motores);
        
        // Procesar datos existentes para manejar valores null/undefined
        const processedData = {};
        Object.keys(existingData).forEach(key => {
          processedData[key] = existingData[key] === null || existingData[key] === undefined 
            ? '' 
            : String(existingData[key]);
        });
        
        console.log('🔍 Datos procesados:', processedData);
        console.log('🔍 cantidad_de_motores procesado:', processedData.cantidad_de_motores);
        
        setExistingRecord(existingData);
        setFormData(processedData);
      } else {
        console.log('ℹ️ No se encontraron datos existentes, usando datos iniciales');
        console.log('🔍 FormData inicial:', initialData);
        setFormData(initialData);
      }

    } catch (error) {
      console.error('❌ Error general:', error);
      Alert.alert('Error', `Error inesperado al cargar el formulario: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const buscarDatosExistentes = async () => {
    try {
      if (!tableName) {
        console.log('ℹ️ No hay tabla definida aún');
        return;
      }

      console.log('🔍 Buscando datos existentes en tabla:', tableName);
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('orden_trabajo_id', order.id)
        .single();

      if (data) {
        console.log('✅ Datos existentes encontrados:', data);
        setExistingRecord(data);
        setFormData(data);
      } else {
        console.log('ℹ️ No se encontraron datos existentes');
      }
    } catch (error) {
      console.log('ℹ️ No hay datos existentes para esta orden');
    }
  };

  const handleInputChange = (fieldName, value) => {
    // Debug para cantidad_de_motores
    if (fieldName === 'cantidad_de_motores') {
      console.log('🔍 handleInputChange para cantidad_de_motores:');
      console.log('  - Campo:', fieldName);
      console.log('  - Valor recibido:', value);
    }

    // Para campos numéricos, mantener el valor original sin convertir a mayúsculas
    const isNumericField = fieldName === 'cantidad_de_motores' || 
                          fieldName.includes('cantidad') || 
                          fieldName.includes('numero');
    
    const finalValue = isNumericField ? value : value.toUpperCase();
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: finalValue
    }));

    // Debug adicional
    if (fieldName === 'cantidad_de_motores') {
      console.log('  - Valor final guardado:', finalValue);
    }
  };

  const formatFieldName = (fieldName) => {
    // Mapeo de nombres específicos para campos del formulario
    const fieldNameMappings = {
      'campanas_estado': 'CAMPANAS',
      'filtros_estado': 'FILTROS', 
      'ductos_estado': 'DUCTOS',
      'damper_estado': 'DAMPER',
      'drenajes_estado': 'DRENAJES',
      'registros_local_estado': 'REGISTROS LOCAL',
      'registros_techumbre_estado': 'REGISTROS TECHUMBRE',
      'rejillas_en_el_motor': 'REJILLAS EN EL MOTOR',
      'cantidad_de_motores': 'CANTIDAD DE MOTORES',
      'fuelle': 'FUELLE',
      'correas': 'CORREAS',
      'rodamientos': 'RODAMIENTOS',
      'observaciones': 'OBSERVACIONES',
      'orden_trabajo_id': 'ORDEN DE TRABAJO'
    };

    // Si existe un mapeo específico, usarlo
    if (fieldNameMappings[fieldName]) {
      return fieldNameMappings[fieldName];
    }

    // Si no, usar el formato estándar
    return fieldName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const isRequired = (fieldName) => {
    const requiredFields = ['orden_trabajo_id'];
    return requiredFields.includes(fieldName);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      if (!tableName) {
        Alert.alert('Error', 'No se ha configurado la tabla del formulario');
        return;
      }

      // Validar campos requeridos
      const missingFields = campos
        .filter(campo => isRequired(campo.column_name) && !formData[campo.column_name])
        .map(campo => formatFieldName(campo.column_name));

      if (missingFields.length > 0) {
        Alert.alert('Campos Requeridos', `Por favor completa: ${missingFields.join(', ')}`);
        return;
      }

      console.log('💾 Guardando en tabla:', tableName);
      console.log('📝 Datos a guardar:', formData);

      let result;
      if (existingRecord) {
        // Actualizar registro existente
        result = await supabase
          .from(tableName)
          .update(formData)
          .eq('id', existingRecord.id);
      } else {
        // Crear nuevo registro
        result = await supabase
          .from(tableName)
          .insert([formData])
          .select();
      }

      if (result.error) {
        console.error('❌ Error guardando:', result.error);
        Alert.alert('Error', 'No se pudo guardar el formulario');
        return;
      }

      console.log('✅ Formulario guardado exitosamente');
      
      // Si es un nuevo registro, necesitamos obtener el ID del registro creado
      if (!existingRecord && result.data && result.data.length > 0) {
        const newRecord = result.data[0];
        console.log('✅ Nuevo registro creado:', newRecord);
        setExistingRecord(newRecord);
        setFormData(newRecord);
      }
      
      Alert.alert(
        'Éxito', 
        existingRecord ? 'Formulario actualizado correctamente' : 'Formulario guardado correctamente',
        [{ 
          text: 'Continuar editando', 
          style: 'default'
        }, {
          text: 'Cerrar', 
          onPress: onClose 
        }]
      );

    } catch (error) {
      console.error('❌ Error general al guardar:', error);
      Alert.alert('Error', 'Error inesperado al guardar');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (campo) => {
    const fieldName = campo.column_name;
    const fieldValue = formData[fieldName] || '';

    // Debug específico para cantidad_de_motores
    if (fieldName === 'cantidad_de_motores') {
      console.log('🔍 Renderizando cantidad_de_motores:');
      console.log('  - Campo:', fieldName);
      console.log('  - Valor en formData:', formData[fieldName]);
      console.log('  - Valor final:', fieldValue);
      console.log('  - FormData completo:', formData);
    }

    if (fieldName === 'orden_trabajo_id') {
      return (
        <View key={fieldName} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {formatFieldName(fieldName)} {isRequired(fieldName) && '*'}
          </Text>
          <TextInput
            style={[styles.input, styles.readOnlyInput]}
            value={fieldValue}
            editable={false}
          />
        </View>
      );
    }

    return (
      <View key={fieldName} style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          {formatFieldName(fieldName)} {isRequired(fieldName) && '*'}
        </Text>
        <TextInput
          style={campo.data_type === 'text' ? styles.textArea : styles.input}
          value={String(fieldValue)} // Asegurar que siempre sea string para el TextInput
          onChangeText={(value) => handleInputChange(fieldName, value)}
          placeholder={`Ingresa ${formatFieldName(fieldName).toLowerCase()}`}
          multiline={campo.data_type === 'text'}
          numberOfLines={campo.data_type === 'text' ? 3 : 1}
          keyboardType={
            (campo.data_type === 'integer' || campo.data_type === 'numeric' || campo.data_type === 'bigint') 
              ? 'numeric' 
              : 'default'
          }
          autoCapitalize={
            (campo.data_type === 'integer' || campo.data_type === 'numeric' || campo.data_type === 'bigint') 
              ? 'none' 
              : 'characters'
          }
          autoCorrect={false}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando formulario...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formHeader}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕ Cerrar</Text>
        </TouchableOpacity>
        <Text style={styles.formHeaderTitle}>
          Formulario {tableName.replace(/_/g, ' ').toUpperCase()}
        </Text>
      </View>

      <ScrollView style={styles.formScrollView}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>📋 Información del Formulario</Text>
          
          {/* Mostrar ID del registro si existe */}
          {existingRecord && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID del Registro:</Text>
              <Text style={styles.infoValue}>{existingRecord.id}</Text>
            </View>
          )}
          
          {/* Mostrar ID de la orden */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID de la Orden:</Text>
            <Text style={styles.infoValue}>{order.id}</Text>
          </View>
          
          {/* Mostrar nombre de la tabla */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tabla del Formulario:</Text>
            <Text style={styles.infoValue}>{tableName}</Text>
          </View>
          
          {console.log('🎨 Renderizando campos:', campos.length)}
          {campos.length === 0 ? (
            <Text style={styles.noCamposText}>
              No se encontraron campos para mostrar. 
              Revisando estructura de la tabla...
            </Text>
          ) : (
            campos.map(renderField)
          )}
        </View>

        {/* COMPONENTE IMAGE UPLOADER */}
        <ImageUploader 
          orderId={order.id} 
          informeTabla={tableName} 
        />

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>
              {existingRecord ? 'Actualizar Datos' : 'Guardar Formulario'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ================== APP PRINCIPAL ==================
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={isLoggedIn ? "Home" : "Login"}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// ================== ESTILOS ==================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  
  // Login Styles
  loginContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2C3E50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#7F8C8D',
    marginBottom: 40,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E6ED',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  readOnlyInput: {
    backgroundColor: '#F8F9FA',
    color: '#6C757D',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E6ED',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Home Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E6ED',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#DC3545',
    fontSize: 16,
    fontWeight: '600',
  },
  ordersList: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderCardWithReport: {
    borderLeftWidth: 4,
    borderLeftColor: '#28A745',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reportBadge: {
    backgroundColor: '#28A745',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 5,
  },
  reportBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  reportIndicator: {
    fontSize: 12,
    color: '#28A745',
    fontWeight: '600',
    marginBottom: 5,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 5,
  },
  orderDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 10,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  orderPriority: {
    fontSize: 12,
    color: '#E67E22',
    fontWeight: '600',
  },
  
  // Detail Styles
  detailContainer: {
    flex: 1,
    padding: 20,
  },
  detailHeader: {
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 10,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  detailCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  detailRow: {
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 22,
  },
  
  // Form Styles
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E6ED',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    color: '#DC3545',
    fontSize: 16,
    fontWeight: '600',
  },
  formHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
    textAlign: 'center',
    marginRight: 50,
  },
  formScrollView: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: '#28A745',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Debug styles
  noCamposText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  
  // Info rows styles
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    marginBottom: 5,
    borderRadius: 6,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    flex: 1,
  },
  infoValue: {
    fontSize: 12,
    color: '#007AFF',
    fontFamily: 'monospace',
    flex: 2,
    textAlign: 'right',
  },
  
  // Image Uploader Styles
  imageUploaderContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageUploaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  imagesList: {
    marginBottom: 15,
  },
  imageContainer: {
    marginRight: 15,
    alignItems: 'center',
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 5,
  },
  imageLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    maxWidth: 100,
  },
  componentLabel: {
    fontSize: 10,
    color: '#3498DB',
    textAlign: 'center',
    maxWidth: 100,
    fontWeight: '600',
    marginTop: 2,
  },
  addPhotoButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  addPhotoIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  addPhotoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imageHelperText: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
  
  // Nuevos estilos para secciones de fotografías
  sectionsContainer: {
    gap: 20,
  },
  photoSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  sectionHeader: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 15,
    alignItems: 'center',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  sectionImagesList: {
    marginBottom: 15,
  },
  addSectionPhotoButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  addSectionPhotoText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Estilos para organización jerárquica por componentes
  componentContainer: {
    marginBottom: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  componentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#E3F2FD',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  componentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  componentIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  componentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1976D2',
    flex: 1,
  },
  componentCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: 'bold',
  },
  componentToggleIcon: {
    fontSize: 18,
    color: '#1976D2',
    fontWeight: 'bold',
  },
  componentContent: {
    padding: 15,
  },
  componentSection: {
    marginBottom: 15,
  },
  sectionCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  addPhotoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sectionInComponent: {
    marginBottom: 15,
  },
  sectionTitleInComponent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  
  // Utils
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7F8C8D',
  },
  emptyText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default App;
