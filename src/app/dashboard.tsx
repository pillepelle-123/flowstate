import React, { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { Appbar, FAB, SegmentedButtons, Searchbar, Menu, IconButton, Snackbar } from 'react-native-paper'
import { useRouter, useFocusEffect } from 'expo-router'
import { useAuthStore } from '../stores/authStore'
import { WorkshopService } from '../services/workshop'
import { WorkshopList } from '../components/dashboard/WorkshopList'

export default function DashboardScreen() {
  const router = useRouter()
  const { user, signOut } = useAuthStore()
  const [workshops, setWorkshops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('active')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'owner' | 'collaborator'>('all')
  const [menuVisible, setMenuVisible] = useState(false)
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' })

  useEffect(() => {
    loadWorkshops()
  }, [tab])

  useFocusEffect(
    React.useCallback(() => {
      loadWorkshops()
    }, [tab])
  )

  const loadWorkshops = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const data = await WorkshopService.getUserWorkshops(user.id, tab === 'archived')
      setWorkshops(data)
    } catch (error) {
      setSnackbar({ visible: true, message: 'Failed to load workshops' })
    } finally {
      setLoading(false)
    }
  }

  const filteredWorkshops = workshops.filter(w => {
    const matchesSearch = w.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || w.workshop_users[0]?.role === roleFilter
    const matchesTab = tab === 'active' ? !w.is_archived : w.is_archived
    return matchesSearch && matchesRole && matchesTab
  })

  const handleStart = async (id: string) => {
    try {
      await WorkshopService.resetWorkshop(id)
      router.push(`/moderator?workshopId=${id}`)
    } catch (error) {
      setSnackbar({ visible: true, message: 'Failed to reset workshop' })
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/workshop/${id}`)
  }

  const handleArchive = async (id: string) => {
    try {
      await WorkshopService.archiveWorkshop(id)
      setSnackbar({ visible: true, message: 'Workshop archived' })
      loadWorkshops()
    } catch (error) {
      setSnackbar({ visible: true, message: 'Failed to archive workshop' })
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.replace('/auth/login')
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Workshops" />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="account-circle"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false)
              handleSignOut()
            }}
            title="Sign Out"
            leadingIcon="logout"
          />
        </Menu>
      </Appbar.Header>

      <View style={styles.filters}>
        <Searchbar
          placeholder="Search workshops"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <SegmentedButtons
          value={roleFilter}
          onValueChange={(value) => setRoleFilter(value as any)}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'owner', label: 'Owner' },
            { value: 'collaborator', label: 'Collaborator' },
          ]}
          style={styles.segmented}
        />
      </View>

      <SegmentedButtons
        value={tab}
        onValueChange={setTab}
        buttons={[
          { value: 'active', label: 'Active' },
          { value: 'archived', label: 'Archived' },
        ]}
        style={styles.tabs}
      />

      <WorkshopList
        workshops={filteredWorkshops}
        loading={loading}
        onWorkshopPress={handleEdit}
        onStart={handleStart}
        onEdit={handleEdit}
        onArchive={handleArchive}
        emptyMessage={
          tab === 'active'
            ? 'No active workshops. Create your first workshop!'
            : 'No archived workshops'
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/workshop/create')}
      />

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
  filters: {
    padding: 16,
    gap: 12,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: 'white',
    borderStyle: 
    'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },
  segmented: {
    marginHorizontal: 0,
  },
  tabs: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
})
