import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { Text, Card, ActivityIndicator, useTheme } from 'react-native-paper'
import { MethodTemplateService } from '../../services/methodTemplates'
import { Database } from '../../types/database'

type MethodTemplate = Database['public']['Tables']['method_templates']['Row']

interface MethodLibraryProps {
  onSelectTemplate: (template: MethodTemplate) => void
}

export function MethodLibrary({ onSelectTemplate }: MethodLibraryProps) {
  const theme = useTheme()
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
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineSmall" style={styles.header}>Method Library</Text>
      {Object.entries(groupedTemplates).map(([category, items]) => (
        <View key={category} style={styles.category}>
          <Text variant="titleMedium" style={styles.categoryTitle}>{category}</Text>
          {items.map((template) => (
            <Card
              key={template.id}
              style={[styles.card, {
                backgroundColor: theme.colors.surface,}]}
              onPress={() => onSelectTemplate(template)}
            >
              <Card.Content style={styles.cardContent}>
                <Text variant="bodyLarge" style={styles.templateName}>{template.name}</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
                  {template.default_duration} min
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  category: {
    marginBottom: 24,
  },
  categoryTitle: {
    marginBottom: 8,
  },
  card: {
    marginBottom: 8,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateName: {
    flex: 1,
  },
})
