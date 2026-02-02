import { Stack } from 'expo-router'
import { useEffect } from 'react'
import { UpdatesService } from '../src/services/updates'
import '../global.css'

export default function RootLayout() {
  useEffect(() => {
    // Auto-Update beim App-Start
    UpdatesService.autoUpdate()
  }, [])

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'FlowState' }} />
      <Stack.Screen name="timer-test" options={{ title: 'Timer Test' }} />
      <Stack.Screen name="moderator" options={{ title: 'Moderator' }} />
      <Stack.Screen name="display" options={{ title: 'Beamer Display', headerShown: false }} />
      <Stack.Screen name="planner" options={{ title: 'Workshop Planen' }} />
      <Stack.Screen name="participant" options={{ title: 'Teilnehmer' }} />
      <Stack.Screen name="join/[id]" options={{ title: 'Beitreten', headerShown: false }} />
      <Stack.Screen name="phase2-test" options={{ title: 'Phase 2 Tests' }} />
    </Stack>
  )
}
