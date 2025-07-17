import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LoginBasic({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const handleLogin = async () => {
    Alert.alert(
      'Prueba de Login',
      `Email: ${email}\nPassword: ${password ? '****' : 'vacío'}`,
      [{ text: 'OK' }]
    );
  };

  const handleEmailFocus = () => {
    console.log('Email field focused');
    setFocused('email');
  };

  const handlePasswordFocus = () => {
    console.log('Password field focused');
    setFocused('password');
  };

  const handleEmailBlur = () => {
    console.log('Email field blurred');
    setFocused('');
  };

  const handlePasswordBlur = () => {
    console.log('Password field blurred');
    setFocused('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PMLink Cliente</Text>
        <Text style={styles.subtitle}>Prueba Básica de Teclado</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Campos de Entrada:</Text>
        
        <View style={styles.inputSection}>
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={[
              styles.input,
              focused === 'email' && styles.inputFocused
            ]}
            value={email}
            onChangeText={(text) => {
              console.log('Email changed:', text);
              setEmail(text);
            }}
            onFocus={handleEmailFocus}
            onBlur={handleEmailBlur}
            placeholder="Escribe tu email aquí"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            editable={true}
            selectTextOnFocus={true}
          />
        </View>
        
        <View style={styles.inputSection}>
          <Text style={styles.label}>Contraseña:</Text>
          <TextInput
            style={[
              styles.input,
              focused === 'password' && styles.inputFocused
            ]}
            value={password}
            onChangeText={(text) => {
              console.log('Password changed:', text);
              setPassword(text);
            }}
            onFocus={handlePasswordFocus}
            onBlur={handlePasswordBlur}
            placeholder="Escribe tu contraseña aquí"
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            editable={true}
            selectTextOnFocus={true}
          />
        </View>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Probar Login</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.debugSection}>
        <Text style={styles.debugTitle}>Debug Info:</Text>
        <Text style={styles.debugText}>Campo activo: {focused || 'ninguno'}</Text>
        <Text style={styles.debugText}>Email: "{email}"</Text>
        <Text style={styles.debugText}>Password: "{password ? '****' : 'vacío'}"</Text>
        <Text style={styles.debugText}>Chars email: {email.length}</Text>
        <Text style={styles.debugText}>Chars password: {password.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFA500',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderColor: '#dddddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#333333',
  },
  inputFocused: {
    borderColor: '#FFA500',
    backgroundColor: '#fff8f0',
  },
  button: {
    backgroundColor: '#FFA500',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  debugSection: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  debugText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});
