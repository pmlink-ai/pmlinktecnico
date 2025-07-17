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
  TouchableWithoutFeedback
} from 'react-native';
import { supabase } from '../../services/supabase';

const LoginFinal = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
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

  const focusEmail = () => {
    emailRef.current?.focus();
  };

  const focusPassword = () => {
    passwordRef.current?.focus();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>PMLINK</Text>
            <Text style={styles.subtitle}>Sistema de Mantenimiento</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email:</Text>
            <TextInput
              ref={emailRef}
              style={styles.input}
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
            />

            <Text style={styles.label}>Contraseña:</Text>
            <TextInput
              ref={passwordRef}
              style={styles.input}
              placeholder="Tu contraseña"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Cargando...' : 'Iniciar Sesión'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.testButton} 
              onPress={focusEmail}
            >
              <Text style={styles.testButtonText}>
                🎯 Enfocar Email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.testButton} 
              onPress={focusPassword}
            >
              <Text style={styles.testButtonText}>
                🎯 Enfocar Contraseña
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.debug}>
            <Text style={styles.debugTitle}>Estado del Teclado:</Text>
            <Text style={styles.debugText}>
              Teclado visible: {keyboardVisible ? '✅ SÍ' : '❌ NO'}
            </Text>
            <Text style={styles.debugText}>
              Plataforma: {Platform.OS}
            </Text>
            <Text style={styles.debugText}>
              Email: {email || '(vacío)'}
            </Text>
            <Text style={styles.debugText}>
              Contraseña: {'*'.repeat(password.length)}
            </Text>
            <Text style={styles.debugNote}>
              Usa los botones de "Enfocar" para probar manualmente
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
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
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
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
  },
  debugNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default LoginFinal;
