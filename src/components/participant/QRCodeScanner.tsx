import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { isWeb } from '../../utils/platform'

interface QRCodeScannerProps {
  onScan: (workshopId: string) => void
}

export function QRCodeScanner({ onScan }: QRCodeScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    if (!isWeb) {
      requestCameraPermission()
    }
  }, [])

  const requestCameraPermission = async () => {
    if (isWeb) return

    const { Camera } = require('expo-camera')
    const { status } = await Camera.requestCameraPermissionsAsync()
    setHasPermission(status === 'granted')
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true)
    
    // Parse URL: https://flowstate.app/join/{workshop-id}
    const match = data.match(/\/join\/([a-f0-9-]+)/)
    if (match && match[1]) {
      onScan(match[1])
    } else {
      Alert.alert('Ungültiger QR-Code', 'Dieser QR-Code gehört nicht zu einem Workshop.')
      setScanned(false)
    }
  }

  if (isWeb) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-lg text-gray-700 text-center mb-4">
          QR-Code-Scanning ist nur in der nativen App verfügbar.
        </Text>
        <Text className="text-sm text-gray-500 text-center">
          Bitte gib die Workshop-ID manuell ein oder nutze die iOS/Android App.
        </Text>
      </View>
    )
  }

  const { CameraView } = require('expo-camera')

  if (hasPermission === null) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Kamera-Berechtigung wird angefordert...</Text>
      </View>
    )
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-lg text-gray-700 text-center mb-4">
          Kamera-Zugriff verweigert
        </Text>
        <TouchableOpacity
          onPress={requestCameraPermission}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Erneut anfragen</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="flex-1">
      <CameraView
        style={{ flex: 1 }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View className="flex-1 items-center justify-center">
          <View className="w-64 h-64 border-4 border-white rounded-lg" />
          <Text className="text-white text-lg mt-4 font-semibold">
            QR-Code scannen
          </Text>
        </View>
      </CameraView>

      {scanned && (
        <View className="absolute bottom-8 left-0 right-0 items-center">
          <TouchableOpacity
            onPress={() => setScanned(false)}
            className="bg-white px-6 py-3 rounded-lg"
          >
            <Text className="text-gray-900 font-semibold">Erneut scannen</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}
