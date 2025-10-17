import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';

export interface DataField {
  id: string;
  label: string;
  value: string;
  icon?: string;
}

interface FieldPaletteProps {
  fields: DataField[];
  selectedFieldId: string | null;
  onSelectField: (field: DataField) => void;
}

export default function FieldPalette({ fields, selectedFieldId, onSelectField }: FieldPaletteProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>データフィールド</Text>
      <Text style={styles.subtitle}>
        フィールドをクリックして選択、PDF上でクリックして配置
      </Text>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {fields.map((field) => (
          <TouchableOpacity
            key={field.id}
            style={[
              styles.fieldItem,
              selectedFieldId === field.id && styles.fieldItemSelected,
            ]}
            onPress={() => onSelectField(field)}
          >
            <Text style={[
              styles.fieldLabel,
              selectedFieldId === field.id && styles.fieldLabelSelected,
            ]}>
              {field.label}
            </Text>
            <Text style={styles.fieldValue} numberOfLines={1}>
              {field.value}
            </Text>
            {selectedFieldId === field.id && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>選択中</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSub,
    marginBottom: 16,
    lineHeight: 16,
  },
  scrollView: {
    flex: 1,
  },
  fieldItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    cursor: 'pointer',
    position: 'relative',
  },
  fieldItemSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 4,
  },
  fieldLabelSelected: {
    color: '#1E40AF',
  },
  fieldValue: {
    fontSize: 12,
    color: colors.textSub,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
  },
});
