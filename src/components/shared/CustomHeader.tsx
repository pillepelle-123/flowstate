import React, { useState, useEffect } from 'react'
import { Appbar, Menu } from 'react-native-paper'
import { useRouter, usePathname, useLocalSearchParams } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'
import { WorkshopService } from '../../services/workshop'
import { lightTheme } from '../../theme/paperTheme'

interface CustomHeaderProps {
  title: string
  onMenuPress?: () => void
}

export function CustomHeader({ title, onMenuPress }: CustomHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useLocalSearchParams()
  const { signOut } = useAuthStore()
  const [menuVisible, setMenuVisible] = useState(false)
  const [workshopTitle, setWorkshopTitle] = useState<string | null>(null)

  const canGoBack = router.canGoBack()

  // Extract workshopId from URL if params don't have it
  const workshopId = params.workshopId || 
    (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('workshopId') : null)

  useEffect(() => {
    if (pathname === '/moderator' && workshopId) {
      loadWorkshopTitle(workshopId as string)
    } else {
      setWorkshopTitle(null)
    }
  }, [pathname, workshopId])

  const loadWorkshopTitle = async (workshopId: string) => {
    try {
      const workshop = await WorkshopService.getWorkshop(workshopId)
      setWorkshopTitle(workshop.title)
    } catch (error) {
      console.error('Failed to load workshop title:', error)
    }
  }

  const handleSignOut = async () => {
    setMenuVisible(false)
    await signOut()
    router.replace('/auth/login')
  }

  const renderRightIcon = () => {
    if (pathname === '/moderator') {
      return (
        <Appbar.Action
          icon={() => <MaterialCommunityIcons name="presentation" size={24} color={lightTheme.colors.surface} />}
          onPress={() => {}}
        />
      )
    }
    if (pathname === '/join') {
      return (
        <Appbar.Action
          icon={() => <MaterialCommunityIcons name="location-enter" size={24} color={lightTheme.colors.surface} />}
          onPress={() => {}}
        />
      )
    }
    if (pathname === '/dashboard') {
      return (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon={() => <MaterialCommunityIcons name="account-circle" size={24} color={lightTheme.colors.surface} />}
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={handleSignOut}
            title="Sign Out"
            leadingIcon="logout"
          />
        </Menu>
      )
    }
    if (pathname.startsWith('/workshop/')) {
      return (
        <Appbar.Action
          icon={() => <MaterialCommunityIcons name="view-dashboard" size={24} color={lightTheme.colors.surface} />}
          onPress={() => {}}
        />
      )
    }
    return null
  }

  const displayTitle = pathname === '/moderator' && workshopTitle ? workshopTitle : (title || 'Moderator')

  return (
    <Appbar.Header style={{ backgroundColor: lightTheme.colors.secondary }}>
      {canGoBack && <Appbar.BackAction color={lightTheme.colors.surface} onPress={() => router.back()} />}
      <Appbar.Content title={displayTitle} titleStyle={{ color: lightTheme.colors.surface }} />
      {renderRightIcon()}
    </Appbar.Header>
  )
}
