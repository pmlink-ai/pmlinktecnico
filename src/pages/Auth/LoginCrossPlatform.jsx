import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar,
  Dimensions
} from 'react-native';
import { supabase } from '../../services/supabase';

const LoginCrossPlatform = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardVisible(true);
        setKeyboardHeight(event.endCoordinates.height);
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });
      
      if (error) {
        Alert.alert('Error', error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const focusEmail = () => {
    emailRef.current?.focus();
    // En Android, hacer scroll hacia el input
    if (Platform.OS === 'android') {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 200, animated: true });
      }, 100);
    }
  };

  const focusPassword = () => {
    passwordRef.current?.focus();
    // En Android, hacer scroll hacia el input
    if (Platform.OS === 'android') {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 300, animated: true });
      }, 100);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Configuración específica por plataforma
  const getKeyboardAvoidingViewBehavior = () => {
    if (Platform.OS === 'ios') {
      return 'padding';
    } else {
      return 'height';
    }
  };

  const getKeyboardVerticalOffset = () => {
    if (Platform.OS === 'ios') {
      return 64; // Para la barra de navegación en iOS
    } else {
      return 0; // Android maneja esto automáticamente
    }
  };

  const screenHeight = Dimensions.get('window').height;

  return (
    <View style={styles.container}>
      {/* StatusBar específico para Android */}
      <StatusBar 
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor={Platform.OS === 'android' ? '#007AFF' : undefined}
      />
      
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={getKeyboardAvoidingViewBehavior()}
          keyboardVerticalOffset={getKeyboardVerticalOffset()}
        >
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            // Configuración específica para Android
            {...(Platform.OS === 'android' && {
              nestedScrollEnabled: true,
              keyboardDismissMode: 'on-drag',
            })}
          >
            <View style={styles.header}>
              <Text style={styles.title}>PMLINK</Text>
              <Text style={styles.subtitle}>
                {Platform.OS === 'ios' ? 'iOS' : 'Android'} - Sistema de Mantenimiento
              </Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Email:</Text>
              <TextInput
                ref={emailRef}
                style={[
                  styles.input,
                  Platform.OS === 'android' && styles.inputAndroid
                ]}
                placeholder="tu@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={focusPassword}
                blurOnSubmit={false}
                // Configuración específica para Android
                {...(Platform.OS === 'android' && {
                  underlineColorAndroid: 'transparent',
                  importantForAutofill: 'yes',
                  autoCompleteType: 'email',
                })}
                // Configuración específica para iOS
                {...(Platform.OS === 'ios' && {
                  textContentType: 'emailAddress',
                  autoComplete: 'email',
                  clearButtonMode: 'while-editing',
                })}
              />

              <Text style={styles.label}>Contraseña:</Text>
              <TextInput
                ref={passwordRef}
                style={[
                  styles.input,
                  Platform.OS === 'android' && styles.inputAndroid
                ]}
                placeholder="Tu contraseña"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                // Configuración específica para Android
                {...(Platform.OS === 'android' && {
                  underlineColorAndroid: 'transparent',
                  importantForAutofill: 'yes',
                  autoCompleteType: 'password',
                })}
                // Configuración específica para iOS
                {...(Platform.OS === 'ios' && {
                  textContentType: 'password',
                  autoComplete: 'password',
                  clearButtonMode: 'while-editing',
                })}
              />

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Cargando...' : 'Iniciar Sesión'}
                </Text>
              </TouchableOpacity>

              <View style={styles.testButtons}>
                <TouchableOpacity 
                  style={styles.testButton} 
                  onPress={focusEmail}
                  activeOpacity={0.7}
                >
                  <Text style={styles.testButtonText}>
                    📧 Enfocar Email
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.testButton} 
                  onPress={focusPassword}
                  activeOpacity={0.7}
                >
                  <Text style={styles.testButtonText}>
                    🔐 Enfocar Contraseña
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.debug}>
              <Text style={styles.debugTitle}>Debug - {Platform.OS.toUpperCase()}:</Text>
              <Text style={styles.debugText}>
                Plataforma: {Platform.OS} v{Platform.Version}
              </Text>
              <Text style={styles.debugText}>
                Pantalla: {screenHeight}px altura
              </Text>
              <Text style={styles.debugText}>
                Teclado: {keyboardVisible ? '✅ Visible' : '❌ Oculto'}
              </Text>
              <Text style={styles.debugText}>
                Altura teclado: {keyboardHeight}px
              </Text>
              <Text style={styles.debugText}>
                Behavior: {getKeyboardAvoidingViewBehavior()}
              </Text>
              <Text style={styles.debugText}>
                Offset: {getKeyboardVerticalOffset()}px
              </Text>
              <Text style={styles.debugText}>
                Email: {email || '(vacío)'}
              </Text>
              <Text style={styles.debugText}>
                Contraseña: {'*'.repeat(password.length)}
              </Text>
              <Text style={styles.debugNote}>
                {Platform.OS === 'android' 
                  ? 'Android: Arrastra hacia abajo para cerrar teclado'
                  : 'iOS: Toca fuera del input para cerrar teclado'
                }
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: Platform.OS === 'android' ? 40 : 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 15,
  },
  input: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
    minHeight: 50,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputAndroid: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    textAlignVertical: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  testButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  testButton: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  debug: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  debugText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  debugNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default LoginCrossPlatform;
