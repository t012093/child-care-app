import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Building2, MapPin, Phone, Clock, Users } from 'lucide-react-native';
import { facilityColors } from '../../constants/colors';
import { useResponsive } from '../../hooks/useResponsive';

export default function FacilityInfoScreen() {
  const { horizontalPadding, isDesktop, maxContentWidth } = useResponsive();
  const [isEditing, setIsEditing] = useState(false);

  // フォームの状態
  const [facilityName, setFacilityName] = useState('さくら保育園');
  const [address, setAddress] = useState('東京都渋谷区〇〇1-2-3');
  const [phoneNumber, setPhoneNumber] = useState('03-1234-5678');
  const [openingHours, setOpeningHours] = useState('平日 9:00-18:00');
  const [capacity, setCapacity] = useState('20');

  const handleSave = () => {
    Alert.alert('保存完了', '施設情報を更新しました。');
    setIsEditing(false);
  };

  const containerStyle = {
    paddingHorizontal: horizontalPadding,
  };

  const contentStyle = [
    isDesktop && {
      maxWidth: maxContentWidth,
      alignSelf: 'center',
      width: '100%',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, containerStyle]}>
        <View style={styles.headerTop}>
          <Building2 size={24} color={facilityColors.primary} />
          <Text style={styles.headerTitle}>施設情報</Text>
        </View>

        {!isEditing && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>編集</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[containerStyle, contentStyle]}
      >
        <View style={styles.formSection}>
          {/* 施設名 */}
          <View style={styles.inputContainer}>
            <View style={styles.inputLabel}>
              <Building2 size={20} color={facilityColors.textSub} />
              <Text style={styles.labelText}>施設名</Text>
            </View>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={facilityName}
              onChangeText={setFacilityName}
              editable={isEditing}
              placeholder="施設名を入力"
              placeholderTextColor={facilityColors.textSub}
            />
          </View>

          {/* 住所 */}
          <View style={styles.inputContainer}>
            <View style={styles.inputLabel}>
              <MapPin size={20} color={facilityColors.textSub} />
              <Text style={styles.labelText}>住所</Text>
            </View>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={address}
              onChangeText={setAddress}
              editable={isEditing}
              placeholder="住所を入力"
              placeholderTextColor={facilityColors.textSub}
              multiline
            />
          </View>

          {/* 電話番号 */}
          <View style={styles.inputContainer}>
            <View style={styles.inputLabel}>
              <Phone size={20} color={facilityColors.textSub} />
              <Text style={styles.labelText}>電話番号</Text>
            </View>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              editable={isEditing}
              placeholder="電話番号を入力"
              placeholderTextColor={facilityColors.textSub}
              keyboardType="phone-pad"
            />
          </View>

          {/* 営業時間 */}
          <View style={styles.inputContainer}>
            <View style={styles.inputLabel}>
              <Clock size={20} color={facilityColors.textSub} />
              <Text style={styles.labelText}>営業時間</Text>
            </View>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={openingHours}
              onChangeText={setOpeningHours}
              editable={isEditing}
              placeholder="営業時間を入力"
              placeholderTextColor={facilityColors.textSub}
            />
          </View>

          {/* 定員 */}
          <View style={styles.inputContainer}>
            <View style={styles.inputLabel}>
              <Users size={20} color={facilityColors.textSub} />
              <Text style={styles.labelText}>定員</Text>
            </View>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={capacity}
              onChangeText={setCapacity}
              editable={isEditing}
              placeholder="定員を入力"
              placeholderTextColor={facilityColors.textSub}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: facilityColors.background,
  },
  header: {
    backgroundColor: facilityColors.surface,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: facilityColors.accentSoft,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: facilityColors.textMain,
    flex: 1,
  },
  editButton: {
    position: 'absolute',
    right: 24,
    top: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: facilityColors.primary,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  formSection: {
    backgroundColor: facilityColors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  labelText: {
    fontSize: 16,
    fontWeight: '600',
    color: facilityColors.textMain,
  },
  input: {
    backgroundColor: facilityColors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: facilityColors.accentSoft,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: facilityColors.textMain,
  },
  inputDisabled: {
    backgroundColor: facilityColors.surface,
    color: facilityColors.textSub,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: facilityColors.surface,
    borderWidth: 1,
    borderColor: facilityColors.textSub,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: facilityColors.textSub,
  },
  saveButton: {
    flex: 1,
    backgroundColor: facilityColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: facilityColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  footer: {
    height: 40,
  },
});