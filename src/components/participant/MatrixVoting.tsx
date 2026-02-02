import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import { ParticipantService } from '../../services/participant'

interface MatrixVotingProps {
  sessionId: string
  participantId: string
  xLabel?: string
  yLabel?: string
  onVote?: (x: number, y: number) => void
}

export function MatrixVoting({
  sessionId,
  participantId,
  xLabel = 'Aufwand',
  yLabel = 'Nutzen',
  onVote,
}: MatrixVotingProps) {
  const [voted, setVoted] = useState(false)
  const [votePosition, setVotePosition] = useState<{ x: number; y: number } | null>(null)

  const handleTap = async (x: number, y: number) => {
    if (voted) return

    // Normalisiere auf 0-100
    const normalizedX = Math.round((x / 300) * 100)
    const normalizedY = Math.round((1 - y / 300) * 100)

    setVotePosition({ x: normalizedX, y: normalizedY })
    setVoted(true)

    await ParticipantService.sendInteraction(sessionId, participantId, 'vote_2d', {
      x: normalizedX,
      y: normalizedY,
      timestamp: new Date().toISOString(),
    })

    onVote?.(normalizedX, normalizedY)
  }

  const tap = Gesture.Tap().onEnd((event) => {
    handleTap(event.x, event.y)
  })

  return (
    <View className="items-center">
      <Text className="text-lg font-bold mb-4">Platziere deinen Punkt</Text>

      <View className="relative">
        {/* Y-Achse Label */}
        <View className="absolute -left-16 top-0 bottom-0 justify-center">
          <Text className="text-sm text-gray-600 transform -rotate-90">{yLabel}</Text>
        </View>

        {/* Matrix */}
        <GestureDetector gesture={tap}>
          <View className="w-[300px] h-[300px] bg-gray-100 border-2 border-gray-300 rounded-lg">
            {/* Raster */}
            <View className="absolute inset-0">
              <View className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300" />
              <View className="absolute top-1/2 left-0 right-0 h-px bg-gray-300" />
            </View>

            {/* Vote Marker */}
            {votePosition && (
              <View
                className="absolute w-4 h-4 bg-blue-500 rounded-full -ml-2 -mt-2"
                style={{
                  left: `${votePosition.x}%`,
                  top: `${100 - votePosition.y}%`,
                }}
              />
            )}
          </View>
        </GestureDetector>

        {/* X-Achse Label */}
        <View className="absolute -bottom-8 left-0 right-0">
          <Text className="text-sm text-gray-600 text-center">{xLabel}</Text>
        </View>
      </View>

      {voted && (
        <TouchableOpacity
          onPress={() => {
            setVoted(false)
            setVotePosition(null)
          }}
          className="mt-6 bg-gray-500 py-2 px-4 rounded-lg"
        >
          <Text className="text-white font-semibold">Zurücksetzen</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
