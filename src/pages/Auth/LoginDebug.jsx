import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Dimensions,
  Platform
} from 'react-native';
import { supabase } from '../../services/supabase';

const LoginDebug = ({ navigation }) => {
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
    <View style={{
      flex: 1,
      padding: 20,
      backgroundColor: '#f5f5f5',
      justifyContent: 'center'
    }}>
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#333'
      }}>
        PMLINK - DEBUG VERSION
      </Text>
      
      <View style={{
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20
      }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 10,
          color: '#333'
        }}>
          Email
        </Text>
        
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: debugInfo.emailFocused ? '#007AFF' : '#ddd',
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            backgroundColor: '#fff',
            marginBottom: 20,
            minHeight: 44 // iOS recommended minimum touch target
          }}
          value={email}
          onChangeText={setEmail}
          placeholder="Ingresa tu email"
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
        />

        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 10,
          color: '#333'
        }}>
          Contraseña
        </Text>
        
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: debugInfo.passwordFocused ? '#007AFF' : '#ddd',
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            backgroundColor: '#fff',
            marginBottom: 20,
            minHeight: 44 // iOS recommended minimum touch target
          }}
          value={password}
          onChangeText={setPassword}
          placeholder="Ingresa tu contraseña"
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
        />

        <TouchableOpacity
          style={{
            backgroundColor: '#007AFF',
            padding: 15,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 20
          }}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={{
            color: 'white',
            fontSize: 16,
            fontWeight: '600'
          }}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Debug Information */}
      <View style={{
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd'
      }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 10,
          color: '#333'
        }}>
          Debug Info:
        </Text>
        <Text style={{ color: '#666', marginBottom: 5 }}>
          Platform: {Platform.OS} {Platform.Version}
        </Text>
        <Text style={{ color: '#666', marginBottom: 5 }}>
          Screen: {screenData.width}x{screenData.height}
        </Text>
        <Text style={{ color: '#666', marginBottom: 5 }}>
          Email focused: {debugInfo.emailFocused ? 'YES' : 'NO'}
        </Text>
        <Text style={{ color: '#666', marginBottom: 5 }}>
          Password focused: {debugInfo.passwordFocused ? 'YES' : 'NO'}
        </Text>
        <Text style={{ color: '#666', marginBottom: 5 }}>
          Email value: '{email}'
        </Text>
        <Text style={{ color: '#666', marginBottom: 5 }}>
          Password length: {password.length}
        </Text>
        <Text style={{ color: '#666', fontSize: 12, marginTop: 10 }}>
          Tap on inputs to test keyboard
        </Text>
      </View>
    </View>
  );
};

export default LoginDebug;
