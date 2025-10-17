import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors } from '../constants/colors';
import FieldPalette, { DataField } from './FieldPalette';
import PdfCanvas from './PdfCanvas.web';
import { FieldMapping, savePdfMapping, loadPdfMapping } from '../utils/pdfMappingStorage';

interface PdfMappingEditorProps {
  templateName: string;
  pdfUrl: string;
  availableFields: DataField[];
}

export default function PdfMappingEditor({
  templateName,
  pdfUrl,
  availableFields,
}: PdfMappingEditorProps) {
  const [mappings, setMappings] = useState<FieldMapping[]>(() => {
    const saved = loadPdfMapping(templateName);
    return saved?.fields || [];
  });

  const [currentPage] = useState(0);
  const [selectedField, setSelectedField] = useState<DataField | null>(null);

  const handleSelectField = (field: DataField) => {
    setSelectedField(field);
  };

  const handleCanvasClick = (x: number, y: number) => {
    if (!selectedField) return;

    const newMapping: FieldMapping = {
      fieldId: selectedField.id,
      fieldLabel: selectedField.label,
      coordinate: {
        x,
        y,
        page: currentPage,
        size: 12,
      },
    };

    // 既存のマッピングを更新または追加
    setMappings((prev) => {
      const existing = prev.findIndex((m) => m.fieldId === selectedField.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newMapping;
        return updated;
      }
      return [...prev, newMapping];
    });

    Alert.alert('配置完了', `${selectedField.label} を配置しました`);
    setSelectedField(null); // 選択解除
  };

  const handleSave = () => {
    savePdfMapping(templateName, mappings);
    Alert.alert('保存完了', 'マッピング設定を保存しました');
  };

  const handleRemoveMapping = (fieldId: string) => {
    setMappings((prev) => prev.filter((m) => m.fieldId !== fieldId));
  };

  const handleClear = () => {
    Alert.alert(
      '確認',
      'すべてのマッピングをクリアしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'クリア',
          style: 'destructive',
          onPress: () => {
            setMappings([]);
            setSelectedField(null);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 左サイドバー: フィールドパレット */}
      <FieldPalette
        fields={availableFields}
        selectedFieldId={selectedField?.id || null}
        onSelectField={handleSelectField}
      />

      {/* 中央: PDFキャンバス */}
      <View style={styles.mainArea}>
        <View style={styles.toolbar}>
          <View>
            <Text style={styles.toolbarTitle}>PDFマッピングエディタ</Text>
            {selectedField && (
              <Text style={styles.toolbarSubtitle}>
                選択中: <Text style={styles.selectedFieldName}>{selectedField.label}</Text>
              </Text>
            )}
          </View>
          <View style={styles.toolbarButtons}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>クリア</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>

        <PdfCanvas
          pdfUrl={pdfUrl}
          mappings={mappings}
          hasSelectedField={selectedField !== null}
          onCanvasClick={handleCanvasClick}
        />
      </View>

      {/* 右サイドバー: 配置済みフィールド */}
      <View style={styles.sidebar}>
        <Text style={styles.sidebarTitle}>配置済みフィールド</Text>
        <Text style={styles.sidebarSubtitle}>
          {mappings.length} 個のフィールド
        </Text>
        <ScrollView style={styles.mappingList} showsVerticalScrollIndicator={false}>
          {mappings.map((mapping) => (
            <View key={mapping.fieldId} style={styles.mappingItem}>
              <View style={styles.mappingInfo}>
                <Text style={styles.mappingLabel}>{mapping.fieldLabel}</Text>
                <Text style={styles.mappingCoord}>
                  x: {Math.round(mapping.coordinate.x)}, y: {Math.round(mapping.coordinate.y)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveMapping(mapping.fieldId)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          {mappings.length === 0 && (
            <Text style={styles.emptyText}>
              左からフィールドをクリックして選択し{'\n'}PDF上をクリックして配置してください
            </Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  mainArea: {
    flex: 1,
    flexDirection: 'column',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  toolbarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
  },
  toolbarSubtitle: {
    fontSize: 13,
    color: colors.textSub,
    marginTop: 4,
  },
  selectedFieldName: {
    fontWeight: '600',
    color: '#3B82F6',
  },
  toolbarButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  sidebar: {
    width: 280,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
    padding: 16,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 4,
  },
  sidebarSubtitle: {
    fontSize: 12,
    color: colors.textSub,
    marginBottom: 16,
  },
  mappingList: {
    flex: 1,
  },
  mappingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  mappingInfo: {
    flex: 1,
  },
  mappingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 4,
  },
  mappingCoord: {
    fontSize: 11,
    color: colors.textSub,
    fontFamily: 'monospace',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  removeButtonText: {
    fontSize: 18,
    color: '#DC2626',
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSub,
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 20,
  },
});
