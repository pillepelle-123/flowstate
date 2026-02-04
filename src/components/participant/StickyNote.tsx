import React, { useState } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Button, Text, TextInput, Surface } from 'react-native-paper'
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
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="titleLarge" style={styles.title}>Sticky Note erstellen</Text>

        <Text variant="bodyMedium" style={styles.label}>Farbe wählen:</Text>
        <View style={styles.colorRow}>
          {COLORS.map((color) => (
            <Surface
              key={color.value}
              style={[
                styles.colorButton,
                { backgroundColor: color.value },
                selectedColor === color.value && styles.colorButtonSelected,
              ]}
              elevation={selectedColor === color.value ? 4 : 1}
            >
              <Button
                mode="text"
                onPress={() => setSelectedColor(color.value)}
                style={styles.colorButtonInner}
              >
                {''}
              </Button>
            </Surface>
          ))}
        </View>

        <Surface style={[styles.notePreview, { backgroundColor: selectedColor }]} elevation={2}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Schreibe deine Idee..."
            placeholderTextColor="#666"
            multiline
            mode="flat"
            style={styles.textInput}
            maxLength={500}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
          />
        </Surface>

        <Text variant="bodySmall" style={styles.charCount}>
          {text.length}/500 Zeichen
        </Text>

        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={!text.trim() || submitting}
          loading={submitting}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          📌 Sticky Note absenden
        </Button>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    opacity: 0.7,
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  colorButtonSelected: {
    borderWidth: 3,
    borderColor: '#111',
  },
  colorButtonInner: {
    width: '100%',
    height: '100%',
    margin: 0,
  },
  notePreview: {
    padding: 16,
    borderRadius: 12,
    minHeight: 200,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'transparent',
    fontSize: 16,
  },
  charCount: {
    textAlign: 'right',
    opacity: 0.6,
    marginBottom: 16,
  },
  submitButton: {
    borderRadius: 12,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
})
