import React, { useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useRouter, useSegments } from 'expo-router'
import { useAuthStore } from '../../stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, initialized, initialize } = useAuthStore()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialized])

  useEffect(() => {
    if (!initialized || loading) return

    const inAuthGroup = segments[0] === 'auth'

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/auth/login')
    } else if (user && inAuthGroup) {
      // Redirect to dashboard if already authenticated
      router.replace('/dashboard')
    }
  }, [user, loading, initialized, segments])

  if (!initialized || loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return <>{children}</>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
