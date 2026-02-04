import React, { useState, useEffect } from 'react'
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { Text, TextInput, Button, Surface, Snackbar } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'

export default function LoginScreen() {
  const router = useRouter()
  const { signIn, error, setError } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await signIn(email, password)
      router.replace('/dashboard')
    } catch (err: any) {
      const errorMsg = err?.message || ''
      
      if (errorMsg.includes('Email not confirmed')) {
        setError('Email not confirmed. Please check your inbox.')
      } else if (errorMsg.includes('Invalid login credentials')) {
        setError('Invalid email or password')
      } else {
        setError('Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.surface} elevation={2}>
          <Text variant="displaySmall" style={styles.title}>
            Welcome Back
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Sign in to continue
          </Text>

          <View style={styles.inputWrapper}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="flat"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
              disabled={loading}
              underlineColor="transparent"
              underlineStyle={{ height: 0 }}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="flat"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              style={styles.input}
              disabled={loading}
              underlineColor="transparent"
              underlineStyle={{ height: 0 }}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
          </View>

          <Button
            mode="text"
            onPress={() => router.push('/auth/forgot-password')}
            style={styles.forgotButton}
            textColor="#ffffff"
          >
            Forgot Password?
          </Button>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Sign In
          </Button>

          <View style={styles.registerContainer}>
            <Text variant="bodyMedium">Don't have an account? </Text>
            <Button
              mode="text"
              onPress={() => router.push('/auth/register')}
              compact
              textColor="#ffffff"
            >
              Sign Up
            </Button>
          </View>
        </Surface>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        duration={5000}
        style={styles.snackbar}
        action={{
          label: 'Dismiss',
          onPress: () => setError(null),
        }}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  surface: {
    padding: 24,
    borderRadius: 16,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 32,
    textAlign: 'center',
  },
  inputWrapper: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
  },
  input: {
    backgroundColor: 'transparent',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  button: {
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  snackbar: {
    bottom: 20,
  },
})
