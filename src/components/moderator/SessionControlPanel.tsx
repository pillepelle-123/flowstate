import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { MotiView } from 'moti'
import { Database } from '../../types/database'
import { BufferManager, BufferAdjustment } from '../../utils/buffer'

type Session = Database['public']['Tables']['sessions']['Row']

interface SessionControlPanelProps {
  currentSession: Session | null
  allSessions: Session[]
  workshopEndTime: Date
  participantCount: number
  maxParticipants?: number
  status: 'idle' | 'running' | 'paused'
  onExtendTime: (minutes: number, adjustment: BufferAdjustment) => void
  onPause: () => void
  onReset: () => void
  onNextSession: () => void
  onPushMaterial: () => void
  onStartInteraction: () => void
}

export function SessionControlPanel({
  currentSession,
  allSessions,
  workshopEndTime,
  participantCount,
  maxParticipants,
  status,
  onExtendTime,
  onPause,
  onReset,
  onNextSession,
  onPushMaterial,
  onStartInteraction,
}: SessionControlPanelProps) {
  const [isExtending, setIsExtending] = useState(false)

  const handleExtendTime = () => {
    if (!currentSession) return
    
    setIsExtending(true)

    try {
      const adjustment = BufferManager.calculateBufferAdjustment(
        allSessions,
        currentSession.id,
        5,
        workshopEndTime
      )

      const confirmed = window.confirm(`Zeit verlängern\n\n${adjustment.message}\n\nBestätigen?`)
      if (confirmed) {
        onExtendTime(5, adjustment)
      }
    } finally {
      setIsExtending(false)
    }
  }

  const handlePause = () => {
    onPause()
  }

  const handleNextSession = () => {
    const confirmed = window.confirm('Möchtest du zur nächsten Session wechseln?')
    if (confirmed) {
      onNextSession()
    }
  }

  if (!currentSession) {
    return (
      <View className="p-6 bg-gray-100 rounded-2xl">
        <Text className="text-center text-gray-500">Keine aktive Session</Text>
      </View>
    )
  }

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300 }}
      className="p-6 bg-white rounded-2xl shadow-lg"
    >
      <Text className="text-2xl font-bold text-gray-900 mb-2">
        {currentSession.title}
      </Text>
      <Text className="text-sm text-gray-500 mb-6 capitalize">
        {currentSession.type}
      </Text>

      <View className="flex-row items-center mb-6 p-3 bg-blue-50 rounded-lg">
        <Text className="text-lg font-semibold text-blue-900">
          Teilnehmer: {participantCount}
          {maxParticipants && `/${maxParticipants}`}
        </Text>
      </View>

      <View className="flex-row gap-3 mb-4">
        <TouchableOpacity
          onPress={handleExtendTime}
          disabled={isExtending}
          className="flex-1 bg-green-500 py-4 rounded-xl items-center active:bg-green-600"
        >
          <Text className="text-white font-bold text-lg">+5 Min</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePause}
          className={`flex-1 py-4 rounded-xl items-center ${
            status === 'paused' ? 'bg-green-500 active:bg-green-600' : 'bg-yellow-500 active:bg-yellow-600'
          }`}
        >
          <Text className="text-white font-bold text-lg">
            {status === 'paused' ? 'Fortsetzen' : 'Pause'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNextSession}
          className="flex-1 bg-blue-500 py-4 rounded-xl items-center active:bg-blue-600"
        >
          <Text className="text-white font-bold text-lg">Weiter</Text>
        </TouchableOpacity>
      </View>

      {status === 'paused' && (
        <View className="mb-4">
          <TouchableOpacity
            onPress={onReset}
            className="w-full bg-red-500 py-4 rounded-xl items-center active:bg-red-600"
          >
            <Text className="text-white font-bold text-lg">Reset</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={onPushMaterial}
          className="flex-1 bg-purple-500 py-3 rounded-xl items-center active:bg-purple-600"
        >
          <Text className="text-white font-semibold">Material pushen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onStartInteraction}
          className="flex-1 bg-indigo-500 py-3 rounded-xl items-center active:bg-indigo-600"
        >
          <Text className="text-white font-semibold">Interaktion</Text>
        </TouchableOpacity>
      </View>

      {currentSession.description && (
        <View className="mt-4 p-3 bg-gray-50 rounded-lg">
          <Text className="text-sm text-gray-700">{currentSession.description}</Text>
        </View>
      )}
    </MotiView>
  )
}
