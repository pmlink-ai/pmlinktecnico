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
import * as Print from 'expo-print';
import PDFService from './services/pdfService';

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
const ImageUploader = ({ orderId, informeTabla, onScrollRestore, currentPhotoPage, setCurrentPhotoPage }) => {
  // Configuración de componentes por servicio
  const componentesPorServicio = {
    'informe_limpieza_ductos': [
      { key: 'Observaciones_Fotograficas', title: 'Observaciones Fotográficas', icon: '📸' },
      { key: 'Campana_1', title: 'Campana 1', icon: '🏭' },
      { key: 'Campana_2', title: 'Campana 2', icon: '🏭' },
      { key: 'Ductos_y_Registros', title: 'Ductos y Registros', icon: '🔧' },
      { key: 'Motores_y_Cubierta', title: 'Motores y Cubierta', icon: '⚙️' },
      { key: 'Panoramica_y_Sector', title: 'Panorámica y/o Sector', icon: '📷' },
      { key: 'Recibo_Conforme', title: 'Recibo Conforme', icon: '✅' }
    ],
    'informe_ansul_r102': [
      { key: 'Sistema_Supresion', title: 'Observaciones Fotográficas', icon: '�' },
      { key: 'Cartuchos_Gas', title: 'Recambio de fusibles térmicos', icon: '⚡' },
      { key: 'Canerias_Distribucion', title: 'Prueba de ruptura de fusible de prueba', icon: '🔧' },
      { key: 'Cilindro_Agente', title: 'Simulación de disparo manual', icon: '🛡️' },
      { key: 'Boquillas_Sistema', title: 'Valvula de Gas', icon: '�' },
      { key: 'Panel_Control', title: 'Alimentación electrica /Si aplicara', icon: '🎛️' },
      { key: 'Pruebas_Sistema', title: 'Panel de alarma /Si aplicara', icon: '🔍' },
      { key: 'Prueba_Neumatica', title: 'Prueba neumatica a cañerias de distribución', icon: '🔧' },
      { key: 'Tipo_Cartucho', title: 'Tipo de cartucho expulsor, cantidad y su peso', icon: '📦' },
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
  const [observacionesPorComponente, setObservacionesPorComponente] = useState({});
  const [observacionesSecciones, setObservacionesSecciones] = useState({});
  const [observacionesTimeouts, setObservacionesTimeouts] = useState({});

  const secciones = [
    { key: 'ANTES', title: 'ANTES', color: '#FF6B6B' },
    { key: 'PROCESO', title: 'PROCESO', color: '#FFA500' },
    { key: 'DESPUES', title: 'DESPUÉS', color: '#45B7D1' }
  ];

  // Obtener componentes para el servicio actual
  const getComponentesActuales = () => {
    const tablaKey = informeTabla?.toLowerCase() || 'default';
    return componentesPorServicio[tablaKey] || componentesPorServicio.default;
  };

  useEffect(() => {
    loadImages();
    loadObservacionesSecciones();
    
    // Cleanup function para limpiar timeouts al desmontar
    return () => {
      Object.values(observacionesTimeouts).forEach(timeoutId => {
        if (timeoutId) clearTimeout(timeoutId);
      });
    };
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
        if (componente.key === 'Boquillas_Sistema' || componente.key === 'Panel_Control' || componente.key === 'Pruebas_Sistema') {
          // Componentes especiales con sección FOTO
          organizedImages[componente.key] = {
            FOTO: []
          };
        } else {
          // Componentes normales con secciones estándar
          organizedImages[componente.key] = {
            ANTES: [],
            PROCESO: [],
            DESPUES: []
          };
        }
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
      console.log('📸 Imágenes organizadas:', organizedImages);

    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Error inesperado al cargar imágenes');
    } finally {
      setLoading(false);
    }
  };

  const loadObservacionesSecciones = async () => {
    try {
      const { data, error } = await supabase
        .from('observaciones_fotografias')
        .select('*')
        .eq('orden_trabajo_id', orderId)
        .eq('informe_tabla', informeTabla);

      if (error) {
        console.error('Error cargando observaciones:', error);
        return;
      }

      // Organizar observaciones por componente y sección
      const observacionesOrganizadas = {};
      (data || []).forEach(obs => {
        const key = `${obs.componente}_${obs.seccion}`;
        observacionesOrganizadas[key] = obs.observaciones;
      });

      setObservacionesSecciones(observacionesOrganizadas);
    } catch (error) {
      console.error('Error cargando observaciones:', error);
    }
  };

  const saveObservacionSeccion = async (componenteKey, seccion, texto) => {
    try {
      const { error } = await supabase
        .from('observaciones_fotografias')
        .upsert({
          orden_trabajo_id: orderId,
          informe_tabla: informeTabla,
          componente: componenteKey,
          seccion: seccion,
          observaciones: texto
        }, {
          onConflict: 'orden_trabajo_id,informe_tabla,componente,seccion'
        });

      if (error) {
        console.error('Error guardando observación:', error);
        Alert.alert('Error', 'No se pudo guardar la observación');
        return;
      }

      // Actualizar estado local
      setObservacionesSecciones(prev => ({
        ...prev,
        [`${componenteKey}_${seccion}`]: texto
      }));
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Error inesperado al guardar observación');
    }
  };

  const handleObservacionSeccionChange = (componenteKey, seccion, texto) => {
    const key = `${componenteKey}_${seccion}`;
    
    // Actualizar estado local inmediatamente
    setObservacionesSecciones(prev => ({
      ...prev,
      [key]: texto
    }));

    // Limpiar timeout anterior si existe
    if (observacionesTimeouts[key]) {
      clearTimeout(observacionesTimeouts[key]);
    }

    // Crear nuevo timeout para guardar después de 1 segundo
    const timeoutId = setTimeout(() => {
      saveObservacionSeccion(componenteKey, seccion, texto);
      // Limpiar el timeout del estado
      setObservacionesTimeouts(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[key];
        return newTimeouts;
      });
    }, 1000);

    // Guardar el timeout en el estado
    setObservacionesTimeouts(prev => ({
      ...prev,
      [key]: timeoutId
    }));
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
      // Verificar límite de fotos para informe_limpieza_ductos
      if (informeTabla === 'informe_limpieza_ductos') {
        const currentImages = imagesByComponenteAndSeccion[componente]?.[seccion] || [];
        if (currentImages.length >= 4) {
          Alert.alert(
            'Límite alcanzado', 
            'Máximo 4 fotografías por sección en Informe Limpieza Ductos',
            [{ text: 'OK' }]
          );
          return;
        }
      }

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
      // Verificar límite de fotos para informe_limpieza_ductos
      if (informeTabla === 'informe_limpieza_ductos') {
        const currentImages = imagesByComponenteAndSeccion[componente]?.[seccion] || [];
        if (currentImages.length >= 4) {
          Alert.alert(
            'Límite alcanzado', 
            'Máximo 4 fotografías por sección en Informe Limpieza Ductos',
            [{ text: 'OK' }]
          );
          return;
        }
      }

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
      console.log('🔥 Subiendo imagen:', { componente, seccion, asset: asset.uri });
      
      // Generar nombre único
      const fileExtension = asset.uri.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const filePath = `public/${orderId}/${informeTabla}/${componente}/${seccion}/${fileName}`;
      
      console.log('📁 Ruta de archivo:', filePath);

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
      const cleanedSeccion = cleanSectionName(seccion, componente);
      const etiqueta = cleanedSeccion ? `${cleanedSeccion} - ${componenteTitle}` : componenteTitle;

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

      console.log('✅ Imagen guardada exitosamente en BD:', { componente, seccion, etiqueta });
      
      // Popup de éxito eliminado - no mostrar mensaje
      // const successMessage = cleanedSeccion ? 
      //   `Imagen agregada: ${componenteTitle} - ${cleanedSeccion}` : 
      //   `Imagen agregada: ${componenteTitle}`;
      // Alert.alert('Éxito', successMessage);
      await loadImages(); // Recargar lista
      await loadObservacionesSecciones(); // Recargar observaciones
      
      // Restaurar posición del scroll después de cargar las imágenes
      if (onScrollRestore) {
        onScrollRestore();
      }

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

              // Popup de éxito eliminado - imagen se elimina silenciosamente
              // Alert.alert('Éxito', 'Imagen eliminada correctamente');
              await loadImages();
              await loadObservacionesSecciones();
              
              // Restaurar posición del scroll después de cargar las imágenes
              if (onScrollRestore) {
                onScrollRestore();
              }
            } catch (error) {
              console.error('Error:', error);
              Alert.alert('Error', 'Error inesperado al eliminar');
            }
          }
        }
      ]
    );
  };

  // Función helper para verificar límite de fotos
  const canAddMorePhotos = (componenteKey, seccionKey) => {
    if (informeTabla !== 'informe_limpieza_ductos') return true;
    const currentImages = imagesByComponenteAndSeccion[componenteKey]?.[seccionKey] || [];
    return currentImages.length < 4;
  };

  // Función helper para obtener texto del botón según el límite
  const getAddPhotoButtonText = (componenteKey, seccionKey, seccionTitle) => {
    if (informeTabla !== 'informe_limpieza_ductos') {
      return `AÑADIR FOTO ${seccionTitle.toUpperCase()}`;
    }
    
    const currentImages = imagesByComponenteAndSeccion[componenteKey]?.[seccionKey] || [];
    const remaining = 4 - currentImages.length;
    
    if (remaining === 0) {
      return 'LÍMITE ALCANZADO (4/4)';
    }
    
    // Para informe_limpieza_ductos, mostrar texto específico según la sección
    if (seccionKey === 'ANTES') {
      return `AÑADIR FOTO ANTES (${currentImages.length}/4)`;
    } else if (seccionKey === 'PROCESO') {
      return `AÑADIR FOTO PROCESO (${currentImages.length}/4)`;
    } else if (seccionKey === 'DESPUES') {
      return `AÑADIR FOTO DESPUES (${currentImages.length}/4)`;
    }
    
    // Fallback para otras secciones
    return `AÑADIR FOTO ${seccionTitle.toUpperCase()} (${currentImages.length}/4)`;
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
          style={[
            styles.addSectionPhotoButton, 
            { 
              borderColor: canAddMorePhotos(componenteKey, seccionData.key) ? seccionData.color : '#ccc',
              opacity: canAddMorePhotos(componenteKey, seccionData.key) ? 1 : 0.5
            }
          ]}
          onPress={() => pickImage(componenteKey, seccionData.key)}
          disabled={isUploading || !canAddMorePhotos(componenteKey, seccionData.key)}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color={seccionData.color} />
          ) : (
            <>
              <Text style={[
                styles.addPhotoIcon, 
                { color: canAddMorePhotos(componenteKey, seccionData.key) ? seccionData.color : '#ccc' }
              ]}>📷</Text>
              <Text style={[
                styles.addSectionPhotoText, 
                { color: canAddMorePhotos(componenteKey, seccionData.key) ? seccionData.color : '#ccc' }
              ]}>
                {getAddPhotoButtonText(componenteKey, seccionData.key, seccionData.title)}
              </Text>
            </>
          )}
        </TouchableOpacity>
        
        {/* Campo de observaciones por sección - solo para DESPUÉS */}
        {seccionData.key === 'DESPUES' && componenteKey !== 'Canerias_Distribucion' && componenteKey !== 'Campana_1' && componenteKey !== 'Campana_2' && componenteKey !== 'Ductos_y_Registros' && componenteKey !== 'Motores_y_Cubierta' && (
          <View style={styles.observacionesContainer}>
            <Text style={styles.observacionesLabel}>
              {componenteKey === 'Cartuchos_Gas' ? 'OBSERVACIONES:' : `Observaciones ${seccionData.title}:`}
            </Text>
            <TextInput
              style={styles.observacionesInput}
              placeholder={
                componenteKey === 'Cilindro_Agente' 
                  ? `Ingrese información solicitada...`
                  : `Ingrese observaciones para ${seccionData.title}...`
              }
              multiline
              numberOfLines={componenteKey === 'Cilindro_Agente' ? 6 : 2}
              value={
                componenteKey === 'Cilindro_Agente' 
                  ? (observacionesSecciones[`${componenteKey}_${seccionData.key}`] || `ESTADO Y OBSERVACIONES DE\nACCIONAMIENTO MANUAL:\n\nESTADO DEL TESTIGO DE ESTACION\nMANUAL:`)
                  : (observacionesSecciones[`${componenteKey}_${seccionData.key}`] || '')
              }
              onChangeText={(text) => handleObservacionSeccionChange(componenteKey, seccionData.key, text)}
              textAlignVertical="top"
              selectTextOnFocus={false}
              autoCorrect={false}
              autoCapitalize={componenteKey === 'Cilindro_Agente' ? "characters" : "sentences"}
            />
          </View>
        )}
      </View>
    );
  };

  // Renderizado especial para Alimentación electrica
  const renderAlimentacionElectricaComponent = (componenteKey) => {
    const images = imagesByComponenteAndSeccion[componenteKey]?.['FOTO'] || [];
    const uploadingKey = `${componenteKey}_FOTO`;
    const isUploading = uploading[uploadingKey];

    return (
      <View style={styles.componentContent}>
        {/* Título descriptivo */}
        <View style={styles.observacionesContainer}>
          <Text style={[styles.observacionesLabel, { textAlign: 'center', fontSize: 16, fontWeight: 'bold' }]}>
            SWITCH DE CORTE PARA SUMINISTRO{'\n'}ELECTRICO
          </Text>
        </View>
        
        {/* Sección de foto única */}
        <View style={styles.componentSection}>
          <View style={[styles.sectionHeader, { backgroundColor: '#45B7D1' }]}>
            <Text style={styles.sectionTitle}>FOTOGRAFÍA</Text>
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
            style={[styles.addSectionPhotoButton, { borderColor: '#45B7D1' }]}
            onPress={() => pickImage(componenteKey, 'FOTO')}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#45B7D1" />
            ) : (
              <>
                <Text style={[styles.addPhotoIcon, { color: '#45B7D1' }]}>📷</Text>
                <Text style={[styles.addSectionPhotoText, { color: '#45B7D1' }]}>
                  Subir Fotografía
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          {/* Campo de estado */}
          <View style={styles.observacionesContainer}>
            <Text style={styles.observacionesLabel}>ESTADO:</Text>
            <TextInput
              style={styles.observacionesInput}
              placeholder="Ingrese estado..."
              multiline
              numberOfLines={2}
              value={observacionesSecciones[`${componenteKey}_FOTO`] || ''}
              onChangeText={(text) => handleObservacionSeccionChange(componenteKey, 'FOTO', text)}
              textAlignVertical="top"
              selectTextOnFocus={false}
              autoCorrect={false}
              autoCapitalize="characters"
            />
          </View>
        </View>
      </View>
    );
  };

  // Renderizado especial para Panel de alarma
  const renderPanelAlarmaComponent = (componenteKey) => {
    const images = imagesByComponenteAndSeccion[componenteKey]?.['FOTO'] || [];
    const uploadingKey = `${componenteKey}_FOTO`;
    const isUploading = uploading[uploadingKey];

    return (
      <View style={styles.componentContent}>
        {/* Título descriptivo principal */}
        <View style={styles.observacionesContainer}>
          <Text style={[styles.observacionesLabel, { textAlign: 'center', fontSize: 16, fontWeight: 'bold' }]}>
            SWITCH INSTALADO
          </Text>
        </View>
        
        {/* Título descriptivo secundario */}
        <View style={styles.observacionesContainer}>
          <Text style={[styles.observacionesLabel, { textAlign: 'center', fontSize: 16, fontWeight: 'bold' }]}>
            RESPALDO
          </Text>
        </View>
        
        {/* Sección de foto única */}
        <View style={styles.componentSection}>
          <View style={[styles.sectionHeader, { backgroundColor: '#45B7D1' }]}>
            <Text style={styles.sectionTitle}>FOTOGRAFÍA</Text>
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
            style={[styles.addSectionPhotoButton, { borderColor: '#45B7D1' }]}
            onPress={() => pickImage(componenteKey, 'FOTO')}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#45B7D1" />
            ) : (
              <>
                <Text style={[styles.addPhotoIcon, { color: '#45B7D1' }]}>📷</Text>
                <Text style={[styles.addSectionPhotoText, { color: '#45B7D1' }]}>
                  Subir Fotografía
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          {/* Campo de estado y observaciones */}
          <View style={styles.observacionesContainer}>
            <Text style={styles.observacionesLabel}>ESTADO Y OBSERVACIONES:</Text>
            <TextInput
              style={styles.observacionesInput}
              placeholder="Ingrese estado y observaciones..."
              multiline
              numberOfLines={3}
              value={observacionesSecciones[`${componenteKey}_FOTO`] || ''}
              onChangeText={(text) => handleObservacionSeccionChange(componenteKey, 'FOTO', text)}
              textAlignVertical="top"
              selectTextOnFocus={false}
              autoCorrect={false}
              autoCapitalize="characters"
            />
          </View>
        </View>
      </View>
    );
  };

  // Renderizado especial para Valvula de Gas
  const renderValvulaGasComponent = (componenteKey) => {
    const images = imagesByComponenteAndSeccion[componenteKey]?.['FOTO'] || [];
    const uploadingKey = `${componenteKey}_FOTO`;
    const isUploading = uploading[uploadingKey];

    return (
      <View style={styles.componentContent}>
        {/* Sección de foto única */}
        <View style={styles.componentSection}>
          <View style={[styles.sectionHeader, { backgroundColor: '#45B7D1' }]}>
            <Text style={styles.sectionTitle}>FOTOGRAFÍA</Text>
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
            style={[styles.addSectionPhotoButton, { borderColor: '#45B7D1' }]}
            onPress={() => pickImage(componenteKey, 'FOTO')}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#45B7D1" />
            ) : (
              <>
                <Text style={[styles.addPhotoIcon, { color: '#45B7D1' }]}>�</Text>
                <Text style={[styles.addSectionPhotoText, { color: '#45B7D1' }]}>
                  Tomar Fotografía
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          {/* Campo de observaciones personalizado */}
          <View style={styles.observacionesContainer}>
            <Text style={styles.observacionesLabel}>MEDIDA DE TOMA DE VALVULA:</Text>
            <TextInput
              style={styles.observacionesInput}
              placeholder="Ingrese medida de toma de válvula..."
              multiline
              numberOfLines={2}
              value={observacionesSecciones[`${componenteKey}_FOTO`] || ''}
              onChangeText={(text) => handleObservacionSeccionChange(componenteKey, 'FOTO', text)}
              textAlignVertical="top"
              selectTextOnFocus={false}
              autoCorrect={false}
              autoCapitalize="characters"
            />
          </View>
        </View>
      </View>
    );
  };

  const handleObservacionChange = (componenteKey, text) => {
    setObservacionesPorComponente(prev => ({
      ...prev,
      [componenteKey]: text
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

  const renderPanoramicaSection = (componenteKey) => {
    // Para Panorámica y/o Sector, solo usamos la sección 'ANTES' como sección única para fotos
    const seccionUnica = 'ANTES';
    const images = imagesByComponenteAndSeccion[componenteKey]?.[seccionUnica] || [];
    const uploadingKey = `${componenteKey}_${seccionUnica}`;
    const isUploading = uploading[uploadingKey];

    return (
      <View style={styles.componentSection}>
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
          style={[styles.addSectionPhotoButton, { borderColor: '#007AFF' }]}
          onPress={() => pickImage(componenteKey, seccionUnica)}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <>
              <Text style={[styles.addPhotoIcon, { color: '#007AFF' }]}>📷</Text>
              <Text style={[styles.addSectionPhotoText, { color: '#007AFF' }]}>
                AÑADIR FOTOGRAFÍA PANORÁMICA
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Campo de observaciones para tratamiento de limpieza - se guarda en sección DESPUÉS */}
        <View style={styles.observacionesContainer}>
          <Text style={styles.observacionesLabel}>
            ¿REQUIERE DE TRATAMIENTO DE LIMPIEZA DE CUBIERTA?
          </Text>
          <TextInput
            style={styles.observacionesInput}
            placeholder="Ingrese su respuesta..."
            multiline
            numberOfLines={3}
            value={observacionesSecciones[`${componenteKey}_DESPUES`] || ''}
            onChangeText={(text) => handleObservacionSeccionChange(componenteKey, 'DESPUES', text)}
            textAlignVertical="top"
          />
        </View>
      </View>
    );
  };

  const renderObservacionesFotograficasSimpleSection = (componenteKey) => {
    // Para Observaciones Fotográficas en informe_limpieza_ductos, solo usamos la sección 'ANTES' como sección única
    const seccionUnica = 'ANTES';
    const images = imagesByComponenteAndSeccion[componenteKey]?.[seccionUnica] || [];
    const uploadingKey = `${componenteKey}_${seccionUnica}`;
    const isUploading = uploading[uploadingKey];

    return (
      <View style={styles.componentSection}>
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
          style={[
            styles.addSectionPhotoButton, 
            { 
              borderColor: canAddMorePhotos(componenteKey, seccionUnica) ? '#FF6B6B' : '#ccc',
              opacity: canAddMorePhotos(componenteKey, seccionUnica) ? 1 : 0.5
            }
          ]}
          onPress={() => pickImage(componenteKey, seccionUnica)}
          disabled={isUploading || !canAddMorePhotos(componenteKey, seccionUnica)}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#FF6B6B" />
          ) : (
            <>
              <Text style={[styles.addPhotoIcon, { color: canAddMorePhotos(componenteKey, seccionUnica) ? '#FF6B6B' : '#ccc' }]}>📷</Text>
              <Text style={[styles.addSectionPhotoText, { color: canAddMorePhotos(componenteKey, seccionUnica) ? '#FF6B6B' : '#ccc' }]}>
                {getAddPhotoButtonText(componenteKey, seccionUnica, 'Observaciones')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderObservacionesFotograficasSection = (componenteKey) => {
    // Para Observaciones Fotográficas, solo usamos la sección 'ANTES' como sección única
    const seccionUnica = 'ANTES';
    const images = imagesByComponenteAndSeccion[componenteKey]?.[seccionUnica] || [];
    const uploadingKey = `${componenteKey}_${seccionUnica}`;
    const isUploading = uploading[uploadingKey];

    return (
      <View style={styles.componentSection}>
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
          style={[
            styles.addSectionPhotoButton, 
            { 
              borderColor: canAddMorePhotos(componenteKey, seccionUnica) ? '#007AFF' : '#ccc',
              opacity: canAddMorePhotos(componenteKey, seccionUnica) ? 1 : 0.5
            }
          ]}
          onPress={() => pickImage(componenteKey, seccionUnica)}
          disabled={isUploading || !canAddMorePhotos(componenteKey, seccionUnica)}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <>
              <Text style={[styles.addPhotoIcon, { color: canAddMorePhotos(componenteKey, seccionUnica) ? '#007AFF' : '#ccc' }]}>📷</Text>
              <Text style={[styles.addSectionPhotoText, { color: canAddMorePhotos(componenteKey, seccionUnica) ? '#007AFF' : '#ccc' }]}>
                {getAddPhotoButtonText(componenteKey, seccionUnica, 'Observaciones')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // Función helper para formatear títulos de componentes en mayúsculas
  const formatComponentTitle = (title) => {
    return title.toUpperCase();
  };

  // Función helper para limpiar nombres de sección (eliminar "ANTES" para Observaciones Fotográficas)
  const cleanSectionName = (seccion, componenteKey) => {
    // Si es Observaciones Fotográficas y la sección es "ANTES", no mostrar la sección
    if ((componenteKey === 'Observaciones_Fotograficas' || componenteKey === 'Sistema_Supresion') && seccion === 'ANTES') {
      return '';
    }
    return seccion;
  };

  const renderComponent = (componenteData) => {
    
    // Calcular total de imágenes según el tipo de componente
    let totalImages;
    if (componenteData.key === 'Boquillas_Sistema' || componenteData.key === 'Panel_Control' || componenteData.key === 'Pruebas_Sistema') {
      // Para Valvula de Gas, Alimentación electrica y Panel de alarma, contar solo fotos
      totalImages = imagesByComponenteAndSeccion[componenteData.key]?.['FOTO']?.length || 0;
    } else if (componenteData.key === 'Observaciones_Fotograficas' || componenteData.key === 'Recibo_Conforme' || componenteData.key === 'Sistema_Supresion') {
      // Para Observaciones Fotográficas, Recibo Conforme y Sistema Supresion, contar fotos en sección ANTES
      totalImages = imagesByComponenteAndSeccion[componenteData.key]?.['ANTES']?.length || 0;
    } else {
      // Para otros componentes, contar todas las secciones
      totalImages = secciones.reduce((total, seccion) => {
        return total + (imagesByComponenteAndSeccion[componenteData.key]?.[seccion.key]?.length || 0);
      }, 0);
    }

    // Renderizado especial para "Valvula de Gas"
    if (componenteData.key === 'Boquillas_Sistema') {
      return (
        <View key={componenteData.key} style={styles.componentContainer}>
          <View style={styles.componentHeader}>
            <View style={styles.componentHeaderLeft}>
              <Text style={styles.componentIcon}>{componenteData.icon}</Text>
              <Text style={styles.componentTitle}>{formatComponentTitle(componenteData.title)}</Text>
              {totalImages > 0 && (
                <Text style={styles.componentCount}>({totalImages} fotos)</Text>
              )}
            </View>
          </View>
          
          {renderValvulaGasComponent(componenteData.key)}
        </View>
      );
    }

    // Renderizado especial para "Alimentación electrica"
    if (componenteData.key === 'Panel_Control') {
      return (
        <View key={componenteData.key} style={styles.componentContainer}>
          <View style={styles.componentHeader}>
            <View style={styles.componentHeaderLeft}>
              <Text style={styles.componentIcon}>{componenteData.icon}</Text>
              <Text style={styles.componentTitle}>{formatComponentTitle(componenteData.title)}</Text>
              {totalImages > 0 && (
                <Text style={styles.componentCount}>({totalImages} fotos)</Text>
              )}
            </View>
          </View>
          
          {renderAlimentacionElectricaComponent(componenteData.key)}
        </View>
      );
    }

    // Renderizado especial para "Panel de alarma"
    if (componenteData.key === 'Pruebas_Sistema') {
      return (
        <View key={componenteData.key} style={styles.componentContainer}>
          <View style={styles.componentHeader}>
            <View style={styles.componentHeaderLeft}>
              <Text style={styles.componentIcon}>{componenteData.icon}</Text>
              <Text style={styles.componentTitle}>{formatComponentTitle(componenteData.title)}</Text>
              {totalImages > 0 && (
                <Text style={styles.componentCount}>({totalImages} fotos)</Text>
              )}
            </View>
          </View>
          
          {renderPanelAlarmaComponent(componenteData.key)}
        </View>
      );
    }


    // Renderizado especial para "Recibo Conforme" - solo una opción de foto
    if (componenteData.key === 'Recibo_Conforme') {
      return (
        <View key={componenteData.key} style={styles.componentContainer}>
          <View style={styles.componentHeader}>
            <View style={styles.componentHeaderLeft}>
              <Text style={styles.componentIcon}>{componenteData.icon}</Text>
              <Text style={styles.componentTitle}>{formatComponentTitle(componenteData.title)}</Text>
              {totalImages > 0 && (
                <Text style={styles.componentCount}>({totalImages} fotos)</Text>
              )}
            </View>
          </View>
          
          <View style={styles.componentContent}>
            {renderReciboConformeSection(componenteData.key)}
          </View>
        </View>
      );
    }

    // Renderizado especial para "Panoramica y/o Sector" - solo una opción de foto
    if (componenteData.key === 'Panoramica_y_Sector') {
      return (
        <View key={componenteData.key} style={styles.componentContainer}>
          <View style={styles.componentHeader}>
            <View style={styles.componentHeaderLeft}>
              <Text style={styles.componentIcon}>{componenteData.icon}</Text>
              <Text style={styles.componentTitle}>{formatComponentTitle(componenteData.title)}</Text>
              {totalImages > 0 && (
                <Text style={styles.componentCount}>({totalImages} fotos)</Text>
              )}
            </View>
          </View>
          
          <View style={styles.componentContent}>
            {renderPanoramicaSection(componenteData.key)}
          </View>
        </View>
      );
    }

    // Renderizado especial para "Sistema Supresion" - solo una opción de foto
    if (componenteData.key === 'Sistema_Supresion') {
      return (
        <View key={componenteData.key} style={styles.componentContainer}>
          <View style={styles.componentHeader}>
            <View style={styles.componentHeaderLeft}>
              <Text style={styles.componentIcon}>{componenteData.icon}</Text>
              <Text style={styles.componentTitle}>{componenteData.title}</Text>
              {totalImages > 0 && (
                <Text style={styles.componentCount}>({totalImages} fotos)</Text>
              )}
            </View>
          </View>
          
          <View style={styles.componentContent}>
            {renderObservacionesFotograficasSection(componenteData.key)}
          </View>
        </View>
      );
    }

    // Renderizado especial para "Observaciones Fotográficas" en cualquier informe
    if (componenteData.key === 'Observaciones_Fotograficas') {
      return (
        <View key={componenteData.key} style={styles.componentContainer}>
          <View style={styles.componentHeader}>
            <View style={styles.componentHeaderLeft}>
              <Text style={styles.componentIcon}>{componenteData.icon}</Text>
              <Text style={styles.componentTitle}>{formatComponentTitle(componenteData.title)}</Text>
              {totalImages > 0 && (
                <Text style={styles.componentCount}>({totalImages} fotos)</Text>
              )}
            </View>
          </View>
          
          <View style={styles.componentContent}>
            {informeTabla === 'informe_limpieza_ductos' ? 
              renderObservacionesFotograficasSimpleSection(componenteData.key) :
              renderObservacionesFotograficasSection(componenteData.key)
            }
          </View>
        </View>
      );
    }

    // Renderizado normal para otros componentes
    return (
      <View key={componenteData.key} style={styles.componentContainer}>
        <View style={styles.componentHeader}>
          <View style={styles.componentHeaderLeft}>
            <Text style={styles.componentIcon}>{componenteData.icon}</Text>
            <Text style={styles.componentTitle}>{formatComponentTitle(componenteData.title)}</Text>
            {totalImages > 0 && (
              <Text style={styles.componentCount}>({totalImages} fotos)</Text>
            )}
          </View>
        </View>
        
        <View style={styles.componentContent}>
          {secciones.map(seccion => renderSeccionInComponent(seccion, componenteData.key))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.imageUploaderContainer}>
      <Text style={styles.minimalistTitle}>� Fotografías</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <View style={styles.sectionsContainer}>
          {/* MOSTRAR SOLO EL COMPONENTE ACTUAL */}
          {(() => {
            const componentes = getComponentesActuales();
            const componenteActual = componentes[currentPhotoPage];
            
            if (!componenteActual) return null;
            
            return (
              <View>
                {/* INDICADOR DE PÁGINA */}
                <View style={styles.pageIndicator}>
                  <Text style={styles.pageText}>
                    {currentPhotoPage + 1} de {componentes.length}
                  </Text>
                  <Text style={styles.componentPageTitle}>
                    {componenteActual.title.toUpperCase()}
                  </Text>
                </View>
                
                {/* COMPONENTE ACTUAL */}
                {renderComponent(componenteActual)}
                
                {/* BOTONES DE NAVEGACIÓN */}
                <View style={styles.photoNavigationContainer}>
                  {currentPhotoPage > 0 && (
                    <TouchableOpacity 
                      style={styles.photoNavButton}
                      onPress={() => setCurrentPhotoPage(currentPhotoPage - 1)}
                    >
                      <Text style={styles.photoNavButtonText}>⬅ ANTERIOR</Text>
                    </TouchableOpacity>
                  )}
                  
                  {currentPhotoPage < componentes.length - 1 && (
                    <TouchableOpacity 
                      style={[styles.photoNavButton, styles.photoNavButtonNext]}
                      onPress={() => setCurrentPhotoPage(currentPhotoPage + 1)}
                    >
                      <Text style={styles.photoNavButtonText}>SIGUIENTE ➡</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })()}
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
    
    if (formKey.includes('limpieza_ductos') || formKey.includes('ansul_r102')) {
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

        <View style={styles.techCard}>
          <View style={styles.techCardHeader}>
            <View style={styles.techIconContainer}>
              <Text style={styles.techIcon}>📋</Text>
            </View>
            <Text style={styles.techCardTitle}>INFORMACIÓN DE LA ORDEN</Text>
            <View style={styles.techAccent} />
          </View>
          
          <View style={styles.techDataContainer}>
            <View style={styles.techDataRow}>
              <View style={styles.techLabelContainer}>
                <Text style={styles.techLabel}>ID ORDEN</Text>
                <View style={styles.techLabelLine} />
              </View>
              <Text style={styles.techValue}>{order.id}</Text>
            </View>
            
            <View style={styles.techDataRow}>
              <View style={styles.techLabelContainer}>
                <Text style={styles.techLabel}>NÚMERO</Text>
                <View style={styles.techLabelLine} />
              </View>
              <Text style={styles.techValue}>
                {order.numero || `#${order.id.substring(0, 8)}`}
              </Text>
            </View>
            
            <View style={styles.techDataRow}>
              <View style={styles.techLabelContainer}>
                <Text style={styles.techLabel}>TÍTULO</Text>
                <View style={styles.techLabelLine} />
              </View>
              <Text style={styles.techValue}>{order.titulo}</Text>
            </View>
            
            <View style={styles.techDataRow}>
              <View style={styles.techLabelContainer}>
                <Text style={styles.techLabel}>DESCRIPCIÓN</Text>
                <View style={styles.techLabelLine} />
              </View>
              <Text style={styles.techValue}>
                {order.descripcion_corta}
                {order.descripcion_larga && ` ${order.descripcion_larga}`}
              </Text>
            </View>
            
            <View style={styles.techDataRow}>
              <View style={styles.techLabelContainer}>
                <Text style={styles.techLabel}>FECHA</Text>
                <View style={styles.techLabelLine} />
              </View>
              <Text style={styles.techValue}>
                {new Date(order.created_at).toLocaleString()}
              </Text>
            </View>

            {empresaInfo && (
              <View style={styles.techDataRow}>
                <View style={styles.techLabelContainer}>
                  <Text style={styles.techLabel}>EMPRESA</Text>
                  <View style={styles.techLabelLine} />
                </View>
                <Text style={styles.techValue}>{empresaInfo.nombre_empresa}</Text>
              </View>
            )}

            {localInfo && (
              <View style={styles.techDataRow}>
                <View style={styles.techLabelContainer}>
                  <Text style={styles.techLabel}>LOCAL</Text>
                  <View style={styles.techLabelLine} />
                </View>
                <Text style={styles.techValue}>{localInfo.nombre_local}</Text>
              </View>
            )}
          </View>
        </View>

        {formularioInfo && (
          <View style={styles.techCard}>
            <View style={styles.techCardHeader}>
              <View style={styles.techIconContainer}>
                <Text style={styles.techIcon}>📝</Text>
              </View>
              <Text style={styles.techCardTitle}>FORMULARIO ASIGNADO</Text>
              <View style={styles.techAccent} />
            </View>
            
            <View style={styles.techDataContainer}>
              <View style={styles.techDataRow}>
                <View style={styles.techLabelContainer}>
                  <Text style={styles.techLabel}>TIPO</Text>
                  <View style={styles.techLabelLine} />
                </View>
                <Text style={styles.techValue}>{formularioInfo.form_key}</Text>
              </View>
            </View>
            
            <View style={styles.techCardFooter}>
              <TouchableOpacity 
                style={styles.techButton}
                onPress={() => setShowFormModal(true)}
              >
                <Text style={styles.techButtonText}>▶ ABRIR FORMULARIO</Text>
              </TouchableOpacity>
            </View>
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

// ================== TÉCNICOS ASIGNADOS ==================
const TecnicosAsignados = ({ orderId }) => {
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarTecnicosAsignados();
  }, [orderId]);

  const cargarTecnicosAsignados = async () => {
    try {
      console.log('🔍 Buscando técnicos asignados para orden:', orderId);
      console.log('🔍 Tipo de orderId:', typeof orderId);
      console.log('🔍 Valor exacto de orderId:', JSON.stringify(orderId));
      
      // Paso 1: Obtener asignaciones usando la relación correcta
      // orden_trabajo.id = asignaciones_ot.orden_id
      console.log('🔍 Consultando: asignaciones_ot WHERE orden_id =', orderId);
      const { data: asignaciones, error: asignacionesError } = await supabase
        .from('asignaciones_ot')
        .select('tecnico_id')  // Solo necesitamos el tecnico_id
        .eq('orden_id', orderId);  // orden_trabajo.id = asignaciones_ot.orden_id

      console.log('📋 Asignaciones encontradas:', asignaciones);

      if (asignacionesError) {
        console.error('❌ Error obteniendo asignaciones:', asignacionesError);
        setLoading(false);
        return;
      }

      if (!asignaciones || asignaciones.length === 0) {
        console.log('� No hay técnicos asignados a esta orden');
        setTecnicos([]);
        setLoading(false);
        return;
      }

      // Paso 2: Obtener información de los técnicos usando la relación correcta
      // asignaciones_ot.tecnico_id = usuario.usuario_id
      const tecnicoIds = asignaciones.map(asig => asig.tecnico_id);
      console.log('👥 IDs de técnicos extraídos:', tecnicoIds);

      console.log('🔍 Consultando: usuario WHERE usuario_id IN', tecnicoIds);
      const { data: usuariosTecnicos, error: usuariosError } = await supabase
        .from('usuario')
        .select('usuario_id, nombre, apellido')
        .in('usuario_id', tecnicoIds);  // asignaciones_ot.tecnico_id = usuario.usuario_id

      console.log('📋 Usuarios técnicos encontrados:', usuariosTecnicos);

      if (usuariosError) {
        console.error('❌ Error obteniendo datos de técnicos:', usuariosError);
        setLoading(false);
        return;
      }

      console.log('✅ Técnicos obtenidos exitosamente:', usuariosTecnicos?.length || 0);
      setTecnicos(usuariosTecnicos || []);
      
    } catch (error) {
      console.error('❌ Error general cargando técnicos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.techCard}>
        <View style={styles.techCardHeader}>
          <View style={styles.techIconContainer}>
            <Text style={styles.techIcon}>👥</Text>
          </View>
          <Text style={styles.techCardTitle}>TÉCNICOS ASIGNADOS</Text>
          <View style={styles.techAccent} />
        </View>
        <View style={styles.techDataContainer}>
          <Text style={styles.loadingText}>Cargando técnicos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.techCard}>
      <View style={styles.techCardHeader}>
        <View style={styles.techIconContainer}>
          <Text style={styles.techIcon}>👥</Text>
        </View>
        <Text style={styles.techCardTitle}>TÉCNICOS ASIGNADOS</Text>
        <View style={styles.techAccent} />
      </View>
      
      <View style={styles.techDataContainer}>
        {tecnicos.length === 0 ? (
          <View style={styles.techDataRow}>
            <Text style={styles.noTecnicosText}>
              No hay técnicos asignados a esta orden de trabajo
            </Text>
          </View>
        ) : (
          tecnicos.map((tecnico, index) => (
            <View key={tecnico.usuario_id} style={styles.techDataRow}>
              <View style={styles.techLabelContainer}>
                <Text style={styles.techLabel}>TÉCNICO {index + 1}</Text>
                <View style={styles.techLabelLine} />
              </View>
              <Text style={styles.techValue}>
                {tecnico.nombre} {tecnico.apellido}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
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
  const [currentScrollY, setCurrentScrollY] = useState(0);
  const [currentView, setCurrentView] = useState('datos'); // 'datos' o 'fotografias'
  const [currentPhotoPage, setCurrentPhotoPage] = useState(0); // Índice de la página actual de fotografías
  
  // Referencia simple para el scroll
  const scrollRef = useRef(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

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

  // Función simple para restaurar posición de scroll
  const restoreScroll = () => {
    if (scrollRef.current && currentScrollY > 0) {
      setTimeout(() => {
        scrollRef.current.scrollTo({
          y: currentScrollY,
          animated: true
        });
      }, 300); // Delay para asegurar que el contenido esté cargado
    }
  };

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

      // Filtrar campos que no queremos mostrar (incluyendo los especiales que se muestran al inicio)
      const camposExcluidos = ['id', 'created_at', 'updated_at', 'orden_trabajo_id', 'encargado', 'asist_personal', 'horas_trabajo'];
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
      // Campos de limpieza de ductos
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
      
      // Campos de ANSUL R102
      'inspeccion_visual_montaje': 'INSPECCIÓN VISUAL DEL MONTAJE',
      'estado_cartuchos_gas': 'ESTADO DE CARTUCHOS DE GAS',
      'estado_canerias_distribucion': 'ESTADO DE CAÑERÍAS DE DISTRIBUCIÓN',
      'estado_montaje_conductos': 'ESTADO DEL MONTAJE DE CONDUCTOS',
      'prueba_fuga_caneria': 'PRUEBA DE FUGA EN CAÑERÍAS',
      'prueba_soplado_canerias': 'PRUEBA DE SOPLADO DE CAÑERÍAS',
      'revision_agente': 'REVISIÓN DEL AGENTE',
      'estado_cilindro_agente': 'ESTADO DEL CILINDRO DE AGENTE',
      'estado_disco_ruptura': 'ESTADO DEL DISCO DE RUPTURA',
      'cantidad_estado_boquillas': 'CANTIDAD Y ESTADO DE BOQUILLAS',
      'tipo_tapones_boquillas': 'TIPO DE TAPONES DE BOQUILLAS',
      'estado_piola_acero': 'ESTADO DE LA PIOLA DE ACERO',
      'verificacion_automan_gas': 'VERIFICACIÓN AUTO/MAN GAS',
      'verificacion_senal_alarma': 'VERIFICACIÓN SEÑAL DE ALARMA',
      'observaciones_generales': 'OBSERVACIONES GENERALES',
      
      // Campos comunes
      'observaciones': 'OBSERVACIONES',
      'orden_trabajo_id': 'ORDEN DE TRABAJO',
      'encargado': 'ENCARGADO',
      'asist_personal': 'ASISTENCIA PERSONAL',
      'horas_trabajo': 'HORAS DE TRABAJO'
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
    const requiredFields = ['orden_trabajo_id', 'encargado', 'asist_personal'];
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

  // ==================== FUNCIONES PARA PDF Y EMAIL ====================
  
  const handleGeneratePDF = async () => {
    try {
      setGeneratingPDF(true);
      
      if (!existingRecord) {
        Alert.alert(
          'Guardar primero',
          'Debes guardar el formulario antes de generar el PDF',
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('📄 Generando PDF para orden:', order.id);
      
      await PDFService.generateAndSharePDF(
        order.id, 
        tableName, 
        `Informe_${order.id?.substring(0, 8)}`
      );
      
      Alert.alert('Éxito', 'PDF generado y listo para compartir');
      
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      Alert.alert('Error', 'No se pudo generar el PDF: ' + error.message);
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Función para renderizar los campos especiales al inicio del formulario
  const renderSpecialFields = () => {
    const specialFields = [
      {
        key: 'encargado',
        label: 'ENCARGADO',
        required: true,
        type: 'text'
      },
      {
        key: 'asist_personal', 
        label: 'ASISTENCIA PERSONAL',
        required: true,
        type: 'text'
      },
      {
        key: 'horas_trabajo',
        label: 'HORAS DE TRABAJO', 
        required: false,
        type: 'numeric'
      }
    ];

    return specialFields.map((field) => {
      const fieldValue = formData[field.key] || '';
      
      return (
        <View key={field.key} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {field.label} {field.required && '*'}
          </Text>
          <TextInput
            style={styles.input}
            value={String(fieldValue)}
            onChangeText={(value) => handleInputChange(field.key, value)}
            placeholder={`Ingresa ${field.label.toLowerCase()}`}
            keyboardType={field.type === 'numeric' ? 'numeric' : 'default'}
            autoCapitalize={field.type === 'numeric' ? 'none' : 'characters'}
            autoCorrect={false}
          />
        </View>
      );
    });
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

  // Función para obtener el nombre correcto del formulario
  const getFormDisplayName = (tableName) => {
    const formNames = {
      'informe_limpieza_ductos': 'FORMULARIO INFORME LIMPIEZA DUCTOS',
      'informe_limpiza_ductos': 'FORMULARIO INFORME LIMPIEZA DUCTOS', // Corregir error de tipeo
      'informe_ansul_r102': 'FORMULARIO INFORME ANSUL R102',
      // Agregar más formularios según sea necesario
    };
    
    return formNames[tableName] || `FORMULARIO ${tableName.replace(/_/g, ' ').toUpperCase()}`;
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
      <View style={styles.modernFormHeader}>
        <View style={styles.modernFormHeaderContent}>
          <View style={styles.modernFormIconContainer}>
            <Text style={styles.modernFormIcon}>📋</Text>
          </View>
          <View style={styles.modernFormTitleContainer}>
            <Text style={styles.modernFormTitle}>
              {getFormDisplayName(tableName)}
            </Text>
            <View style={styles.modernFormAccent} />
          </View>
          <TouchableOpacity onPress={onClose} style={styles.modernCloseButton}>
            <Text style={styles.modernCloseButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        ref={scrollRef}
        style={styles.formScrollView}
        onScroll={(event) => {
          setCurrentScrollY(event.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={100}
      >
        {currentView === 'datos' ? (
          // VISTA DE DATOS TÉCNICOS
          <>
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
              
              {/* Mostrar técnicos asignados en lugar de la tabla del formulario */}
              <TecnicosAsignados orderId={order.id} />
              
              {console.log('🎨 Renderizando campos:', campos.length)}
              {campos.length === 0 ? (
                <Text style={styles.noCamposText}>
                  No se encontraron campos para mostrar. 
                  Revisando estructura de la tabla...
                </Text>
              ) : (
                <>
                  {/* Campos especiales al inicio */}
                  {renderSpecialFields()}
                  
                  {/* Separador visual */}
                  <View style={styles.separator}>
                    <Text style={styles.separatorText}>📊 Datos Técnicos</Text>
                  </View>
                  
                  {/* Campos dinámicos de la tabla */}
                  {campos.map(renderField)}
                </>
              )}
            </View>

            {/* BOTÓN SIGUIENTE PARA IR A FOTOGRAFÍAS */}
            <TouchableOpacity 
              style={styles.nextButton}
              onPress={() => {
                setCurrentView('fotografias');
                setCurrentPhotoPage(0); // Resetear a la primera página
              }}
            >
              <Text style={styles.nextButtonText}>� Fotografías ➜</Text>
            </TouchableOpacity>
          </>
        ) : (
          // VISTA DE FOTOGRAFÍAS
          <>
            {/* BOTÓN VOLVER A DATOS TÉCNICOS */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setCurrentView('datos')}
            >
              <Text style={styles.backButtonText}>⬅ DATOS</Text>
            </TouchableOpacity>

            {/* COMPONENTE IMAGE UPLOADER CON PAGINACIÓN */}
            <ImageUploader 
              orderId={order.id} 
              informeTabla={tableName}
              onScrollRestore={restoreScroll}
              currentPhotoPage={currentPhotoPage}
              setCurrentPhotoPage={setCurrentPhotoPage}
            />
          </>
        )}

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

        {/* BOTONES PARA PDF Y EMAIL */}
        {existingRecord && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.pdfButton]}
              onPress={handleGeneratePDF}
              disabled={generatingPDF}
            >
              {generatingPDF ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Text style={styles.actionButtonIcon}>📄</Text>
                  <Text style={styles.actionButtonText}>Generar PDF</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

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
  
  // Estilos tecnológicos
  techCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  techCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#00D4AA',
  },
  techIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  techIcon: {
    fontSize: 20,
    color: 'white',
  },
  techCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a202c',
    letterSpacing: 1.5,
    flex: 1,
  },
  techAccent: {
    width: 4,
    height: 30,
    backgroundColor: '#00D4AA',
    borderRadius: 2,
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  techDataContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 15,
  },
  techDataRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  techLabelContainer: {
    flex: 1,
    marginRight: 15,
  },
  techLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  techLabelLine: {
    height: 2,
    backgroundColor: '#cbd5e1',
    borderRadius: 1,
    width: '60%',
  },
  techValue: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
    flex: 2,
    lineHeight: 22,
  },
  techCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  techStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00D4AA',
    marginRight: 8,
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  techStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  techButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#5a67d8',
  },
  techButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
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
  
  // Estilos modernos para el header del formulario
  modernFormHeader: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  modernFormHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingVertical: 16,
  },
  modernFormIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modernFormIcon: {
    fontSize: 18,
    color: 'white',
  },
  modernFormTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  modernFormTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a202c',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  modernFormAccent: {
    height: 2,
    backgroundColor: '#00D4AA',
    borderRadius: 1,
    width: '40%',
  },
  modernCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modernCloseButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
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
  
  // Estilos para botones de navegación
  nextButton: {
    backgroundColor: '#007BFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 15,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#6C757D',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    marginHorizontal: 15,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Estilos para botones de acción (PDF y Email)
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 12,
    minHeight: 50,
  },
  pdfButton: {
    backgroundColor: '#E74C3C',
  },
  emailButton: {
    backgroundColor: '#3498DB',
  },
  actionButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
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
  noTecnicosText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
  minimalistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
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
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
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
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Estilos para observaciones por componente
  observacionesContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E6ED',
  },
  observacionesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  observacionesInput: {
    borderWidth: 1,
    borderColor: '#E0E6ED',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    minHeight: 80,
    textAlignVertical: 'top',
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
    padding: 12,
    backgroundColor: '#F5F7FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EDF4',
  },
  componentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  componentIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  componentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
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
    padding: 10,
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
  separator: {
    marginVertical: 20,
    paddingVertical: 12,
    backgroundColor: '#E8F4FD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    alignItems: 'center',
  },
  separatorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  
  // Estilos para paginación de fotografías
  pageIndicator: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E6ED',
  },
  pageText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  componentPageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  photoNavigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  photoNavButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  photoNavButtonNext: {
    backgroundColor: '#28A745',
  },
  photoNavButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default App;
