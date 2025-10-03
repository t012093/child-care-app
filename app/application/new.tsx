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
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '../../constants/colors';

export default function NewApplicationScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // フォームデータ
  const [formData, setFormData] = useState({
    // 基本情報
    facilityName: '',
    applicationType: '入園申請' as '入園申請' | '一時預かり申請' | 'その他',
    // 保護者情報
    parentName: '花田 さゆり',
    parentPhone: '090-1234-5678',
    parentEmail: 'sayuri.hanada@example.com',
    address: '',
    // 子供情報
    childName: '',
    childBirthDate: '',
    childGender: '男' as '男' | '女',
    // その他
    desiredStartDate: '',
    notes: '',
  });

  const updateFormData = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // PDF生成してプレビューへ
    router.push('/application/preview/new');
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
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
            {step === 1 ? '基本情報' : step === 2 ? '詳細情報' : '確認'}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>基本情報</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>施設名 *</Text>
        <TextInput
          style={styles.input}
          value={formData.facilityName}
          onChangeText={(value) => updateFormData('facilityName', value)}
          placeholder="例: さくら保育園"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>申請種別 *</Text>
        <View style={styles.radioGroup}>
          {['入園申請', '一時預かり申請', 'その他'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.radioButton,
                formData.applicationType === type && styles.radioButtonActive,
              ]}
              onPress={() => updateFormData('applicationType', type)}
            >
              <Text
                style={[
                  styles.radioText,
                  formData.applicationType === type && styles.radioTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>希望開始日 *</Text>
        <TextInput
          style={styles.input}
          value={formData.desiredStartDate}
          onChangeText={(value) => updateFormData('desiredStartDate', value)}
          placeholder="2025-04-01"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>詳細情報</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>保護者氏名 *</Text>
        <TextInput
          style={styles.input}
          value={formData.parentName}
          onChangeText={(value) => updateFormData('parentName', value)}
          placeholder="山田 花子"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>住所 *</Text>
        <TextInput
          style={styles.input}
          value={formData.address}
          onChangeText={(value) => updateFormData('address', value)}
          placeholder="東京都渋谷区..."
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>お子様の氏名 *</Text>
        <TextInput
          style={styles.input}
          value={formData.childName}
          onChangeText={(value) => updateFormData('childName', value)}
          placeholder="山田 太郎"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>お子様の生年月日 *</Text>
        <TextInput
          style={styles.input}
          value={formData.childBirthDate}
          onChangeText={(value) => updateFormData('childBirthDate', value)}
          placeholder="2023-05-15"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>性別 *</Text>
        <View style={styles.radioGroup}>
          {['男', '女'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.radioButton,
                formData.childGender === gender && styles.radioButtonActive,
              ]}
              onPress={() => updateFormData('childGender', gender)}
            >
              <Text
                style={[
                  styles.radioText,
                  formData.childGender === gender && styles.radioTextActive,
                ]}
              >
                {gender}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>確認</Text>

      <View style={styles.confirmSection}>
        <Text style={styles.confirmLabel}>施設名</Text>
        <Text style={styles.confirmValue}>{formData.facilityName || '-'}</Text>
      </View>

      <View style={styles.confirmSection}>
        <Text style={styles.confirmLabel}>申請種別</Text>
        <Text style={styles.confirmValue}>{formData.applicationType}</Text>
      </View>

      <View style={styles.confirmSection}>
        <Text style={styles.confirmLabel}>保護者氏名</Text>
        <Text style={styles.confirmValue}>{formData.parentName}</Text>
      </View>

      <View style={styles.confirmSection}>
        <Text style={styles.confirmLabel}>お子様氏名</Text>
        <Text style={styles.confirmValue}>{formData.childName || '-'}</Text>
      </View>

      <View style={styles.confirmSection}>
        <Text style={styles.confirmLabel}>希望開始日</Text>
        <Text style={styles.confirmValue}>{formData.desiredStartDate || '-'}</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>備考</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.notes}
          onChangeText={(value) => updateFormData('notes', value)}
          placeholder="その他、伝えたいことがあれば記入してください"
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.title}>新規申請書作成</Text>
        <View style={{ width: 24 }} />
      </View>

      {renderStepIndicator()}

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        <View style={styles.footer} />
      </ScrollView>

      <View style={styles.buttonContainer}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevious}>
            <Text style={styles.secondaryButtonText}>戻る</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, currentStep === 1 && styles.primaryButtonFull]}
          onPress={currentStep === 3 ? handleSubmit : handleNext}
        >
          <Text style={styles.primaryButtonText}>
            {currentStep === 3 ? 'プレビュー' : '次へ'}
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
    paddingHorizontal: 32,
    paddingVertical: 24,
    backgroundColor: colors.surface,
    marginBottom: 16,
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
    fontSize: 12,
    color: colors.textSub,
  },
  scrollContainer: {
    flex: 1,
  },
  stepContent: {
    padding: 16,
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
  footer: {
    height: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
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
