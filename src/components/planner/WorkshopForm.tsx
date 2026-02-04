import React, { useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, TextInput, Button, SegmentedButtons, useTheme } from 'react-native-paper'
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
  const theme = useTheme()
  const [formData, setFormData] = useState<WorkshopFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    totalDuration: initialData?.totalDuration || 180,
    bufferStrategy: initialData?.bufferStrategy || 'distributed',
  })

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      alert('Please enter a title')
      return
    }
    onSubmit(formData)
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text variant="labelLarge" style={styles.label}>Workshop Title *</Text>
        <TextInput
          mode="outlined"
          value={formData.title}
          onChangeText={(title) => setFormData({ ...formData, title })}
          placeholder="e.g. Design Thinking Workshop"
          style={styles.input}
        />

        <Text variant="labelLarge" style={styles.label}>Description</Text>
        <TextInput
          mode="outlined"
          value={formData.description}
          onChangeText={(description) => setFormData({ ...formData, description })}
          placeholder="Brief workshop description"
          multiline
          numberOfLines={4}
          style={styles.input}
        />

        <Text variant="labelLarge" style={styles.label}>Date</Text>
        <TextInput
          mode="outlined"
          value={formData.date}
          onChangeText={(date) => setFormData({ ...formData, date })}
          placeholder="YYYY-MM-DD"
          style={styles.input}
        />

        <Text variant="labelLarge" style={styles.label}>Total Duration (minutes)</Text>
        <TextInput
          mode="outlined"
          value={String(formData.totalDuration)}
          onChangeText={(text) => setFormData({ ...formData, totalDuration: parseInt(text) || 0 })}
          keyboardType="numeric"
          placeholder="180"
          style={styles.input}
        />

        <Text variant="labelLarge" style={styles.label}>Buffer Strategy</Text>
        <SegmentedButtons
          value={formData.bufferStrategy}
          onValueChange={(value) => setFormData({ ...formData, bufferStrategy: value as BufferStrategy })}
          buttons={[
            { value: 'distributed', label: 'Distributed' },
            { value: 'fixed', label: 'Fixed' },
            { value: 'end', label: 'End' },
          ]}
          style={styles.segmented}
        />

        <View style={styles.buttonContainer}>
          {onCancel && (
            <Button mode="outlined" onPress={onCancel} style={styles.button}>
              Cancel
            </Button>
          )}
          <Button mode="contained" onPress={handleSubmit} style={styles.button}>
            Save
          </Button>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 24,
  },
  label: {
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    marginBottom: 8,
  },
  segmented: {
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
  },
})
