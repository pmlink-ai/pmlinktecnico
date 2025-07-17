import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Keyboard
} from 'react-native';
import { supabase } from '../../services/supabase';

const LoginIOS = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    emailFocused: false,
    passwordFocused: false,
    keyboardHeight: 0,
    keyboardVisible: false
  });

  const screenData = Dimensions.get('window');

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardVisible(true);
      setDebugInfo(prev => ({ 
        ...prev, 
        keyboardVisible: true,
        keyboardHeight: event.endCoordinates.height 
      }));
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      setDebugInfo(prev => ({ 
        ...prev, 
        keyboardVisible: false,
        keyboardHeight: 0 
      }));
    });

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

  const handleEmailFocus = () => {
    setDebugInfo(prev => ({ ...prev, emailFocused: true }));
    console.log('Email input focused');
  };

  const handleEmailBlur = () => {
    setDebugInfo(prev => ({ ...prev, emailFocused: false }));
    console.log('Email input blurred');
  };

  const handlePasswordFocus = () => {
    setDebugInfo(prev => ({ ...prev, passwordFocused: true }));
    console.log('Password input focused');
  };

  const handlePasswordBlur = () => {
    setDebugInfo(prev => ({ ...prev, passwordFocused: false }));
    console.log('Password input blurred');
  };

  const forceKeyboard = () => {
    // Test para forzar el teclado
    Alert.alert('Test', 'Intentando forzar foco en email');
    // Aquí deberías poder enfocar el input de email
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>📱</Text>
          <Text style={styles.title}>PMLINK</Text>
          <Text style={styles.subtitle}>Sistema de Gestión de Mantenimiento</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={[
              styles.input,
              debugInfo.emailFocused && styles.inputFocused
            ]}
            placeholder="ejemplo@correo.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            onFocus={handleEmailFocus}
            onBlur={handleEmailBlur}
            returnKeyType="next"
            blurOnSubmit={false}
            // Propiedades específicas para iOS
            clearButtonMode="while-editing"
            textContentType="emailAddress"
            autoComplete="email"
            spellCheck={false}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={[
              styles.input,
              debugInfo.passwordFocused && styles.inputFocused
            ]}
            placeholder="Tu contraseña"
            placeholderTextColor="#999"
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={setPassword}
            onFocus={handlePasswordFocus}
            onBlur={handlePasswordBlur}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            // Propiedades específicas para iOS
            clearButtonMode="while-editing"
            textContentType="password"
            autoComplete="password"
            spellCheck={false}
          />

          <TouchableOpacity
            style={[
              styles.button,
              loading && styles.buttonDisabled
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={forceKeyboard}
          >
            <Text style={styles.testButtonText}>
              🧪 Test Keyboard
            </Text>
          </TouchableOpacity>
        </View>

        {/* Debug Information */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Debug Info (iOS Optimized):</Text>
          <Text style={styles.debugText}>Platform: {Platform.OS} v{Platform.Version}</Text>
          <Text style={styles.debugText}>Screen: {screenData.width}x{screenData.height}</Text>
          <Text style={styles.debugText}>Keyboard Visible: {keyboardVisible ? 'YES' : 'NO'}</Text>
          <Text style={styles.debugText}>Keyboard Height: {debugInfo.keyboardHeight}px</Text>
          <Text style={styles.debugText}>Email focused: {debugInfo.emailFocused ? 'YES' : 'NO'}</Text>
          <Text style={styles.debugText}>Password focused: {debugInfo.passwordFocused ? 'YES' : 'NO'}</Text>
          <Text style={styles.debugText}>Email: '{email}'</Text>
          <Text style={styles.debugText}>Password: {'*'.repeat(password.length)}</Text>
          <Text style={styles.debugNote}>
            Si el teclado no aparece, verifica que Expo Go tenga permisos
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    padding: 30,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#ffffff',
    marginBottom: 20,
    minHeight: 52,
    color: '#2c3e50',
  },
  inputFocused: {
    borderColor: '#3498db',
    backgroundColor: '#f8fbff',
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  debugContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    marginTop: 20,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  debugText: {
    color: '#7f8c8d',
    marginBottom: 6,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  debugNote: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default LoginIOS;
