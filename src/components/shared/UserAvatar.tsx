import React from 'react'
import { Avatar } from 'react-native-paper'

interface UserAvatarProps {
  name?: string | null
  email: string
  size?: number
}

export function UserAvatar({ name, email, size = 40 }: UserAvatarProps) {
  const displayName = name || email
  const initial = displayName[0]?.toUpperCase() || '?'
  
  return <Avatar.Text size={size} label={initial} />
}
