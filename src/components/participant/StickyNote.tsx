import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { ParticipantService } from '../../services/participant'

interface StickyNoteProps {
  sessionId: string
  participantId: string
  onSubmit?: (text: string, color: string) => void
}

const COLORS = [
  { name: 'Gelb', value: '#FEF08A' },
  { name: 'Grün', value: '#BBF7D0' },
  { name: 'Blau', value: '#BFDBFE' },
  { name: 'Rosa', value: '#FBCFE8' },
  { name: 'Orange', value: '#FED7AA' },
]

export function StickyNote({ sessionId, participantId, onSubmit }: StickyNoteProps) {
  const [text, setText] = useState('')
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return

    setSubmitting(true)

    await ParticipantService.sendInteraction(sessionId, participantId, 'sticky_note', {
      text: text.trim(),
      color: selectedColor,
      timestamp: new Date().toISOString(),
    })

    setSubmitting(false)
    onSubmit?.(text.trim(), selectedColor)
    setText('')
  }

  return (
    <ScrollView className="flex-1">
      <View className="p-4">
        <Text className="text-lg font-bold mb-4">Sticky Note erstellen</Text>

        {/* Farb-Auswahl */}
        <Text className="text-sm text-gray-600 mb-2">Farbe wählen:</Text>
        <View className="flex-row mb-4 gap-2">
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color.value}
              onPress={() => setSelectedColor(color.value)}
              className={`w-12 h-12 rounded-lg ${
                selectedColor === color.value ? 'border-4 border-gray-900' : 'border border-gray-300'
              }`}
              style={{ backgroundColor: color.value }}
            />
          ))}
        </View>

        {/* Text-Eingabe */}
        <View
          className="p-4 rounded-lg min-h-[200px] mb-4"
          style={{ backgroundColor: selectedColor }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Schreibe deine Idee..."
            placeholderTextColor="#666"
            multiline
            className="text-base text-gray-900 flex-1"
            maxLength={500}
          />
        </View>

        <Text className="text-xs text-gray-500 mb-4 text-right">
          {text.length}/500 Zeichen
        </Text>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!text.trim() || submitting}
          className={`py-4 px-6 rounded-lg ${
            !text.trim() || submitting ? 'bg-gray-400' : 'bg-blue-500'
          }`}
        >
          <Text className="text-white font-bold text-center text-lg">
            {submitting ? 'Sende...' : '📌 Sticky Note absenden'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
