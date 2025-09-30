import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Building2, LogIn } from 'lucide-react-native';
import { facilityColors } from '../constants/colors';
import { useResponsive } from '../hooks/useResponsive';

export default function FacilityHeroSection() {
  const router = useRouter();
  const { isTablet, isDesktop } = useResponsive();

  const containerStyle = [
    styles.container,
    isTablet && styles.containerTablet,
    isDesktop && styles.containerDesktop,
  ];

  const titleStyle = [
    styles.title,
    isTablet && styles.titleTablet,
    isDesktop && styles.titleDesktop,
  ];

  const subtitleStyle = [
    styles.subtitle,
    isTablet && styles.subtitleTablet,
  ];

  const ctaContainerStyle = [
    styles.ctaContainer,
    isTablet && styles.ctaContainerTablet,
  ];

  return (
    <LinearGradient
      colors={[facilityColors.background, facilityColors.accentSoft]}
      style={containerStyle}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <Text style={titleStyle}>保育施設向け管理システム</Text>
        <Text style={subtitleStyle}>
          施設情報の管理・予約受付を{'\n'}もっと簡単に、もっとスマートに
        </Text>

        <View style={ctaContainerStyle}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/facility-register' as any)}
          >
            <Building2 size={20} color="white" />
            <Text style={styles.primaryButtonText}>新規登録</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/facility-login' as any)}
          >
            <LogIn size={20} color={facilityColors.primary} />
            <Text style={styles.secondaryButtonText}>ログイン</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  containerTablet: {
    paddingVertical: 40,
  },
  containerDesktop: {
    paddingVertical: 48,
  },
  content: {
    maxWidth: 600,
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: facilityColors.textMain,
    textAlign: 'center',
    marginBottom: 12,
  },
  titleTablet: {
    fontSize: 28,
  },
  titleDesktop: {
    fontSize: 32,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: facilityColors.textSub,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  subtitleTablet: {
    fontSize: 16,
    lineHeight: 24,
  },
  ctaContainer: {
    width: '100%',
    gap: 12,
  },
  ctaContainerTablet: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: facilityColors.accent,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    gap: 8,
    shadowColor: facilityColors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: facilityColors.surface,
    borderWidth: 2,
    borderColor: facilityColors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: facilityColors.primary,
  },
});