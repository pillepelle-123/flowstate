import { View, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Text, Button, Surface } from 'react-native-paper'
import { useEffect } from 'react'
import { useAuthStore } from '../src/stores/authStore'

export default function Index() {
  const router = useRouter()
  const { user, initialized } = useAuthStore()

  useEffect(() => {
    if (initialized && user) {
      router.replace('/dashboard')
    }
  }, [user, initialized])

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={0}>
        <Text variant="displayMedium" style={styles.title}>FlowState</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>Workshop Operating System</Text>
      </Surface>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={() => router.push('/auth/login')}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Sign In
        </Button>

        <Button 
          mode="outlined" 
          onPress={() => router.push('/auth/register')}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Create Account
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    backgroundColor: 'transparent',
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },
  button: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
})
