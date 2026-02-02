import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native'
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
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>{session?.id ? 'Session bearbeiten' : 'Neue Session'}</Text>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
            <Text style={styles.label}>Titel *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(title) => setFormData({ ...formData, title })}
              placeholder="z.B. Brainstorming"
            />

            <Text style={styles.label}>Typ</Text>
            <View style={styles.typeGrid}>
              {SESSION_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[styles.typeButton, formData.type === type.value && styles.typeButtonActive]}
                  onPress={() => setFormData({ ...formData, type: type.value })}
                >
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text style={[styles.typeLabel, formData.type === type.value && styles.typeLabelActive]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Dauer (Minuten)</Text>
            <TextInput
              style={styles.input}
              value={String(formData.planned_duration)}
              onChangeText={(text) => setFormData({ ...formData, planned_duration: parseInt(text) || 0 })}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Beschreibung</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(description) => setFormData({ ...formData, description })}
              placeholder="Optionale Beschreibung"
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setFormData({ ...formData, is_buffer: !formData.is_buffer })}
            >
              <View style={[styles.checkbox, formData.is_buffer && styles.checkboxChecked]}>
                {formData.is_buffer && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Als Buffer-Session markieren</Text>
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Speichern</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: '#ffffff', borderRadius: 16, padding: 24, maxHeight: '90%' },
  scrollView: { flexGrow: 0 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, color: '#111827' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeButton: { width: '31%', padding: 12, borderRadius: 8, borderWidth: 2, borderColor: '#d1d5db', backgroundColor: '#ffffff', alignItems: 'center' },
  typeButtonActive: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  typeIcon: { fontSize: 24, marginBottom: 4 },
  typeLabel: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  typeLabelActive: { color: '#3b82f6' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#d1d5db', marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  checkmark: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  checkboxLabel: { fontSize: 16, color: '#374151' },
  buttonContainer: { flexDirection: 'row', gap: 12, marginTop: 24 },
  button: { flex: 1, padding: 16, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#d1d5db' },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#6b7280' },
  saveButton: { backgroundColor: '#3b82f6' },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
})
