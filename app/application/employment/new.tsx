import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft } from 'lucide-react-native';
import Footer from '../../../components/Footer';
import { colors } from '../../../constants/colors';
import {
  createEmptyEmploymentCertificateData,
  EmploymentCertificateData,
  employmentIndustryOptions,
  employmentTypes,
  scheduleTypes,
  workloadUnits,
} from '../../../utils/excelFieldMappings';

export default function NewEmploymentCertificateScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // フォームデータ
  const [formData, setFormData] = useState<EmploymentCertificateData>(
    createEmptyEmploymentCertificateData()
  );

  const updateFormData = (key: keyof EmploymentCertificateData, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // データをAsyncStorageに一時保存
      await AsyncStorage.setItem('employment_certificate_draft', JSON.stringify(formData));
      // プレビュー画面へ遷移
      router.push('/application/employment/preview/draft');
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((step) => (
        <View key={step} style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              currentStep >= step && styles.stepCircleActive,
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                currentStep >= step && styles.stepNumberActive,
              ]}
            >
              {step}
            </Text>
          </View>
          <Text style={styles.stepLabel}>
            {step === 1
              ? '事業所情報'
              : step === 2
              ? '本人情報'
              : step === 3
              ? '就労条件'
              : '記載者・確認'}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>事業所情報</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>業種 *</Text>
        <View style={styles.radioGroup}>
          {employmentIndustryOptions.map((industry) => (
            <TouchableOpacity
              key={industry}
              style={[
                styles.radioButton,
                formData.employerIndustry === industry && styles.radioButtonActive,
              ]}
              onPress={() => updateFormData('employerIndustry', industry)}
            >
              <Text
                style={[
                  styles.radioText,
                  formData.employerIndustry === industry && styles.radioTextActive,
                ]}
              >
                {industry}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>事業所名 *</Text>
        <TextInput
          style={styles.input}
          value={formData.employerName}
          onChangeText={(value) => updateFormData('employerName', value)}
          placeholder="例: 株式会社サンプル"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>事業所所在地 *</Text>
        <TextInput
          style={styles.input}
          value={formData.employerAddress}
          onChangeText={(value) => updateFormData('employerAddress', value)}
          placeholder="例: 北海道札幌市中央区..."
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>電話番号 *</Text>
        <TextInput
          style={styles.input}
          value={formData.employerPhone}
          onChangeText={(value) => updateFormData('employerPhone', value)}
          placeholder="例: 011-123-4567"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>事業主氏名 *</Text>
        <TextInput
          style={styles.input}
          value={formData.employerRepresentative}
          onChangeText={(value) => updateFormData('employerRepresentative', value)}
          placeholder="例: 山田 太郎"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>本人・就労先情報</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>フリガナ</Text>
        <TextInput
          style={styles.input}
          value={formData.parentKana}
          onChangeText={(value) => updateFormData('parentKana', value)}
          placeholder="例: ハナダ サユリ"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>氏名 *</Text>
        <TextInput
          style={styles.input}
          value={formData.parentName}
          onChangeText={(value) => updateFormData('parentName', value)}
          placeholder="例: 花田 さゆり"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>本人就労先事業所名</Text>
        <TextInput
          style={styles.input}
          value={formData.workplaceName}
          onChangeText={(value) => updateFormData('workplaceName', value)}
          placeholder="例: 札幌支店"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>本人就労先住所</Text>
        <TextInput
          style={styles.input}
          value={formData.workplaceAddress}
          onChangeText={(value) => updateFormData('workplaceAddress', value)}
          placeholder="例: 北海道札幌市中央区..."
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>生年月日 *</Text>
        <TextInput
          style={styles.input}
          value={formData.parentBirthDate}
          onChangeText={(value) => updateFormData('parentBirthDate', value)}
          placeholder="例: 1990-01-01"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>雇用開始日 *</Text>
        <TextInput
          style={styles.input}
          value={formData.hireDate}
          onChangeText={(value) => updateFormData('hireDate', value)}
          placeholder="例: 2020-04-01"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>就労条件</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>雇用形態 *</Text>
        <View style={styles.radioGroup}>
          {employmentTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.radioButton,
                formData.employmentType === type && styles.radioButtonActive,
              ]}
              onPress={() => updateFormData('employmentType', type)}
            >
              <Text
                style={[
                  styles.radioText,
                  formData.employmentType === type && styles.radioTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>就労パターン *</Text>
        <View style={styles.radioGroup}>
          {scheduleTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.radioButton,
                formData.scheduleType === type && styles.radioButtonActive,
              ]}
              onPress={() => updateFormData('scheduleType', type)}
            >
              <Text
                style={[
                  styles.radioText,
                  formData.scheduleType === type && styles.radioTextActive,
                ]}
              >
                {type === 'fixed' ? '固定就労' : '変則就労'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>月間就労日数</Text>
        <TextInput
          style={styles.input}
          value={formData.monthlyWorkDays}
          onChangeText={(value) => updateFormData('monthlyWorkDays', value)}
          placeholder="例: 20"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>週就労日数 *</Text>
        <TextInput
          style={styles.input}
          value={formData.weeklyWorkDays}
          onChangeText={(value) => updateFormData('weeklyWorkDays', value)}
          placeholder="例: 5"
          keyboardType="numeric"
        />
      </View>

      {formData.scheduleType === 'fixed' ? (
        <>
          <View style={styles.formGroup}>
            <Text style={styles.label}>平日の開始時刻 *</Text>
            <TextInput
              style={styles.input}
              value={formData.fixedWorkStartTime}
              onChangeText={(value) => updateFormData('fixedWorkStartTime', value)}
              placeholder="例: 09:00"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>平日の終了時刻 *</Text>
            <TextInput
              style={styles.input}
              value={formData.fixedWorkEndTime}
              onChangeText={(value) => updateFormData('fixedWorkEndTime', value)}
              placeholder="例: 18:00"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>休憩時間（分）</Text>
            <TextInput
              style={styles.input}
              value={formData.fixedBreakMinutes}
              onChangeText={(value) => updateFormData('fixedBreakMinutes', value)}
              placeholder="例: 60"
              keyboardType="numeric"
            />
          </View>
        </>
      ) : (
        <>
          <View style={styles.formGroup}>
            <Text style={styles.label}>変則就労日数の単位</Text>
            <View style={styles.radioGroup}>
              {workloadUnits.map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.radioButton,
                    formData.variableWorkDaysUnit === unit && styles.radioButtonActive,
                  ]}
                  onPress={() => updateFormData('variableWorkDaysUnit', unit)}
                >
                  <Text
                    style={[
                      styles.radioText,
                      formData.variableWorkDaysUnit === unit && styles.radioTextActive,
                    ]}
                  >
                    {unit === 'monthly' ? '月間' : '週間'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>変則就労日数</Text>
            <TextInput
              style={styles.input}
              value={formData.variableWorkDays}
              onChangeText={(value) => updateFormData('variableWorkDays', value)}
              placeholder="例: 20"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>合計就労時間の単位</Text>
            <View style={styles.radioGroup}>
              {workloadUnits.map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.radioButton,
                    formData.variableWorkHoursUnit === unit && styles.radioButtonActive,
                  ]}
                  onPress={() => updateFormData('variableWorkHoursUnit', unit)}
                >
                  <Text
                    style={[
                      styles.radioText,
                      formData.variableWorkHoursUnit === unit && styles.radioTextActive,
                    ]}
                  >
                    {unit === 'monthly' ? '月間' : '週間'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>合計就労時間</Text>
            <TextInput
              style={styles.input}
              value={formData.variableWorkHours}
              onChangeText={(value) => updateFormData('variableWorkHours', value)}
              placeholder="例: 160"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>主な開始時刻</Text>
            <TextInput
              style={styles.input}
              value={formData.variableWorkStartTime}
              onChangeText={(value) => updateFormData('variableWorkStartTime', value)}
              placeholder="例: 09:00"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>主な終了時刻</Text>
            <TextInput
              style={styles.input}
              value={formData.variableWorkEndTime}
              onChangeText={(value) => updateFormData('variableWorkEndTime', value)}
              placeholder="例: 18:00"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>休憩時間（分）</Text>
            <TextInput
              style={styles.input}
              value={formData.variableBreakMinutes}
              onChangeText={(value) => updateFormData('variableBreakMinutes', value)}
              placeholder="例: 60"
              keyboardType="numeric"
            />
          </View>
        </>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>記載者情報</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>証明書発行日 *</Text>
        <TextInput
          style={styles.input}
          value={formData.issueDate}
          onChangeText={(value) => updateFormData('issueDate', value)}
          placeholder="例: 2025-10-17"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>担当者名 *</Text>
        <TextInput
          style={styles.input}
          value={formData.contactPersonName}
          onChangeText={(value) => updateFormData('contactPersonName', value)}
          placeholder="例: 山田 太郎"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>記載者連絡先</Text>
        <TextInput
          style={styles.input}
          value={formData.contactPhone}
          onChangeText={(value) => updateFormData('contactPhone', value)}
          placeholder="例: 011-987-6543"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>備考欄</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.remarks}
          onChangeText={(value) => updateFormData('remarks', value)}
          placeholder="補足がある場合のみ入力"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>入力内容確認</Text>

      <View style={styles.confirmSection}>
        <Text style={styles.confirmLabel}>事業所名</Text>
        <Text style={styles.confirmValue}>
          {formData.employerName || '-'}
        </Text>
      </View>

      <View style={styles.confirmSection}>
        <Text style={styles.confirmLabel}>保護者氏名</Text>
        <Text style={styles.confirmValue}>{formData.parentName || '-'}</Text>
      </View>

      <View style={styles.confirmSection}>
        <Text style={styles.confirmLabel}>本人就労先</Text>
        <Text style={styles.confirmValue}>
          {formData.workplaceName || formData.workplaceAddress
            ? `${formData.workplaceName || '名称未入力'} / ${formData.workplaceAddress || '住所未入力'}`
            : '-'}
        </Text>
      </View>

      <View style={styles.confirmSection}>
        <Text style={styles.confirmLabel}>雇用形態</Text>
        <Text style={styles.confirmValue}>{formData.employmentType}</Text>
      </View>

      <View style={styles.confirmSection}>
        <Text style={styles.confirmLabel}>勤務時間</Text>
        <Text style={styles.confirmValue}>
          {formData.scheduleType === 'fixed'
            ? formData.fixedWorkStartTime && formData.fixedWorkEndTime
              ? `${formData.fixedWorkStartTime} 〜 ${formData.fixedWorkEndTime}`
              : '-'
            : formData.variableWorkStartTime && formData.variableWorkEndTime
            ? `${formData.variableWorkStartTime} 〜 ${formData.variableWorkEndTime}`
            : '-'}
        </Text>
      </View>

      <View style={styles.confirmSection}>
        <Text style={styles.confirmLabel}>証明書発行日</Text>
        <Text style={styles.confirmValue}>{formData.issueDate || '-'}</Text>
      </View>

      <View style={styles.confirmSection}>
        <Text style={styles.confirmLabel}>担当者名</Text>
        <Text style={styles.confirmValue}>{formData.contactPersonName || '-'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.title}>就労証明書作成</Text>
        <View style={{ width: 24 }} />
      </View>

      {renderStepIndicator()}

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        <Footer />
      </ScrollView>

      <View style={styles.buttonContainer}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevious}>
            <Text style={styles.secondaryButtonText}>戻る</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, currentStep === 1 && styles.primaryButtonFull]}
          onPress={currentStep === 4 ? handleSubmit : handleNext}
        >
          <Text style={styles.primaryButtonText}>
            {currentStep === 4 ? 'プレビュー' : '次へ'}
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
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Platform.OS === 'web' ? 32 : 24,
    paddingVertical: 24,
    backgroundColor: colors.surface,
    marginBottom: 16,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: colors.accent,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  stepNumberActive: {
    color: 'white',
  },
  stepLabel: {
    fontSize: 11,
    color: colors.textSub,
  },
  scrollContainer: {
    flex: 1,
  },
  stepContent: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    paddingVertical: 16,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textMain,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: colors.surface,
  },
  radioButtonActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  radioText: {
    fontSize: 14,
    color: colors.textMain,
  },
  radioTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 24,
  },
  confirmSection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  confirmLabel: {
    fontSize: 12,
    color: colors.textSub,
    marginBottom: 4,
  },
  confirmValue: {
    fontSize: 16,
    color: colors.textMain,
    fontWeight: '500',
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
  },
  primaryButtonFull: {
    flex: 1,
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
