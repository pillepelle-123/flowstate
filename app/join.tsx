import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { QRCodeScanner } from '../src/components/participant/QRCodeScanner'
import { JoinScreen } from '../src/components/participant/JoinScreen'
import { ParticipantDashboard } from '../src/components/participant/ParticipantDashboard'
import { Database } from '../src/types/database'

type Participant = Database['public']['Tables']['participants']['Row']

type ViewMode = 'scan' | 'manual' | 'join' | 'dashboard'

export default function JoinRoute() {
  const { workshopId: urlWorkshopId } = useLocalSearchParams<{ workshopId?: string }>()
  const [mode, setMode] = useState<ViewMode>('scan')
  const [workshopId, setWorkshopId] = useState('')
  const [manualId, setManualId] = useState('')
  const [participant, setParticipant] = useState<Participant | null>(null)

  useEffect(() => {
    if (urlWorkshopId) {
      setWorkshopId(urlWorkshopId)
      setMode('join')
    }
  }, [urlWorkshopId])

  const handleScan = (scannedId: string) => {
    router.push(`/join?workshopId=${scannedId}`)
  }

  const handleManualSubmit = () => {
    if (manualId.trim()) {
      router.push(`/join?workshopId=${manualId.trim()}`)
    }
  }

  const handleJoined = (joinedParticipant: Participant) => {
    setParticipant(joinedParticipant)
    setMode('dashboard')
  }

  if (mode === 'dashboard' && participant) {
    return <ParticipantDashboard workshopId={workshopId} participant={participant} />
  }

  if (mode === 'join') {
    return <JoinScreen workshopId={workshopId} onJoined={handleJoined} />
  }

  if (mode === 'manual') {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <View className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
          <Text className="text-2xl font-bold text-gray-900 text-center mb-6">
            Workshop-ID eingeben
          </Text>

          <TextInput
            value={manualId}
            onChangeText={setManualId}
            placeholder="Workshop-ID"
            className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            onPress={handleManualSubmit}
            className="bg-blue-500 py-4 px-6 rounded-lg mb-3"
          >
            <Text className="text-white font-bold text-center text-lg">
              Beitreten
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMode('scan')}
            className="py-3"
          >
            <Text className="text-blue-500 text-center font-semibold">
              Zurück zum Scanner
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // Default: QR-Scanner
  return (
    <View className="flex-1">
      <QRCodeScanner onScan={handleScan} />
      
      <View className="absolute bottom-8 left-0 right-0 items-center">
        <TouchableOpacity
          onPress={() => setMode('manual')}
          className="bg-white px-6 py-3 rounded-lg shadow-lg"
        >
          <Text className="text-gray-900 font-semibold">
            Manuelle Eingabe
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
