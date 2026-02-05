import React from 'react'
import { View, Text, Modal, TouchableOpacity } from 'react-native'
import { ReadyButton } from './ReadyButton'
import { MatrixVoting } from './MatrixVoting'
import { StickyNote } from './StickyNote'

interface InteractionContainerProps {
  sessionId: string
  participantId: string
  interactionType: 'ready' | 'matrix' | 'sticky' | null
  onClose: () => void
}

export function InteractionContainer({
  sessionId,
  participantId,
  interactionType,
  onClose,
}: InteractionContainerProps) {
  if (!interactionType) return null

  return (
    <Modal visible={!!interactionType} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white p-4 border-b border-gray-200 flex-row justify-between items-center">
          <Text className="text-xl font-bold">
            {interactionType === 'ready' ? 'Bereit melden' : interactionType === 'matrix' ? '2D-Matrix Voting' : 'Sticky Note'}
          </Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <Text className="text-2xl text-gray-600">×</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 p-6 justify-center">
          {interactionType === 'ready' && (
            <ReadyButton
              sessionId={sessionId}
              participantId={participantId}
              onReady={() => {
                setTimeout(onClose, 1500)
              }}
            />
          )}

          {interactionType === 'matrix' && (
            <MatrixVoting
              sessionId={sessionId}
              participantId={participantId}
              onVote={() => {
                setTimeout(onClose, 2000)
              }}
            />
          )}

          {interactionType === 'sticky' && (
            <StickyNote
              sessionId={sessionId}
              participantId={participantId}
              onSubmit={() => {
                setTimeout(onClose, 1000)
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  )
}
