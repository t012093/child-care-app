import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LayoutDashboard, Calendar, Building2, Settings } from 'lucide-react-native';
import { facilityColors } from '../../constants/colors';
import { useResponsive } from '../../hooks/useResponsive';

export default function FacilityTabsLayout() {
  const { isTablet } = useResponsive();

  // Web版用のヘッダー
  const FacilityHeader = () => {
    if (!isTablet) return null;

    return (
      <View style={styles.webHeader}>
        <View style={styles.webHeaderContent}>
          <View style={styles.logoSection}>
            <Building2 size={28} color={facilityColors.primary} strokeWidth={2} />
            <Text style={styles.logoText}>ほいポチ 施設管理</Text>
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.welcomeText}>施設管理ダッシュボード</Text>
          </View>
        </View>
      </View>
    );
  };

  // モバイル版用のタブバー
  const TabBar = ({ state, descriptors, navigation }: any) => {
    if (isTablet) return null;

    return (
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || options.title || route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let icon;
          switch (route.name) {
            case 'dashboard':
              icon = <LayoutDashboard size={24} color={isFocused ? facilityColors.primary : facilityColors.textSub} />;
              break;
            case 'reservations':
              icon = <Calendar size={24} color={isFocused ? facilityColors.primary : facilityColors.textSub} />;
              break;
            case 'facility-info':
              icon = <Building2 size={24} color={isFocused ? facilityColors.primary : facilityColors.textSub} />;
              break;
            case 'settings':
              icon = <Settings size={24} color={isFocused ? facilityColors.primary : facilityColors.textSub} />;
              break;
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
            >
              {icon}
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <>
      <FacilityHeader />
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={TabBar}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'ダッシュボード',
          }}
        />
        <Tabs.Screen
          name="reservations"
          options={{
            title: '予約管理',
          }}
        />
        <Tabs.Screen
          name="facility-info"
          options={{
            title: '施設情報',
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: '設定',
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  webHeader: {
    backgroundColor: facilityColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: facilityColors.accentSoft,
    ...Platform.select({
      web: {
        position: 'sticky' as any,
        top: 0,
        zIndex: 1000,
      },
    }),
  },
  webHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: facilityColors.primary,
  },
  menuSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: facilityColors.textMain,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: facilityColors.surface,
    borderTopWidth: 1,
    borderTopColor: facilityColors.accentSoft,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    color: facilityColors.textSub,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: facilityColors.primary,
    fontWeight: '600',
  },
});