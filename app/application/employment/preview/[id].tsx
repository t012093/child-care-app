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
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, FileText } from 'lucide-react-native';
import Footer from '../../../../components/Footer';
import { colors } from '../../../../constants/colors';
import {
  EmploymentCertificateData,
  normalizeEmploymentCertificateData,
} from '../../../../utils/excelFieldMappings';

export default function EmploymentCertificatePreviewScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<EmploymentCertificateData | null>(null);

  useEffect(() => {
    // AsyncStorageからデータを読み込み
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('employment_certificate_draft');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setFormData(normalizeEmploymentCertificateData(parsedData));
        } else {
          Alert.alert('エラー', 'データが見つかりません');
          router.back();
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
        Alert.alert('エラー', 'データの読み込みに失敗しました');
        router.back();
      }
    };

    loadData();
  }, []);

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
              下記の入力内容を確認してください。
              {'\n\n'}
              就労証明書のExcelテンプレートは、お勤め先の会社または札幌市のWebサイトからダウンロードしてください。
              {'\n\n'}
              この画面の内容を参考に、Excelファイルに手動で入力してください。
            </Text>
          </View>

          {/* 雇用主情報 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>事業所情報</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>業種</Text>
              <Text style={styles.infoValue}>{formData.employerIndustry || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>事業所名</Text>
              <Text style={styles.infoValue}>{formData.employerName || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>事業所所在地</Text>
              <Text style={styles.infoValue}>{formData.employerAddress || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>電話番号</Text>
              <Text style={styles.infoValue}>{formData.employerPhone || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>事業主氏名</Text>
              <Text style={styles.infoValue}>{formData.employerRepresentative || '-'}</Text>
            </View>
          </View>

          {/* 本人・就労先情報 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>本人・就労先情報</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>フリガナ</Text>
              <Text style={styles.infoValue}>{formData.parentKana || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>氏名</Text>
              <Text style={styles.infoValue}>{formData.parentName || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>本人就労先事業所名</Text>
              <Text style={styles.infoValue}>{formData.workplaceName || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>本人就労先住所</Text>
              <Text style={styles.infoValue}>{formData.workplaceAddress || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>生年月日</Text>
              <Text style={styles.infoValue}>{formData.parentBirthDate || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>雇用開始日</Text>
              <Text style={styles.infoValue}>{formData.hireDate || '-'}</Text>
            </View>
          </View>

          {/* 就労条件 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>就労条件</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>雇用形態</Text>
              <Text style={styles.infoValue}>{formData.employmentType || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>就労パターン</Text>
              <Text style={styles.infoValue}>
                {formData.scheduleType === 'fixed' ? '固定就労' : '変則就労'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>月間就労日数</Text>
              <Text style={styles.infoValue}>{formData.monthlyWorkDays || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>週勤務日数</Text>
              <Text style={styles.infoValue}>{formData.weeklyWorkDays || '-'}</Text>
            </View>

            {formData.scheduleType === 'fixed' ? (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>平日の勤務時間</Text>
                  <Text style={styles.infoValue}>
                    {formData.fixedWorkStartTime && formData.fixedWorkEndTime
                      ? `${formData.fixedWorkStartTime} 〜 ${formData.fixedWorkEndTime}`
                      : '-'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>休憩時間</Text>
                  <Text style={styles.infoValue}>
                    {formData.fixedBreakMinutes ? `${formData.fixedBreakMinutes}分` : '-'}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>変則就労日数</Text>
                  <Text style={styles.infoValue}>
                    {formData.variableWorkDays
                      ? `${formData.variableWorkDays}${formData.variableWorkDaysUnit === 'monthly' ? '日/月間' : '日/週間'}`
                      : '-'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>合計就労時間</Text>
                  <Text style={styles.infoValue}>
                    {formData.variableWorkHours
                      ? `${formData.variableWorkHours}時間/${formData.variableWorkHoursUnit === 'monthly' ? '月間' : '週間'}`
                      : '-'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>主な就労時間帯</Text>
                  <Text style={styles.infoValue}>
                    {formData.variableWorkStartTime && formData.variableWorkEndTime
                      ? `${formData.variableWorkStartTime} 〜 ${formData.variableWorkEndTime}`
                      : '-'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>休憩時間</Text>
                  <Text style={styles.infoValue}>
                    {formData.variableBreakMinutes ? `${formData.variableBreakMinutes}分` : '-'}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* 記載者情報 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>記載者情報</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>発行日</Text>
              <Text style={styles.infoValue}>{formData.issueDate || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>担当者名</Text>
              <Text style={styles.infoValue}>{formData.contactPersonName || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>記載者連絡先</Text>
              <Text style={styles.infoValue}>{formData.contactPhone || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>備考欄</Text>
              <Text style={styles.infoValue}>{formData.remarks || '-'}</Text>
            </View>
          </View>
        </View>

        <Footer />
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.primaryButton, styles.primaryButtonFull]}
          onPress={() => router.back()}
        >
          <Text style={styles.primaryButtonText}>戻って編集</Text>
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
  primaryButtonFull: {
    width: '100%',
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
