import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { Chrome as Home, CircleCheck as CheckCircle, FileText, CircleUser as UserCircle } from 'lucide-react-native';
import { useResponsive } from '../hooks/useResponsive';

const routes = [
  { path: '/' as const, label: 'ホーム', icon: Home },
  { path: '/reserve' as const, label: '予約', icon: CheckCircle },
  { path: '/board' as const, label: '掲示板', icon: FileText },
  { path: '/profile' as const, label: 'プロフィール', icon: UserCircle },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isTablet } = useResponsive();

  // Web版（タブレット以上）では表示しない
  if (isTablet) {
    return null;
  }

  return (
    <View style={styles.container}>
      {routes.map((route) => {
        const isActive = pathname === route.path;
        const Icon = route.icon;
        
        return (
          <TouchableOpacity
            key={route.path}
            style={styles.tab}
            onPress={() => router.replace(route.path)}
          >
            <Icon
              size={28}
              color={isActive ? '#7AC6B8' : '#6B7280'}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.label,
                { color: isActive ? '#7AC6B8' : '#6B7280' },
              ]}
            >
              {route.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 11,
    marginTop: 6,
  },
});