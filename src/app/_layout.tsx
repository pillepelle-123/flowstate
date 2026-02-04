import { Stack } from 'expo-router'
import { useEffect } from 'react'
import { PaperProvider } from 'react-native-paper'
import { UpdatesService } from '../services/updates'
import { lightTheme } from '../theme/paperTheme'
import { ProtectedRoute } from '../components/shared/ProtectedRoute'
import '../../global.css'

export default function RootLayout() {
  useEffect(() => {
    UpdatesService.autoUpdate()
  }, [])

  return (
    <PaperProvider theme={lightTheme}>
      <ProtectedRoute>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: lightTheme.colors.secondary,
            },
            headerTintColor: lightTheme.colors.surface,
            headerTitleStyle: {
              color: lightTheme.colors.surface,
            },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'FlowState', headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ title: 'Sign In', headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ title: 'Sign Up', headerShown: false }} />
          <Stack.Screen name="auth/forgot-password" options={{ title: 'Reset Password', headerShown: false }} />
          <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
          <Stack.Screen name="timer-test" options={{ title: 'Timer Test' }} />
          <Stack.Screen name="moderator" options={{ title: 'Moderator' }} />
          <Stack.Screen name="display" options={{ title: 'Beamer Display', headerShown: false }} />
          <Stack.Screen name="planner" options={{ title: 'Workshop Planen' }} />
          <Stack.Screen name="participant" options={{ title: 'Teilnehmer' }} />
          <Stack.Screen name="join/[id]" options={{ title: 'Beitreten', headerShown: false }} />
          <Stack.Screen name="phase2-test" options={{ title: 'Phase 2 Tests' }} />
        </Stack>
      </ProtectedRoute>
    </PaperProvider>
  )
}
