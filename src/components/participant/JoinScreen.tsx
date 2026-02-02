import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { ParticipantService } from '../../services/participant'
import { Database } from '../../types/database'

type Participant = Database['public']['Tables']['participants']['Row']

interface JoinScreenProps {
  workshopId: string
  onJoined: (participant: Participant) => void
}

export function JoinScreen({ workshopId, onJoined }: JoinScreenProps) {
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleJoin = async () => {
    setLoading(true)

    const { participant, error } = await ParticipantService.joinWorkshop(
      workshopId,
      displayName.trim() || undefined
    )

    setLoading(false)

    if (error) {
      Alert.alert('Fehler', `Beitritt fehlgeschlagen: ${error}`)
      return
    }

    if (participant) {
      onJoined(participant)
    }
  }

  return (
    <View className="flex-1 bg-gray-50 items-center justify-center p-6">
      <View className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
          Workshop beitreten
        </Text>
        <Text className="text-sm text-gray-600 text-center mb-6">
          Gib optional deinen Namen ein
        </Text>

        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Dein Name (optional)"
          className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
          autoCapitalize="words"
          autoCorrect={false}
        />

        <TouchableOpacity
          onPress={handleJoin}
          disabled={loading}
          className={`py-4 px-6 rounded-lg ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-center text-lg">
              Jetzt beitreten
            </Text>
          )}
        </TouchableOpacity>

        <Text className="text-xs text-gray-500 text-center mt-4">
          Du trittst anonym bei. Deine Daten werden nicht gespeichert.
        </Text>
      </View>
    </View>
  )
}
