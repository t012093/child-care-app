import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { facilityColors } from '../constants/colors';
import { Trend } from '../hooks/useDashboardStats';

interface FacilityStatCardWithTrendProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
  trend?: Trend;
}

export default function FacilityStatCardWithTrend({
  icon: Icon,
  label,
  value,
  subtext,
  color = facilityColors.primary,
  trend,
}: FacilityStatCardWithTrendProps) {
  const getTrendColor = () => {
    if (!trend) return facilityColors.textSub;
    switch (trend.direction) {
      case 'up':
        return '#10B981'; // グリーン
      case 'down':
        return '#EF4444'; // レッド
      case 'neutral':
        return facilityColors.textSub;
    }
  };

  const TrendIcon = trend
    ? trend.direction === 'up'
      ? TrendingUp
      : trend.direction === 'down'
      ? TrendingDown
      : Minus
    : null;

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Icon size={24} color={color} strokeWidth={2} />
      </View>

      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>

      {subtext && <Text style={styles.subtext}>{subtext}</Text>}

      {trend && TrendIcon && (
        <View style={styles.trendContainer}>
          <TrendIcon size={14} color={getTrendColor()} strokeWidth={2.5} />
          <Text style={[styles.trendText, { color: getTrendColor() }]}>
            {trend.value}% {trend.comparisonText}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: facilityColors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: facilityColors.textMain,
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: facilityColors.textSub,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 12,
    color: facilityColors.textSub,
    marginTop: 4,
    textAlign: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: facilityColors.background,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
