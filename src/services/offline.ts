import * as FileSystem from 'expo-file-system'
import { isWeb } from '../utils/platform'

const CACHE_DIR = `${FileSystem.documentDirectory}cache/`

export class OfflineService {
  // Cache initialisieren
  static async initCache() {
    if (isWeb) return

    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR)
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true })
    }
  }

  // Workshop-Daten cachen
  static async cacheWorkshopData(workshopId: string, data: any) {
    if (isWeb) {
      localStorage.setItem(`workshop_${workshopId}`, JSON.stringify(data))
      return
    }

    const filePath = `${CACHE_DIR}workshop_${workshopId}.json`
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data))
  }

  // Workshop-Daten aus Cache laden
  static async getCachedWorkshopData(workshopId: string): Promise<any | null> {
    if (isWeb) {
      const data = localStorage.getItem(`workshop_${workshopId}`)
      return data ? JSON.parse(data) : null
    }

    const filePath = `${CACHE_DIR}workshop_${workshopId}.json`
    const fileInfo = await FileSystem.getInfoAsync(filePath)

    if (!fileInfo.exists) return null

    const content = await FileSystem.readAsStringAsync(filePath)
    return JSON.parse(content)
  }

  // Cache löschen
  static async clearCache() {
    if (isWeb) {
      localStorage.clear()
      return
    }

    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR)
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true })
    }
  }
}
