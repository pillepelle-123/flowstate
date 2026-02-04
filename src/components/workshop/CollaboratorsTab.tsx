import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, FlatList } from 'react-native'
import { Text, List, Avatar, Chip, IconButton, TextInput, Button, Snackbar, Divider, Surface } from 'react-native-paper'
import { UserService, User } from '../../services/user'
import { InvitationService } from '../../services/invitation'
import { WorkshopService } from '../../services/workshop'
import { UserAvatar } from '../shared/UserAvatar'

interface CollaboratorsTabProps {
  workshopId: string
  userRole: 'owner' | 'collaborator' | null
  currentUserId: string
}

export function CollaboratorsTab({ workshopId, userRole, currentUserId }: CollaboratorsTabProps) {
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [email, setEmail] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' })

  useEffect(() => {
    loadData()
  }, [workshopId])

  const loadData = async () => {
    try {
      const [users, invites] = await Promise.all([
        UserService.getWorkshopCollaborators(workshopId),
        InvitationService.getPendingInvitations(workshopId)
      ])
      setCollaborators(users)
      setInvitations(invites)
    } catch (error) {
      setSnackbar({ visible: true, message: 'Failed to load collaborators' })
    }
  }

  const handleSearch = async (query: string) => {
    setEmail(query)
    if (query.length < 3) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const results = await UserService.searchUsersByEmail(query)
      const filtered = results.filter(u => 
        u.id !== currentUserId && 
        !collaborators.some(c => c.id === u.id)
      )
      setSearchResults(filtered)
    } catch (error) {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleAddUser = async (userId: string) => {
    setLoading(true)
    try {
      await WorkshopService.addUserToWorkshop(workshopId, userId, 'collaborator')
      setEmail('')
      setSearchResults([])
      setSnackbar({ visible: true, message: 'Collaborator added' })
      loadData()
    } catch (error) {
      setSnackbar({ visible: true, message: 'Failed to add collaborator' })
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (inviteEmail: string) => {
    if (!inviteEmail.trim()) return
    setLoading(true)
    try {
      await InvitationService.createInvitation(workshopId, inviteEmail.trim(), currentUserId)
      setEmail('')
      setSearchResults([])
      setSnackbar({ visible: true, message: 'Invitation sent' })
      loadData()
    } catch (error) {
      setSnackbar({ visible: true, message: 'Failed to send invitation' })
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (userId: string) => {
    try {
      await WorkshopService.removeUserFromWorkshop(workshopId, userId)
      setSnackbar({ visible: true, message: 'User removed' })
      loadData()
    } catch (error) {
      setSnackbar({ visible: true, message: 'Failed to remove user' })
    }
  }

  const isOwner = userRole === 'owner'

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleLarge" style={styles.section}>Collaborators</Text>
      {collaborators.map((collab) => (
        <List.Item
          key={collab.id}
          title={collab.display_name || collab.email}
          description={collab.email}
          left={() => (
            <UserAvatar name={collab.display_name} email={collab.email} size={40} />
          )}
          right={() => (
            <View style={styles.right}>
              <Chip compact>{collab.role}</Chip>
              {isOwner && collab.id !== currentUserId && (
                <IconButton icon="delete" size={20} onPress={() => handleRemove(collab.id)} />
              )}
            </View>
          )}
        />
      ))}

      {isOwner && (
        <>
          <Text variant="titleLarge" style={styles.section}>Add Collaborator</Text>
          <View style={styles.addSection}>
            <TextInput
              mode="outlined"
              label="Search by email"
              value={email}
              onChangeText={handleSearch}
              keyboardType="email-address"
              style={styles.input}
              right={searching ? <TextInput.Icon icon="loading" /> : undefined}
            />
            
            {searchResults.length > 0 && (
              <Surface style={styles.searchResults} elevation={2}>
                {searchResults.map((user) => (
                  <List.Item
                    key={user.id}
                    title={user.display_name || user.email}
                    description={user.email}
                    left={() => (
                      <UserAvatar name={user.display_name} email={user.email} size={36} />
                    )}
                    right={() => (
                      <Button mode="contained-tonal" onPress={() => handleAddUser(user.id)} disabled={loading}>
                        Add
                      </Button>
                    )}
                  />
                ))}
              </Surface>
            )}
            
            {email.length >= 3 && searchResults.length === 0 && !searching && (
              <Button 
                mode="outlined" 
                onPress={() => handleInvite(email)} 
                loading={loading} 
                disabled={loading}
                icon="email-send"
              >
                Send invitation to {email}
              </Button>
            )}
          </View>

          {invitations.length > 0 && (
            <>
              <Text variant="titleLarge" style={styles.section}>Pending Invitations</Text>
              {invitations.map((inv) => (
                <List.Item
                  key={inv.id}
                  title={inv.invited_email}
                  description={`Status: ${inv.status}`}
                  right={() => (
                    <IconButton
                      icon="close"
                      size={20}
                      onPress={async () => {
                        await InvitationService.cancelInvitation(inv.id)
                        loadData()
                      }}
                    />
                  )}
                />
              ))}
            </>
          )}
        </>
      )}

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
      >
        {snackbar.message}
      </Snackbar>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addSection: {
    gap: 12,
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  searchResults: {
    borderRadius: 8,
    marginBottom: 8,
  },
})
