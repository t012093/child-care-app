import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { facilityColors } from '../constants/colors';
import { useResponsive } from '../hooks/useResponsive';

interface FacilityFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function FacilityFeatureCard({ icon: Icon, title, description }: FacilityFeatureCardProps) {
  const { isTablet, isDesktop } = useResponsive();

  const cardStyle = [
    styles.card,
    isTablet && styles.cardTablet,
    isDesktop && styles.cardDesktop,
  ];

  return (
    <View style={cardStyle}>
      <View style={styles.iconContainer}>
        <Icon size={32} color={facilityColors.primary} strokeWidth={2} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: facilityColors.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  cardTablet: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 0,
  },
  cardDesktop: {
    padding: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: facilityColors.accentSoft,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: facilityColors.textMain,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: facilityColors.textSub,
    textAlign: 'center',
    lineHeight: 20,
  },
});