import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { Button, Divider, Text } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { WorkshopService } from '../../services/workshop'
import { WorkshopForm } from '../planner/WorkshopForm'
import { ConfirmDialog } from '../shared/ConfirmDialog'

interface SettingsTabProps {
  workshopId: string
  userRole: 'owner' | 'collaborator' | null
  currentUserId: string
}

export function SettingsTab({ workshopId, userRole, currentUserId }: SettingsTabProps) {
  const router = useRouter()
  const [workshop, setWorkshop] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [archiveDialog, setArchiveDialog] = useState(false)
  const [resetDialog, setResetDialog] = useState(false)

  useEffect(() => {
    loadWorkshop()
  }, [workshopId])

  const loadWorkshop = async () => {
    try {
      const data = await WorkshopService.getWorkshop(workshopId)
      setWorkshop(data)
    } catch (error) {
      Alert.alert('Error', 'Failed to load workshop')
    }
  }

  const handleSave = async (formData: any) => {
    setLoading(true)
    try {
      await WorkshopService.updateWorkshop(workshopId, {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        total_duration: formData.totalDuration,
        buffer_strategy: formData.bufferStrategy,
      })
      Alert.alert('Success', 'Workshop updated')
      loadWorkshop()
    } catch (error) {
      Alert.alert('Error', 'Failed to update workshop')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAsTemplate = async () => {
    try {
      await WorkshopService.duplicateAsTemplate(workshopId, currentUserId)
      Alert.alert('Success', 'Template created')
    } catch (error) {
      Alert.alert('Error', 'Failed to create template')
    }
  }

  const handleArchive = async () => {
    setArchiveDialog(false)
    try {
      await WorkshopService.archiveWorkshop(workshopId)
      Alert.alert('Success', 'Workshop archived')
      router.back()
    } catch (error) {
      Alert.alert('Error', 'Failed to archive workshop')
    }
  }

  const handleReset = async () => {
    setResetDialog(false)
    try {
      await WorkshopService.resetWorkshop(workshopId)
      Alert.alert('Success', 'Workshop reset')
      loadWorkshop()
    } catch (error) {
      Alert.alert('Error', 'Failed to reset workshop')
    }
  }

  const handleDelete = async () => {
    try {
      await WorkshopService.deleteWorkshop(workshopId)
      setDeleteDialog(false)
      router.replace('/dashboard')
    } catch (error) {
      Alert.alert('Error', 'Failed to delete workshop')
    }
  }

  const isOwner = userRole === 'owner'

  if (!workshop) return null

  return (
    <ScrollView style={styles.container}>
      <WorkshopForm
        initialData={{
          title: workshop.title,
          description: workshop.description || '',
          date: workshop.date,
          totalDuration: workshop.total_duration,
          bufferStrategy: workshop.buffer_strategy,
        }}
        onSubmit={handleSave}
      />

      {isOwner && (
        <>
          <Divider style={styles.divider} />
          
          <View style={styles.actions}>
            <Button mode="outlined" icon="content-copy" onPress={handleSaveAsTemplate}>
              Save as Template
            </Button>
            
            <Button mode="outlined" icon="refresh" onPress={() => setResetDialog(true)}>
              Reset Workshop
            </Button>
            
            <Button mode="outlined" icon="archive" onPress={() => setArchiveDialog(true)}>
              Archive Workshop
            </Button>
            
            <Button
              mode="outlined"
              icon="delete"
              textColor="#ef4444"
              onPress={() => setDeleteDialog(true)}
            >
              Delete Workshop
            </Button>
          </View>
        </>
      )}

      <ConfirmDialog
        visible={archiveDialog}
        title="Archive Workshop"
        message="Archive this workshop? You can restore it later."
        confirmLabel="Archive"
        onConfirm={handleArchive}
        onCancel={() => setArchiveDialog(false)}
      />

      <ConfirmDialog
        visible={resetDialog}
        title="Reset Workshop"
        message="Reset workshop? All participant interactions will be deleted."
        confirmLabel="Reset"
        confirmColor="#f59e0b"
        onConfirm={handleReset}
        onCancel={() => setResetDialog(false)}
      />

      <ConfirmDialog
        visible={deleteDialog}
        title="Delete Workshop"
        message="Permanently delete this workshop? This cannot be undone."
        confirmLabel="Delete"
        confirmColor="#ef4444"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog(false)}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  divider: {
    marginVertical: 24,
  },
  actions: {
    padding: 24,
    gap: 12,
  },
})
