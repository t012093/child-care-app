import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { facilityColors } from '../../constants/colors';
import { ReservationByType } from '../../hooks/useDashboardStats';

interface ReservationPieChartProps {
  data: ReservationByType[];
}

export default function ReservationPieChart({ data }: ReservationPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>予約タイプ別</Text>
        <Text style={styles.subtitle}>今月の内訳</Text>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalValue}>{total}</Text>
        <Text style={styles.totalLabel}>件</Text>
      </View>

      <View style={styles.legend}>
        {data.map((item, index) => {
          const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0.0';
          return (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <View style={styles.legendTextContainer}>
                <Text style={styles.legendLabel}>{item.type}</Text>
                <Text style={styles.legendValue}>
                  {item.count}件 ({percentage}%)
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${percentage}%`,
                      backgroundColor: item.color,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: facilityColors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: facilityColors.textMain,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: facilityColors.textSub,
  },
  totalCard: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 16,
    backgroundColor: facilityColors.background,
    borderRadius: 12,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '700',
    color: facilityColors.textMain,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: facilityColors.textSub,
    marginTop: 2,
  },
  legend: {
    gap: 16,
  },
  legendItem: {
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: facilityColors.textMain,
  },
  legendValue: {
    fontSize: 11,
    fontWeight: '500',
    color: facilityColors.textSub,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: facilityColors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
});
