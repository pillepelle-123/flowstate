import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal } from 'react-native'
import { QRCodeGenerator } from '../participant/QRCodeGenerator'

interface QRCodeModalProps {
  workshopId: string
}

export function QRCodeModal({ workshopId }: QRCodeModalProps) {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className="bg-green-500 py-3 px-4 rounded-lg"
      >
        <Text className="text-white font-semibold text-center">
          📱 QR-Code anzeigen
        </Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center p-6">
          <View className="bg-white rounded-lg p-6 w-full max-w-md">
            <Text className="text-xl font-bold text-gray-900 text-center mb-4">
              Teilnehmer einladen
            </Text>
            <Text className="text-sm text-gray-600 text-center mb-6">
              Teilnehmer können diesen QR-Code scannen, um beizutreten
            </Text>

            <QRCodeGenerator workshopId={workshopId} size={250} />

            <TouchableOpacity
              onPress={() => setVisible(false)}
              className="bg-gray-500 py-3 px-6 rounded-lg mt-6"
            >
              <Text className="text-white font-semibold text-center">
                Schließen
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  )
}
