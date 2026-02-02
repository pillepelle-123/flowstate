import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Database } from '../../types/database'

type BufferStrategy = Database['public']['Enums']['buffer_strategy']

interface WorkshopFormData {
  title: string
  description: string
  date: string
  totalDuration: number
  bufferStrategy: BufferStrategy
}

interface WorkshopFormProps {
  initialData?: Partial<WorkshopFormData>
  onSubmit: (data: WorkshopFormData) => void
  onCancel?: () => void
}

export function WorkshopForm({ initialData, onSubmit, onCancel }: WorkshopFormProps) {
  const [formData, setFormData] = useState<WorkshopFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    totalDuration: initialData?.totalDuration || 180,
    bufferStrategy: initialData?.bufferStrategy || 'distributed',
  })

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      alert('Bitte Titel eingeben')
      return
    }
    onSubmit(formData)
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Workshop-Titel *</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(title) => setFormData({ ...formData, title })}
          placeholder="z.B. Design Thinking Workshop"
        />

        <Text style={styles.label}>Beschreibung</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(description) => setFormData({ ...formData, description })}
          placeholder="Kurze Beschreibung des Workshops"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Datum</Text>
        <TextInput
          style={styles.input}
          value={formData.date}
          onChangeText={(date) => setFormData({ ...formData, date })}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Gesamtdauer (Minuten)</Text>
        <TextInput
          style={styles.input}
          value={String(formData.totalDuration)}
          onChangeText={(text) => setFormData({ ...formData, totalDuration: parseInt(text) || 0 })}
          keyboardType="numeric"
          placeholder="180"
        />

        <Text style={styles.label}>Buffer-Strategie</Text>
        <View style={styles.strategyContainer}>
          {(['distributed', 'fixed', 'end'] as BufferStrategy[]).map((strategy) => (
            <TouchableOpacity
              key={strategy}
              style={[
                styles.strategyButton,
                formData.bufferStrategy === strategy && styles.strategyButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, bufferStrategy: strategy })}
            >
              <Text
                style={[
                  styles.strategyText,
                  formData.bufferStrategy === strategy && styles.strategyTextActive,
                ]}
              >
                {strategy === 'distributed' && 'Verteilt'}
                {strategy === 'fixed' && 'Fest'}
                {strategy === 'end' && 'Am Ende'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {onCancel && (
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Abbrechen</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Speichern</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  form: { padding: 24 },
  label: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, color: '#111827' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  strategyContainer: { flexDirection: 'row', gap: 12 },
  strategyButton: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 2, borderColor: '#d1d5db', backgroundColor: '#ffffff', alignItems: 'center' },
  strategyButtonActive: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  strategyText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  strategyTextActive: { color: '#3b82f6' },
  buttonContainer: { flexDirection: 'row', gap: 12, marginTop: 32 },
  button: { flex: 1, padding: 16, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#d1d5db' },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#6b7280' },
  submitButton: { backgroundColor: '#3b82f6' },
  submitButtonText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
})
