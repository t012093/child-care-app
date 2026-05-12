import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Download, Edit } from 'lucide-react-native';
import { colors } from '../../../constants/colors';
import { ApplicationData, downloadPDF } from '../../../utils/pdfGenerator';
import { downloadAutoFilledPDF } from '../../../utils/pdfAutoFill';
import { resolveAssetUri } from '../../../utils/downloadHelpers';
import PdfPreview from '../../../components/PdfPreview';
import Footer from '../../../components/Footer';
import { useAuth } from '../../../lib/AuthContext';
import {
  fetchApplicationById,
  SavedApplication,
} from '../../../lib/applicationService';

export default function PreviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [applicationData, setApplicationData] = useState<SavedApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const applicationId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    let isMounted = true;

    const loadApplication = async () => {
      if (!applicationId) {
        if (!isMounted) return;
        setLoadError('申請書IDが不正です。');
        setIsLoading(false);
        return;
      }

      if (!user || user.id === 'demo-user') {
        if (!isMounted) return;
        setLoadError('申請書を表示するには実アカウントでログインしてください。');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const savedApplication = await fetchApplicationById(applicationId, user.id);
        if (!isMounted) return;

        if (!savedApplication) {
          setApplicationData(null);
          setLoadError('指定された申請書が見つかりませんでした。');
          return;
        }

        setApplicationData(savedApplication);
      } catch (error) {
        if (!isMounted) return;
        setApplicationData(null);
        setLoadError(
          error instanceof Error ? error.message : '申請書データの取得に失敗しました。'
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadApplication();

    return () => {
      isMounted = false;
    };
  }, [applicationId, user]);

  const handlePreview = async () => {
    setIsGenerating(true);
    try {
      // Web版・モバイル版共通: Metro asset systemを使用
      const asset = require('../../../assets/templates/temporary_care_application.pdf');
      const assetUri = resolveAssetUri(asset);
      setPdfUri(assetUri);
      setShowPdfPreview(true);
    } catch (error) {
      Alert.alert('エラー', 'プレビューの表示に失敗しました');
      console.error('PDF preview error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!applicationData) {
      return;
    }

    if (Platform.OS !== 'web') {
      Alert.alert('お知らせ', 'ダウンロード機能はWeb版でのみ利用可能です');
      return;
    }

    setIsGenerating(true);

    try {
      // Metro asset systemから読み込んだPDFをダウンロード
      const asset = require('../../../assets/templates/temporary_care_application.pdf');
      const assetUri = resolveAssetUri(asset);
      const response = await fetch(assetUri);
      if (!response.ok) {
        throw new Error(`PDF template fetch failed: ${response.status}`);
      }
      const blob = await response.blob();
      const filename = `${applicationData.applicationType}_${applicationData.childName || '申請書'}_${new Date().toISOString().split('T')[0]}.pdf`;
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

  const handleAutoFillDownload = async () => {
    if (!applicationData) {
      return;
    }

    if (Platform.OS !== 'web') {
      Alert.alert('お知らせ', '自動入力機能はWeb版でのみ利用可能です');
      return;
    }

    setIsGenerating(true);

    try {
      const assetUri = resolveAssetUri(
        require('../../../assets/templates/temporary_care_application.pdf')
      );
      const filename = `${applicationData.applicationType}_${applicationData.childName || '申請書'}_入力済み_${new Date().toISOString().split('T')[0]}.pdf`;
      const pdfData: ApplicationData = {
        facilityName: applicationData.facilityName || '',
        applicationType: applicationData.applicationType,
        parentName: applicationData.parentName || '',
        parentPhone: applicationData.parentPhone || '',
        parentEmail: applicationData.parentEmail || '',
        address: applicationData.address || '',
        childName: applicationData.childName || '',
        childBirthDate: applicationData.childBirthDate || '',
        childGender: applicationData.childGender || '',
        desiredStartDate: applicationData.desiredStartDate || '',
        notes: applicationData.notes || '',
      };

      await downloadAutoFilledPDF(
        assetUri,
        'temporary_care_application',
        pdfData,
        filename
      );

      Alert.alert('成功', '入力済みPDFのダウンロードを開始しました');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'PDFの自動入力に失敗しました';
      Alert.alert('エラー', errorMessage);
      console.error('PDF auto-fill error:', error);
    } finally {
      setIsGenerating(false);
    }
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

      {isLoading ? (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>申請書を読み込み中です</Text>
        </View>
      ) : loadError || !applicationData ? (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>申請書を表示できませんでした</Text>
          <Text style={styles.stateDescription}>{loadError || '不明なエラーが発生しました。'}</Text>
          <TouchableOpacity style={styles.stateButton} onPress={() => router.back()}>
            <Text style={styles.stateButtonText}>戻る</Text>
          </TouchableOpacity>
        </View>
      ) : showPdfPreview && pdfUri ? (
        <View style={styles.pdfContainer}>
          <PdfPreview
            uri={pdfUri}
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
              <Text style={styles.value}>{applicationData.facilityName || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>希望開始日:</Text>
              <Text style={styles.value}>{applicationData.desiredStartDate || '-'}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>保護者情報</Text>
            <View style={styles.row}>
              <Text style={styles.label}>氏名:</Text>
              <Text style={styles.value}>{applicationData.parentName || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>電話番号:</Text>
              <Text style={styles.value}>{applicationData.parentPhone || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>メールアドレス:</Text>
              <Text style={styles.value}>{applicationData.parentEmail || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>住所:</Text>
              <Text style={styles.value}>{applicationData.address || '-'}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>お子様情報</Text>
            <View style={styles.row}>
              <Text style={styles.label}>氏名:</Text>
              <Text style={styles.value}>{applicationData.childName || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>生年月日:</Text>
              <Text style={styles.value}>{applicationData.childBirthDate || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>性別:</Text>
              <Text style={styles.value}>{applicationData.childGender || '-'}</Text>
            </View>
          </View>

          {applicationData.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>備考</Text>
              <Text style={styles.notesText}>{applicationData.notes}</Text>
            </View>
          )}
        </View>

          <Footer />
        </ScrollView>
      )}

      {/* 改善されたボタン配置: 3段レイアウト with 優先順位の明確化 */}
      {applicationData && (
      <View style={styles.actionSection}>
        {/* プライマリーアクション: 自動入力ダウンロード */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            (isGenerating || Platform.OS !== 'web') && styles.buttonDisabled
          ]}
          onPress={handleAutoFillDownload}
          disabled={isGenerating || Platform.OS !== 'web'}
        >
          <Download size={20} color="white" />
          <Text style={styles.primaryButtonText}>
            自動入力してダウンロード
          </Text>
          {Platform.OS !== 'web' && (
            <Text style={styles.badgeText}>Web版のみ</Text>
          )}
        </TouchableOpacity>

        {/* セカンダリーアクション: 横並びボタン */}
        <View style={styles.secondaryRow}>
          <TouchableOpacity
            style={[styles.secondaryButton, styles.previewButton]}
            onPress={handlePreview}
            disabled={isGenerating}
          >
            <Text style={styles.secondaryButtonText}>
              {isGenerating ? 'PDF読込中...' : 'PDFプレビュー'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              styles.downloadButton,
              (isGenerating || Platform.OS !== 'web') && styles.buttonDisabled
            ]}
            onPress={handleDownload}
            disabled={isGenerating || Platform.OS !== 'web'}
          >
            <Download size={18} color={colors.accent} />
            <Text style={styles.downloadOnlyText}>通常DL</Text>
          </TouchableOpacity>
        </View>

        {/* 説明テキスト */}
        <Text style={styles.actionHint}>
          💡 「自動入力してダウンロード」なら申請書への記入が不要です
        </Text>
      </View>
      )}
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
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: 8,
  },
  stateDescription: {
    fontSize: 14,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 20,
  },
  stateButton: {
    marginTop: 16,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.accentSoft,
  },
  stateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  previewCard: {
    marginHorizontal: Platform.OS === 'web' ? 32 : 16,
    marginVertical: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
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
  actionSection: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  previewButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
  },
  downloadButton: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  downloadOnlyText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  actionHint: {
    fontSize: 12,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
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
