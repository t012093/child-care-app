import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Download, Edit } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import { colors } from '../../../constants/colors';
import { generateApplicationPDF, downloadPDF } from '../../../utils/pdfGenerator';
import PdfPreview from '../../../components/PdfPreview';

export default function PreviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // サンプル申請データ
  const applicationData = {
    facilityName: 'さくら保育園',
    applicationType: '入園申請',
    parentName: '花田 さゆり',
    parentPhone: '090-1234-5678',
    parentEmail: 'sayuri.hanada@example.com',
    address: '東京都渋谷区桜丘町1-1',
    childName: '花田 はな',
    childBirthDate: '2023-05-15',
    childGender: '女',
    desiredStartDate: '2025-04-01',
    notes: '平日9:00-17:00の利用を希望します。',
  };

  const handlePreview = async () => {
    setIsGenerating(true);
    try {
      // Web版・モバイル版共通: Metro asset systemを使用
      const asset = require('../../../assets/templates/temporary_care_application.pdf');
      setPdfUri(asset);
      setShowPdfPreview(true);
    } catch (error) {
      Alert.alert('エラー', 'プレビューの表示に失敗しました');
      console.error('PDF preview error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('お知らせ', 'ダウンロード機能はWeb版でのみ利用可能です');
      return;
    }

    setIsGenerating(true);

    try {
      // Metro asset systemから読み込んだPDFをダウンロード
      const asset = require('../../../assets/templates/temporary_care_application.pdf');
      const response = await fetch(asset);
      const blob = await response.blob();
      const filename = `${applicationData.applicationType}_${applicationData.childName}_${new Date().toISOString().split('T')[0]}.pdf`;
      await downloadPDF(blob, filename);
      Alert.alert('成功', 'PDFのダウンロードを開始しました');
    } catch (error) {
      Alert.alert('エラー', 'PDFのダウンロードに失敗しました');
      console.error('PDF download error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = () => {
    router.push('/application/new');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.title}>申請書プレビュー</Text>
        <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
          <Edit size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {showPdfPreview && pdfUri ? (
        <View style={styles.pdfContainer}>
          <PdfPreview
            uri={pdfUri}
            onLoadComplete={(numberOfPages) => {
              console.log(`PDF loaded: ${numberOfPages} pages`);
            }}
            onError={(error) => {
              console.error('PDF load error:', error);
              Alert.alert('エラー', 'PDFの読み込みに失敗しました');
            }}
          />
          <TouchableOpacity
            style={styles.closePreviewButton}
            onPress={() => setShowPdfPreview(false)}
          >
            <Text style={styles.closePreviewText}>プレビューを閉じる</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>{applicationData.applicationType}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>施設情報</Text>
            <View style={styles.row}>
              <Text style={styles.label}>施設名:</Text>
              <Text style={styles.value}>{applicationData.facilityName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>希望開始日:</Text>
              <Text style={styles.value}>{applicationData.desiredStartDate}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>保護者情報</Text>
            <View style={styles.row}>
              <Text style={styles.label}>氏名:</Text>
              <Text style={styles.value}>{applicationData.parentName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>電話番号:</Text>
              <Text style={styles.value}>{applicationData.parentPhone}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>メールアドレス:</Text>
              <Text style={styles.value}>{applicationData.parentEmail}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>住所:</Text>
              <Text style={styles.value}>{applicationData.address}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>お子様情報</Text>
            <View style={styles.row}>
              <Text style={styles.label}>氏名:</Text>
              <Text style={styles.value}>{applicationData.childName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>生年月日:</Text>
              <Text style={styles.value}>{applicationData.childBirthDate}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>性別:</Text>
              <Text style={styles.value}>{applicationData.childGender}</Text>
            </View>
          </View>

          {applicationData.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>備考</Text>
              <Text style={styles.notesText}>{applicationData.notes}</Text>
            </View>
          )}
        </View>

          <View style={styles.footer} />
        </ScrollView>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.downloadButton, { flex: 1, marginRight: 8 }]}
          onPress={handlePreview}
          disabled={isGenerating}
        >
          <Text style={styles.downloadButtonText}>
            {isGenerating ? 'PDF読込中...' : 'PDFプレビュー'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.downloadButton, { flex: 1 }]}
          onPress={handleDownload}
          disabled={isGenerating}
        >
          <Download size={20} color="white" />
          <Text style={styles.downloadButtonText}>
            {Platform.OS === 'web' ? 'ダウンロード' : 'ダウンロード (Web版のみ)'}
          </Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 4,
  },
  editButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
  },
  scrollContainer: {
    flex: 1,
  },
  previewCard: {
    margin: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: colors.textSub,
    width: 120,
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: colors.textMain,
    fontWeight: '500',
  },
  notesText: {
    fontSize: 14,
    color: colors.textMain,
    lineHeight: 20,
  },
  footer: {
    height: 100,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  downloadButton: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  pdfContainer: {
    flex: 1,
    position: 'relative',
  },
  closePreviewButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closePreviewText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
