import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { MethodTemplateService } from '../../services/methodTemplates'
import { Database } from '../../types/database'

type MethodTemplate = Database['public']['Tables']['method_templates']['Row']

interface MethodLibraryProps {
  onSelectTemplate: (template: MethodTemplate) => void
}

export function MethodLibrary({ onSelectTemplate }: MethodLibraryProps) {
  const [templates, setTemplates] = useState<MethodTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const data = await MethodTemplateService.getAll()
      setTemplates(data)
    } catch (error) {
      Alert.alert('Fehler', 'Methoden konnten nicht geladen werden')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category || 'Sonstige'
    if (!acc[category]) acc[category] = []
    acc[category].push(template)
    return acc
  }, {} as Record<string, MethodTemplate[]>)

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Lade Methoden...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Methoden-Bibliothek</Text>
      {Object.entries(groupedTemplates).map(([category, items]) => (
        <View key={category} style={styles.category}>
          <Text style={styles.categoryTitle}>{category}</Text>
          {items.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={styles.templateCard}
              onPress={() => onSelectTemplate(template)}
            >
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateDuration}>{template.default_duration} Min</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 24,
  },
  category: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  templateCard: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateName: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  templateDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
})
