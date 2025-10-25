import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { facilityColors } from '../../constants/colors';
import { DayReservation } from '../../hooks/useDashboardStats';

interface ReservationLineChartProps {
  data: DayReservation[];
}

export default function ReservationLineChart({ data }: ReservationLineChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>予約推移</Text>
        <Text style={styles.subtitle}>過去7日間</Text>
      </View>

      <View style={styles.chartArea}>
        {/* シンプルな棒グラフ表示 */}
        <View style={styles.barsContainer}>
          {data.map((item, index) => {
            const height = (item.count / maxCount) * 100;
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${height}%`,
                        backgroundColor: facilityColors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{item.date}</Text>
                <Text style={styles.barValue}>{item.count}</Text>
              </View>
            );
          })}
        </View>
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
  chartArea: {
    height: 200,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    gap: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    width: '100%',
    height: 140,
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: facilityColors.textSub,
    marginTop: 4,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '700',
    color: facilityColors.textMain,
    marginTop: 2,
  },
});
