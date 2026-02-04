import React, { useState } from 'react'
import { Button } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { WorkshopService } from '../../services/workshop'
import { ConfirmDialog } from '../shared/ConfirmDialog'

interface StartWorkshopButtonProps {
  workshopId: string
  isCompleted: boolean
  disabled?: boolean
}

export function StartWorkshopButton({ workshopId, isCompleted, disabled }: StartWorkshopButtonProps) {
  const router = useRouter()
  const [confirmDialog, setConfirmDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    setConfirmDialog(false)
    setLoading(true)
    try {
      const sessions = await WorkshopService.getSessions(workshopId)
      const sortedSessions = sessions.sort((a, b) => a.order_index - b.order_index)
      const firstSession = sortedSessions[0]

      if (firstSession) {
        await WorkshopService.startSession(workshopId, firstSession.id)
      }

      router.push(`/moderator?workshopId=${workshopId}`)
    } catch (error) {
      console.error('Failed to start workshop:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        mode="contained"
        icon="play"
        onPress={() => setConfirmDialog(true)}
        loading={loading}
        disabled={disabled || loading}
      >
        Start Workshop
      </Button>

      <ConfirmDialog
        visible={confirmDialog}
        title={isCompleted ? 'Restart Workshop' : 'Start Workshop'}
        message={
          isCompleted
            ? 'This workshop has been completed. Starting it will reset all progress. Continue?'
            : 'Start this workshop now?'
        }
        confirmLabel="Start"
        confirmColor="#10b981"
        onConfirm={handleStart}
        onCancel={() => setConfirmDialog(false)}
      />
    </>
  )
}
