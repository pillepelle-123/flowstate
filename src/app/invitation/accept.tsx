import React, { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Button, ActivityIndicator } from 'react-native-paper'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { InvitationService } from '../../services/invitation'
import { useAuthStore } from '../../stores/authStore'

export default function AcceptInvitationScreen() {
  const router = useRouter()
  const { token } = useLocalSearchParams<{ token: string }>()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invitation, setInvitation] = useState<any>(null)

  useEffect(() => {
    loadInvitation()
  }, [token])

  const loadInvitation = async () => {
    if (!token) {
      setError('Invalid invitation link')
      setLoading(false)
      return
    }

    try {
      const inv = await InvitationService.getInvitationByToken(token)
      if (!inv) {
        setError('Invitation not found')
      } else if (inv.status !== 'pending') {
        setError('Invitation already used')
      } else if (new Date(inv.expires_at) < new Date()) {
        setError('Invitation has expired')
      } else {
        setInvitation(inv)
      }
    } catch (err) {
      setError('Failed to load invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/invitation/accept?token=${token}`)
      return
    }

    setLoading(true)
    try {
      const workshopId = await InvitationService.acceptInvitation(token, user.id)
      router.replace(`/workshop/${workshopId}/edit`)
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation')
      setLoading(false)
    }
  }

  const handleDecline = async () => {
    setLoading(true)
    try {
      await InvitationService.declineInvitation(token)
      router.replace('/dashboard')
    } catch (err) {
      setError('Failed to decline invitation')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>Invitation Error</Text>
        <Text variant="bodyLarge" style={styles.error}>{error}</Text>
        <Button mode="contained" onPress={() => router.replace('/dashboard')} style={styles.button}>
          Go to Dashboard
        </Button>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Workshop Invitation</Text>
      <Text variant="bodyLarge" style={styles.message}>
        You've been invited to collaborate on a workshop
      </Text>
      {!user && (
        <Text variant="bodyMedium" style={styles.info}>
          Please log in or register to accept this invitation
        </Text>
      )}
      <View style={styles.actions}>
        <Button mode="contained" onPress={handleAccept} style={styles.button}>
          {user ? 'Accept' : 'Login to Accept'}
        </Button>
        <Button mode="outlined" onPress={handleDecline} style={styles.button}>
          Decline
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    marginBottom: 8,
    textAlign: 'center',
  },
  info: {
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.7,
  },
  error: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#d32f2f',
  },
  actions: {
    gap: 12,
  },
  button: {
    marginTop: 8,
  },
})
