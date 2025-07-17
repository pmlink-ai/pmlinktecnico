import React, { useState } from 'react';
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
  StyleSheet
} from 'react-native';
import { supabase } from '../../services/supabase';

const LoginKeyboard = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    emailFocused: false,
    passwordFocused: false,
    keyboardHeight: 0
  });

  const screenData = Dimensions.get('window');

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>PMLINK</Text>
          <Text style={styles.subtitle}>Sistema de Gestión de Mantenimiento</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[
              styles.input,
              debugInfo.emailFocused && styles.inputFocused
            ]}
            value={email}
            onChangeText={setEmail}
            placeholder="Ingresa tu email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            onFocus={handleEmailFocus}
            onBlur={handleEmailBlur}
            editable={true}
            selectTextOnFocus={true}
            returnKeyType="next"
            blurOnSubmit={false}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={[
              styles.input,
              debugInfo.passwordFocused && styles.inputFocused
            ]}
            value={password}
            onChangeText={setPassword}
            placeholder="Ingresa tu contraseña"
            placeholderTextColor="#999"
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            textContentType="password"
            onFocus={handlePasswordFocus}
            onBlur={handlePasswordBlur}
            editable={true}
            selectTextOnFocus={true}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
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
        </View>

        {/* Debug Information */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Debug Info (KeyboardAvoidingView):</Text>
          <Text style={styles.debugText}>Platform: {Platform.OS} {Platform.Version}</Text>
          <Text style={styles.debugText}>Screen: {screenData.width}x{screenData.height}</Text>
          <Text style={styles.debugText}>Email focused: {debugInfo.emailFocused ? 'YES' : 'NO'}</Text>
          <Text style={styles.debugText}>Password focused: {debugInfo.passwordFocused ? 'YES' : 'NO'}</Text>
          <Text style={styles.debugText}>Email value: '{email}'</Text>
          <Text style={styles.debugText}>Password length: {password.length}</Text>
          <Text style={styles.debugText}>Keyboard behavior: {Platform.OS === 'ios' ? 'padding' : 'height'}</Text>
          <Text style={styles.debugNote}>
            Toca los inputs para probar el teclado con KeyboardAvoidingView
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
    minHeight: 50,
  },
  inputFocused: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  debugContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 20,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  debugText: {
    color: '#666',
    marginBottom: 5,
    fontSize: 14,
  },
  debugNote: {
    color: '#999',
    fontSize: 12,
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default LoginKeyboard;
