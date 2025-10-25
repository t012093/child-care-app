import React from 'react';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { LayoutDashboard, Calendar, Building2, Settings } from 'lucide-react-native';
import { facilityColors } from '../../constants/colors';
import { useResponsive } from '../../hooks/useResponsive';

export default function FacilityTabsLayout() {
  const { isTablet } = useResponsive();
  const router = useRouter();
  const pathname = usePathname();

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

  // Web版用のサイドナビゲーション
  const SideNavigation = () => {
    if (!isTablet) return null;

    const navItems = [
      {
        key: 'dashboard',
        label: 'ダッシュボード',
        icon: LayoutDashboard,
        path: '/(facility-tabs)/dashboard'
      },
      {
        key: 'reservations',
        label: '予約管理',
        icon: Calendar,
        path: '/(facility-tabs)/reservations'
      },
      {
        key: 'facility-info',
        label: '施設情報',
        icon: Building2,
        path: '/(facility-tabs)/facility-info'
      },
      {
        key: 'settings',
        label: '設定',
        icon: Settings,
        path: '/(facility-tabs)/settings'
      },
    ];

    return (
      <View style={styles.sideNav}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.sideNavItem,
                  isActive && styles.sideNavItemActive,
                ]}
                onPress={() => router.push(item.path as any)}
                activeOpacity={0.7}
              >
                <Icon
                  size={22}
                  color={isActive ? facilityColors.primary : facilityColors.textSub}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <Text style={[
                  styles.sideNavLabel,
                  isActive && styles.sideNavLabelActive,
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
      <View style={styles.layoutContainer}>
        <SideNavigation />
        <View style={[styles.contentContainer, isTablet && styles.contentWithSideNav]}>
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
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  layoutContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  contentContainer: {
    flex: 1,
  },
  contentWithSideNav: {
    marginLeft: 0, // サイドナビの分だけマージン（サイドナビがabsoluteなので不要）
  },
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
  sideNav: {
    width: 240,
    backgroundColor: facilityColors.surface,
    borderRightWidth: 1,
    borderRightColor: facilityColors.accentSoft,
    paddingTop: 16,
    paddingBottom: 16,
  },
  sideNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    marginBottom: 4,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  sideNavItemActive: {
    backgroundColor: facilityColors.primarySoft,
  },
  sideNavLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: facilityColors.textSub,
  },
  sideNavLabelActive: {
    fontSize: 15,
    fontWeight: '600',
    color: facilityColors.primary,
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