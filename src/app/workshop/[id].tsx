import React, { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { Appbar, SegmentedButtons } from 'react-native-paper'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useAuthStore } from '../../stores/authStore'
import { WorkshopService } from '../../services/workshop'
import { PlanningEditor } from '../../components/planner/PlanningEditor'
import { CollaboratorsTab } from '../../components/workshop/CollaboratorsTab'
import { SettingsTab } from '../../components/workshop/SettingsTab'
import { canEditSettings } from '../../utils/permissions'

export default function WorkshopEditScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuthStore()
  const [tab, setTab] = useState('planner')
  const [role, setRole] = useState<'owner' | 'collaborator' | null>(null)

  useEffect(() => {
    loadRole()
  }, [id, user])

  const loadRole = async () => {
    if (!id || !user?.id) return
    const userRole = await WorkshopService.getWorkshopRole(id, user.id)
    setRole(userRole)
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.push('/dashboard')} />
        <Appbar.Content title="Edit Workshop" />
      </Appbar.Header>

      <SegmentedButtons
        value={tab}
        onValueChange={setTab}
        buttons={[
          { value: 'planner', label: 'Planner' },
          { value: 'collaborators', label: 'Collaborators' },
          { value: 'settings', label: 'Settings', disabled: !canEditSettings(role) },
        ]}
        style={styles.tabs}
      />

      {tab === 'planner' && <PlanningEditor workshopId={id} />}
      {tab === 'collaborators' && user && (
        <CollaboratorsTab workshopId={id} userRole={role} currentUserId={user.id} />
      )}
      {tab === 'settings' && user && (
        <SettingsTab workshopId={id} userRole={role} currentUserId={user.id} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    margin: 16,
  },
})
