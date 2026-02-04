import React from 'react'
import { useLocalSearchParams } from 'expo-router'
import { ModeratorLiveView } from '../components/moderator/ModeratorLiveView'

export default function ModeratorScreen() {
  const { workshopId } = useLocalSearchParams<{ workshopId: string }>()
  
  if (!workshopId) {
    return null
  }
  
  return <ModeratorLiveView workshopId={workshopId} />
}
