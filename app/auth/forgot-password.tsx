import React, { useState } from 'react'
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { Text, TextInput, Button, Surface, Snackbar } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { authService } from '../../src/services/auth'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleResetPassword = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email')
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword(email)
      setSuccess(true)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <View style={styles.container}>
        <Surface style={styles.surface} elevation={2}>
          <Text variant="displaySmall" style={styles.title}>
            Check Your Email
          </Text>
          <Text variant="bodyLarge" style={styles.successText}>
            We've sent a password reset link to {email}
          </Text>
          <Text variant="bodyMedium" style={styles.infoText}>
            Click the link in the email to reset your password.
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/auth/login')}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Back to Login
          </Button>
        </Surface>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.surface} elevation={2}>
          <Text variant="displaySmall" style={styles.title}>
            Reset Password
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Enter your email to receive a reset link
          </Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
            disabled={loading}
          />

          <Button
            mode="contained"
            onPress={handleResetPassword}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Send Reset Link
          </Button>

          <Button
            mode="text"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            Back to Login
          </Button>
        </Surface>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setError(''),
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
    justifyContent: 'center',
    padding: 24,
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
  successText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  infoText: {
    opacity: 0.7,
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    marginBottom: 24,
  },
  button: {
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  backButton: {
    alignSelf: 'center',
  },
})
