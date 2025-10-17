import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Download, FileText } from 'lucide-react-native';
import Footer from '../../../../components/Footer';
import { colors } from '../../../../constants/colors';
import { EmploymentCertificateData } from '../../../../utils/excelFieldMappings';
import {
  generateEmploymentCertificateExcel,
  downloadExcel,
  downloadTemplateExcel,
} from '../../../../utils/excelGenerator';

export default function EmploymentCertificatePreviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [formData, setFormData] = useState<EmploymentCertificateData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // URLパラメータからデータをデコード
    try {
      const decodedData = JSON.parse(decodeURIComponent(id as string));
      setFormData(decodedData);
    } catch (error) {
      console.error('Failed to parse form data:', error);
      Alert.alert('エラー', 'データの読み込みに失敗しました');
    }
  }, [id]);

  const handleDownload = async () => {
    if (!formData) {
      Alert.alert('エラー', 'データが見つかりません');
      return;
    }

    if (Platform.OS !== 'web') {
      Alert.alert(
        '機能制限',
        'Excel自動入力機能はWeb版でのみ利用可能です。\nテンプレートをダウンロードして手動で入力してください。',
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: 'テンプレートダウンロード',
            onPress: handleDownloadTemplate,
          },
        ]
      );
      return;
    }

    setIsGenerating(true);

    try {
      const buffer = await generateEmploymentCertificateExcel(formData);

      if (!buffer) {
        throw new Error('Excel生成に失敗しました');
      }

      const filename = `就労証明書_${formData.parentName}_${formData.issueDate}.xlsx`;
      await downloadExcel(buffer, filename);

      Alert.alert('成功', 'Excelファイルをダウンロードしました');
    } catch (error) {
      console.error('Excel generation error:', error);
      Alert.alert(
        'エラー',
        'Excelファイルの生成に失敗しました。\n' +
          (error instanceof Error ? error.message : '不明なエラー')
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const filename = `就労証明書_テンプレート.xlsx`;
      await downloadTemplateExcel(filename);
      Alert.alert('成功', 'テンプレートをダウンロードしました');
    } catch (error) {
      console.error('Template download error:', error);
      Alert.alert('エラー', 'テンプレートのダウンロードに失敗しました');
    }
  };

  if (!formData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>読み込み中...</Text>
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
        <Text style={styles.title}>就労証明書プレビュー</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* 注意書き */}
          <View style={styles.noticeCard}>
            <FileText size={20} color={colors.accent} />
            <Text style={styles.noticeText}>
              {Platform.OS === 'web'
                ? 'この内容でExcelファイルを生成します。内容を確認の上、ダウンロードしてください。'
                : 'モバイル版では自動入力機能は未対応です。テンプレートをダウンロードして手動で入力してください。'}
            </Text>
          </View>

          {/* 雇用主情報 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>雇用主情報</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>事業所名</Text>
              <Text style={styles.infoValue}>{formData.employerName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>事業所所在地</Text>
              <Text style={styles.infoValue}>{formData.employerAddress}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>電話番号</Text>
              <Text style={styles.infoValue}>{formData.employerPhone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>事業主氏名</Text>
              <Text style={styles.infoValue}>{formData.employerRepresentative}</Text>
            </View>
          </View>

          {/* 保護者情報 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>保護者情報</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>氏名</Text>
              <Text style={styles.infoValue}>{formData.parentName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>住所</Text>
              <Text style={styles.infoValue}>{formData.parentAddress}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>生年月日</Text>
              <Text style={styles.infoValue}>{formData.parentBirthDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>雇用開始日</Text>
              <Text style={styles.infoValue}>{formData.hireDate}</Text>
            </View>
          </View>

          {/* 勤務情報 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>勤務情報</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>雇用形態</Text>
              <Text style={styles.infoValue}>{formData.employmentType}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>週勤務日数</Text>
              <Text style={styles.infoValue}>{formData.workingDaysPerWeek}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>週勤務時間</Text>
              <Text style={styles.infoValue}>{formData.workingHoursPerWeek}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>勤務時間</Text>
              <Text style={styles.infoValue}>
                {formData.workStartTime} 〜 {formData.workEndTime}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>業務内容</Text>
              <Text style={styles.infoValue}>{formData.jobDescription}</Text>
            </View>
          </View>

          {/* 証明書発行情報 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>証明書発行情報</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>発行日</Text>
              <Text style={styles.infoValue}>{formData.issueDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>発行者氏名</Text>
              <Text style={styles.infoValue}>{formData.issuerName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>発行者役職</Text>
              <Text style={styles.infoValue}>{formData.issuerTitle}</Text>
            </View>
          </View>
        </View>

        <Footer />
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>戻って編集</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleDownload}
          disabled={isGenerating}
        >
          <Download size={20} color="white" />
          <Text style={styles.primaryButtonText}>
            {isGenerating ? '生成中...' : 'ダウンロード'}
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSub,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    paddingVertical: 16,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    color: colors.textMain,
    lineHeight: 20,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSub,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: colors.textMain,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
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
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
  },
});
