import React from 'react'
import { View, Text } from 'react-native'
import { isWeb } from '../../utils/platform'

interface QRCodeGeneratorProps {
  workshopId: string
  size?: number
}

export function QRCodeGenerator({ workshopId, size = 200 }: QRCodeGeneratorProps) {
  // Development: Custom Scheme, Production: HTTPS URL
  const isDev = __DEV__
  const joinUrl = isDev 
    ? `flowstate://join/${workshopId}`
    : `https://flowstate.app/join/${workshopId}`

  if (isWeb) {
    // Web: Dynamischer Import von qrcode.react
    const QRCodeReact = require('qrcode.react').QRCodeSVG
    return (
      <View className="items-center p-4 bg-white rounded-lg">
        <QRCodeReact value={joinUrl} size={size} />
        <Text className="mt-2 text-sm text-gray-600">{joinUrl}</Text>
        {isDev && (
          <Text className="mt-1 text-xs text-orange-600">
            Development Mode: Custom Scheme
          </Text>
        )}
      </View>
    )
  }

  // Native: react-native-qrcode-svg
  const QRCode = require('react-native-qrcode-svg').default
  return (
    <View className="items-center p-4 bg-white rounded-lg">
      <QRCode value={joinUrl} size={size} />
      <Text className="mt-2 text-sm text-gray-600">{joinUrl}</Text>
      {isDev && (
        <Text className="mt-1 text-xs text-orange-600">
          Development Mode: Custom Scheme
        </Text>
      )}
    </View>
  )
}
