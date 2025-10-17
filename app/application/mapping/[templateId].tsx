import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '../../../constants/colors';
import PdfMappingEditor from '../../../components/PdfMappingEditor.web';
import { DataField } from '../../../components/FieldPalette';

// サンプルデータフィールド
const availableFields: DataField[] = [
  { id: 'facilityName', label: '施設名', value: 'さくら保育園' },
  { id: 'parentName', label: '保護者氏名', value: '花田 さゆり' },
  { id: 'parentPhone', label: '電話番号', value: '090-1234-5678' },
  { id: 'parentEmail', label: 'メールアドレス', value: 'sayuri.hanada@example.com' },
  { id: 'address', label: '住所', value: '東京都渋谷区桜丘町1-1' },
  { id: 'childName', label: 'お子様氏名', value: '花田 はな' },
  { id: 'childBirthDate', label: '生年月日', value: '2023-05-15' },
  { id: 'childGender', label: '性別', value: '女' },
  { id: 'desiredStartDate', label: '希望開始日', value: '2025-04-01' },
  { id: 'notes', label: '備考', value: '平日9:00-17:00の利用を希望します。' },
];

export default function MappingEditorScreen() {
  const router = useRouter();
  const { templateId } = useLocalSearchParams();

  const templateName = typeof templateId === 'string' ? templateId : 'temporary_care_application';

  // PDFのURL取得
  const pdfUrl = require('../../../assets/templates/temporary_care_application.pdf');

  // モバイル版では非対応
  if (Platform.OS !== 'web') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.textMain} />
          </TouchableOpacity>
          <Text style={styles.title}>PDFマッピング</Text>
        </View>
        <View style={styles.unsupportedContainer}>
          <Text style={styles.unsupportedText}>
            PDFマッピングエディタはWeb版でのみ利用可能です。
          </Text>
          <Text style={styles.unsupportedSubtext}>
            ブラウザでアクセスしてください。
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.title}>PDFマッピングエディタ</Text>
        <View style={styles.headerSpacer} />
      </View>

      <PdfMappingEditor
        templateName={templateName}
        pdfUrl={pdfUrl}
        availableFields={availableFields}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
  },
  headerSpacer: {
    width: 32,
  },
  unsupportedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  unsupportedText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: 8,
  },
  unsupportedSubtext: {
    fontSize: 14,
    color: colors.textSub,
    textAlign: 'center',
  },
});
