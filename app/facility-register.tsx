import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Building2, Mail, Lock, Phone, MapPin, ArrowLeft } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { facilityColors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { getPersistedFacilityDistrict } from '@/lib/facilityDistrict';
import { prefectures, getDistrictsByPrefecture } from '@/constants/regions';

export default function FacilityRegisterScreen() {
  const [facilityName, setFacilityName] = useState('');
  const [facilityType, setFacilityType] = useState<string>('nursery');
  const [prefecture, setPrefecture] = useState<string>('hokkaido');
  const [district, setDistrict] = useState<string>('central');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 選択された都道府県に応じた市区町村リストを取得
  const availableDistricts = getDistrictsByPrefecture(prefecture);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    // バリデーション
    if (!facilityName.trim()) {
      Alert.alert('入力エラー', '施設名を入力してください。');
      return;
    }

    if (!email.trim()) {
      Alert.alert('入力エラー', 'メールアドレスを入力してください。');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('入力エラー', '正しいメールアドレスを入力してください。');
      return;
    }

    if (!password.trim()) {
      Alert.alert('入力エラー', 'パスワードを入力してください。');
      return;
    }

    if (password.length < 8) {
      Alert.alert('入力エラー', 'パスワードは8文字以上で入力してください。');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('入力エラー', 'パスワードが一致しません。');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('入力エラー', '電話番号を入力してください。');
      return;
    }

    if (!address.trim()) {
      Alert.alert('入力エラー', '住所を入力してください。');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Supabase Authでユーザー登録
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            facility_name: facilityName.trim(),
            role: 'facility_owner',
          },
        },
      });

      if (authError) {
        console.error('Auth error:', authError);
        Alert.alert('登録エラー', authError.message || '認証に失敗しました。');
        return;
      }

      if (!authData.user) {
        Alert.alert('登録エラー', 'ユーザー登録に失敗しました。');
        return;
      }

      const userId = authData.user.id;

      // 2. facilitiesテーブルに施設情報を登録
      // 都道府県名を取得
      const prefectureName = prefectures.find(p => p.id === prefecture)?.name || '北海道';

      // デフォルト座標（都道府県に応じて設定）
      const defaultCoords = prefecture === 'toyama'
        ? { lat: 36.695, lng: 137.213 } // 富山市中心
        : { lat: 43.064, lng: 141.346 }; // 札幌市中心

      const { data: facilityData, error: facilityError } = await supabase
        .from('facilities')
        .insert({
          name: facilityName.trim(),
          type: facilityType as any,
          prefecture: prefectureName,
          district: getPersistedFacilityDistrict(district),
          address: address.trim(),
          phone: phoneNumber.trim(),
          email: email.trim(),
          // デフォルト値（位置情報は後で追加）
          lat: defaultCoords.lat,
          lng: defaultCoords.lng,
          category: facilityType,
          stock: 0,
          featured: false,
          rating: 0,
          images: [],
          owner_user_id: userId,
          status: 'pending_approval', // 承認待ち
          has_lunch: false,
        })
        .select()
        .single();

      if (facilityError) {
        console.error('Facility error:', facilityError);
        Alert.alert('登録エラー', '施設情報の登録に失敗しました。');
        // ユーザーは作成されたので、ログアウト
        await supabase.auth.signOut();
        return;
      }

      if (!facilityData) {
        Alert.alert('登録エラー', '施設情報の登録に失敗しました。');
        await supabase.auth.signOut();
        return;
      }

      // 3. facility_staffテーブルにオーナーとして登録
      const { error: staffError } = await supabase
        .from('facility_staff')
        .insert({
          facility_id: facilityData.id,
          user_id: userId,
          role: 'owner',
          name: facilityName.trim(), // 施設名をスタッフ名として使用（後で変更可能）
          email: email.trim(),
          phone: phoneNumber.trim(),
          status: 'active',
          joined_at: new Date().toISOString(),
        });

      if (staffError) {
        console.error('Staff error:', staffError);
        // エラーでも続行（後で手動追加可能）
      }

      // 4. 登録完了メッセージ
      Alert.alert(
        '登録完了',
        '施設の新規登録が完了しました。\n\n確認メールをご確認の上、メール内のリンクをクリックしてアカウントを有効化してください。',
        [
          {
            text: 'OK',
            onPress: () => router.push('/facility-login' as any),
          },
        ]
      );
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('登録エラー', '予期しないエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={facilityColors.background} />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={[facilityColors.background, facilityColors.accentSoft]}
          style={styles.gradient}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <ArrowLeft size={24} color={facilityColors.primary} />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Building2 size={40} color={facilityColors.primary} strokeWidth={2} />
              </View>
              <Text style={styles.title}>施設新規登録</Text>
              <Text style={styles.subtitle}>
                施設情報を入力して{'\n'}管理システムを始めましょう
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>施設名 *</Text>
                <View style={styles.inputWrapper}>
                  <Building2 size={20} color={facilityColors.textSub} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={facilityName}
                    onChangeText={setFacilityName}
                    placeholder="〇〇保育園"
                    placeholderTextColor={facilityColors.textSub}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>施設タイプ *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={facilityType}
                    onValueChange={(value) => setFacilityType(value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="認可保育所" value="licensed" />
                    <Picker.Item label="認可外保育施設" value="nursery" />
                    <Picker.Item label="一時預かり" value="temporary-care" />
                    <Picker.Item label="病児保育" value="sick-child" />
                    <Picker.Item label="クリニック" value="clinic" />
                  </Picker>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>都道府県 *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={prefecture}
                    onValueChange={(value) => {
                      setPrefecture(value);
                      // 都道府県が変更されたら、最初の市区町村を選択
                      const districts = getDistrictsByPrefecture(value);
                      if (districts.length > 0) {
                        setDistrict(districts[0].id);
                      }
                    }}
                    style={styles.picker}
                  >
                    {prefectures.map((pref) => (
                      <Picker.Item key={pref.id} label={pref.name} value={pref.id} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>市区町村 *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={district}
                    onValueChange={(value) => setDistrict(value)}
                    style={styles.picker}
                  >
                    {availableDistricts.map((dist) => (
                      <Picker.Item key={dist.id} label={dist.label} value={dist.id} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>メールアドレス *</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={20} color={facilityColors.textSub} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="facility@example.com"
                    placeholderTextColor={facilityColors.textSub}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>パスワード *</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color={facilityColors.textSub} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="8文字以上で入力"
                    placeholderTextColor={facilityColors.textSub}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>パスワード（確認） *</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color={facilityColors.textSub} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="パスワードを再入力"
                    placeholderTextColor={facilityColors.textSub}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>電話番号 *</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={20} color={facilityColors.textSub} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="03-1234-5678"
                    placeholderTextColor={facilityColors.textSub}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>住所 *</Text>
                <View style={styles.inputWrapper}>
                  <MapPin size={20} color={facilityColors.textSub} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="東京都〇〇区..."
                    placeholderTextColor={facilityColors.textSub}
                  />
                </View>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  📝 登録後、担当者が内容を確認し、ご連絡いたします。
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.registerButton, isLoading && styles.disabledButton]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={styles.registerButtonText}>
                  {isLoading ? '登録中...' : '登録する'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>すでにアカウントをお持ちの方</Text>
              <TouchableOpacity onPress={() => router.push('/facility-login' as any)}>
                <Text style={styles.loginLink}>ログイン</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: facilityColors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    // Web版での中央配置とレスポンシブ対応
    ...(Platform.OS === 'web' && {
      maxWidth: 600,
      alignSelf: 'center',
      width: '100%',
    }),
  },
  backButton: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 32,
    // Web版では上部パディングを調整
    ...(Platform.OS === 'web' && {
      paddingTop: 40,
      paddingBottom: 40,
    }),
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: facilityColors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: facilityColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: facilityColors.textMain,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: facilityColors.textSub,
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: facilityColors.textMain,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: facilityColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: facilityColors.accentSoft,
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
    fontSize: 16,
    color: facilityColors.textMain,
    // Web版では少しコンパクトに
    ...(Platform.OS === 'web' && {
      paddingVertical: 12,
      fontSize: 15,
    }),
  },
  pickerWrapper: {
    backgroundColor: facilityColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: facilityColors.accentSoft,
    overflow: 'hidden',
  },
  picker: {
    height: Platform.OS === 'ios' ? 180 : 50,
    color: facilityColors.textMain,
  },
  infoBox: {
    backgroundColor: facilityColors.accentSoft,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: facilityColors.textMain,
    lineHeight: 20,
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: facilityColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: facilityColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    // Web版では標準的なボタンサイズに
    ...(Platform.OS === 'web' && {
      paddingVertical: 14,
      borderRadius: 8,
      shadowOpacity: 0.2,
      shadowRadius: 6,
    }),
  },
  disabledButton: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: facilityColors.surface,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 16,
    color: facilityColors.textSub,
    marginBottom: 8,
  },
  loginLink: {
    fontSize: 16,
    color: facilityColors.primary,
    fontWeight: '600',
  },
});
