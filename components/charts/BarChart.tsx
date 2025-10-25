import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { facilityColors } from '../../constants/colors';
import { HourlyUsage } from '../../hooks/useDashboardStats';

interface HourlyUsageBarChartProps {
  data: HourlyUsage[];
}

export default function HourlyUsageBarChart({ data }: HourlyUsageBarChartProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>時間帯別利用率</Text>
        <Text style={styles.subtitle}>本日の予約状況</Text>
      </View>

      <View style={styles.legend}>
        {data.map((item, index) => {
          const usageRate = ((item.count / item.capacity) * 100).toFixed(0);
          const isFull = item.count >= item.capacity;
          const isHigh = item.count / item.capacity >= 0.8;

          return (
            <View key={index} style={styles.legendItem}>
              <Text style={styles.hourText}>{item.hour}</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${usageRate}%`,
                      backgroundColor: isFull
                        ? '#EF4444'
                        : isHigh
                        ? '#F59E0B'
                        : facilityColors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={styles.countText}>
                {item.count}/{item.capacity}
              </Text>
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
  legend: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hourText: {
    fontSize: 12,
    fontWeight: '600',
    color: facilityColors.textMain,
    width: 40,
  },
  progressBar: {
    flex: 1,
    height: 20,
    backgroundColor: facilityColors.background,
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: facilityColors.textSub,
    width: 40,
    textAlign: 'right',
  },
});
