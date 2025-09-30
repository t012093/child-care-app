import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
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
    <View style={containerStyle}>
      <ImageBackground
        source={require('../assets/images/sample1.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
        imageStyle={{ opacity: 0.15 }}
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Building2 size={48} color={facilityColors.primary} strokeWidth={2} />
            </View>

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
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 0,
  },
  containerTablet: {
    marginVertical: 0,
  },
  containerDesktop: {
    marginVertical: 0,
  },
  backgroundImage: {
    minHeight: 400,
  },
  overlay: {
    flex: 1,
    backgroundColor: facilityColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  content: {
    maxWidth: 600,
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    backgroundColor: facilityColors.accentSoft,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: facilityColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: facilityColors.textMain,
    textAlign: 'center',
    marginBottom: 16,
  },
  titleTablet: {
    fontSize: 32,
  },
  titleDesktop: {
    fontSize: 36,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: facilityColors.textSub,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  subtitleTablet: {
    fontSize: 18,
    lineHeight: 28,
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
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
    shadowColor: facilityColors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: facilityColors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: facilityColors.primary,
  },
});