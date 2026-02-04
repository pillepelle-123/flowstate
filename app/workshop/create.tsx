import React, { useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Appbar, TextInput, Button, SegmentedButtons, HelperText, Snackbar } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { WorkshopService } from '../../src/services/workshop'
import { WorkshopBufferStrategy } from '../../src/types/database'

export default function CreateWorkshopScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [totalDuration, setTotalDuration] = useState('120')
  const [bufferStrategy, setBufferStrategy] = useState<WorkshopBufferStrategy>('distributed')

  const [errors, setErrors] = useState({
    title: '',
    date: '',
    totalDuration: ''
  })

  const validate = () => {
    const newErrors = { title: '', date: '', totalDuration: '' }
    let isValid = true

    if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
      isValid = false
    }

    if (date) {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past'
        isValid = false
      }
    }

    const duration = parseInt(totalDuration)
    if (isNaN(duration) || duration < 15) {
      newErrors.totalDuration = 'Duration must be at least 15 minutes'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleCreate = async () => {
    if (!validate() || !user?.id) return

    setLoading(true)
    try {
      const workshop = await WorkshopService.createWorkshop({
        title: title.trim(),
        description: description.trim() || null,
        date: date || null,
        total_duration: parseInt(totalDuration),
        buffer_strategy: bufferStrategy
      }, user.id)

      router.replace(`/planner?workshopId=${workshop.id}`)
    } catch (error) {
      setSnackbar({ visible: true, message: 'Failed to create workshop' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Create Workshop" />
      </Appbar.Header>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <TextInput
          label="Title *"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          error={!!errors.title}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.title}>
          {errors.title}
        </HelperText>

        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        <TextInput
          label="Date"
          value={date}
          onChangeText={setDate}
          mode="outlined"
          placeholder="YYYY-MM-DD"
          error={!!errors.date}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.date}>
          {errors.date}
        </HelperText>

        <TextInput
          label="Total Duration (minutes) *"
          value={totalDuration}
          onChangeText={setTotalDuration}
          mode="outlined"
          keyboardType="numeric"
          error={!!errors.totalDuration}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.totalDuration}>
          {errors.totalDuration}
        </HelperText>

        <HelperText type="info" style={styles.label}>
          Buffer Strategy
        </HelperText>
        <SegmentedButtons
          value={bufferStrategy}
          onValueChange={(value) => setBufferStrategy(value as WorkshopBufferStrategy)}
          buttons={[
            { value: 'fixed', label: 'Fixed' },
            { value: 'distributed', label: 'Distributed' },
            { value: 'end', label: 'End' },
          ]}
          style={styles.segmented}
        />

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={styles.button}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleCreate}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            Create
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  input: {
    marginBottom: 4,
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
  },
  segmented: {
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
  },
})
