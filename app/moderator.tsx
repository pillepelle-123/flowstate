import React from 'react'
import { ModeratorLiveView } from '../src/components/moderator/ModeratorLiveView'

export default function ModeratorScreen() {
  const workshopId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  
  return <ModeratorLiveView workshopId={workshopId} />
}
