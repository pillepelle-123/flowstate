import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Modal } from 'react-native'
import { Text, TextInput, Button, Chip, Portal, useTheme } from 'react-native-paper'
import { Database } from '../../types/database'

type SessionType = Database['public']['Enums']['session_type']

interface SessionEditorProps {
  visible: boolean
  session?: any
  onSave: (session: any) => void
  onCancel: () => void
}

const SESSION_TYPES: { value: SessionType; label: string; icon: string }[] = [
  { value: 'input', label: 'Input', icon: '📝' },
  { value: 'interaction', label: 'Interaktion', icon: '💬' },
  { value: 'individual', label: 'Einzelarbeit', icon: '👤' },
  { value: 'group', label: 'Gruppenarbeit', icon: '👥' },
  { value: 'break', label: 'Pause', icon: '☕' },
  { value: 'orga', label: 'Organisation', icon: '📋' },
]

export function SessionEditor({ visible, session, onSave, onCancel }: SessionEditorProps) {
  const theme = useTheme()
  const [formData, setFormData] = useState({
    title: session?.title || '',
    type: session?.type || 'input' as SessionType,
    planned_duration: session?.planned_duration || 30,
    description: session?.description || '',
    is_buffer: session?.is_buffer || false,
  })

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert('Bitte Titel eingeben')
      return
    }
    onSave({ ...session, ...formData })
  }

  return (
    <Portal>
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: theme.colors.surface }]}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              {session?.id ? 'Edit Session' : 'New Session'}
            </Text>

            <ScrollView style={styles.scrollView}>
              <Text variant="labelLarge" style={styles.label}>Title *</Text>
              <TextInput
                mode="outlined"
                value={formData.title}
                onChangeText={(title) => setFormData({ ...formData, title })}
                placeholder="e.g. Brainstorming"
                style={styles.input}
              />

              <Text variant="labelLarge" style={styles.label}>Type</Text>
              <View style={styles.typeGrid}>
                {SESSION_TYPES.map((type) => (
                  <Chip
                    key={type.value}
                    selected={formData.type === type.value}
                    onPress={() => setFormData({ ...formData, type: type.value })}
                    style={styles.typeChip}
                  >
                    {type.icon} {type.label}
                  </Chip>
                ))}
              </View>

              <Text variant="labelLarge" style={styles.label}>Duration (minutes)</Text>
              <TextInput
                mode="outlined"
                value={String(formData.planned_duration)}
                onChangeText={(text) => setFormData({ ...formData, planned_duration: parseInt(text) || 0 })}
                keyboardType="numeric"
                style={styles.input}
              />

              <Text variant="labelLarge" style={styles.label}>Description</Text>
              <TextInput
                mode="outlined"
                value={formData.description}
                onChangeText={(description) => setFormData({ ...formData, description })}
                placeholder="Optional description"
                multiline
                numberOfLines={3}
                style={styles.input}
              />

              <Chip
                selected={formData.is_buffer}
                onPress={() => setFormData({ ...formData, is_buffer: !formData.is_buffer })}
                style={styles.bufferChip}
              >
                Mark as buffer session
              </Chip>

              <View style={styles.buttonContainer}>
                <Button mode="outlined" onPress={onCancel} style={styles.button}>
                  Cancel
                </Button>
                <Button mode="contained" onPress={handleSave} style={styles.button}>
                  Save
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Portal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    borderRadius: 16,
    padding: 24,
    maxHeight: '90%',
  },
  scrollView: {
    flexGrow: 0,
  },
  modalTitle: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    marginBottom: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    marginBottom: 8,
  },
  bufferChip: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
})
