import * as Updates from 'expo-updates'
import { Alert } from 'react-native'

export class UpdatesService {
  // Prüfe auf Updates
  static async checkForUpdates() {
    if (__DEV__) {
      console.log('Updates disabled in development mode')
      return
    }

    try {
      const update = await Updates.checkForUpdateAsync()
      
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync()
        Alert.alert(
          'Update verfügbar',
          'Eine neue Version wurde heruntergeladen. App wird neu gestartet.',
          [
            {
              text: 'Jetzt neu starten',
              onPress: () => Updates.reloadAsync(),
            },
          ]
        )
      }
    } catch (error) {
      console.error('Update check failed:', error)
    }
  }

  // Auto-Update beim App-Start
  static async autoUpdate() {
    if (__DEV__) return

    try {
      const update = await Updates.checkForUpdateAsync()
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync()
        await Updates.reloadAsync()
      }
    } catch (error) {
      console.error('Auto-update failed:', error)
    }
  }

  // Update-Event-Listener
  static addUpdateListener(callback: (event: Updates.UpdateEvent) => void) {
    return Updates.addListener(callback)
  }
}
