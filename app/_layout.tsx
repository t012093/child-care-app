import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { View, Text, ActivityIndicator } from 'react-native';
import { colors } from '@/constants/colors';

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSub }}>読み込み中...</Text>
    </View>
  );
}

function RootNavigator() {
  const { user, isLoading, isFirstLaunch } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="(onboarding)" 
        options={{ 
          presentation: 'modal'
        }}
        redirect={!isFirstLaunch}
      />
      <Stack.Screen 
        name="(tabs)" 
        redirect={!user || isFirstLaunch}
      />
      <Stack.Screen
        name="admin/facility-approvals"
        redirect={!user || isFirstLaunch}
      />
      <Stack.Screen 
        name="(auth)" 
        redirect={!!user || isFirstLaunch}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
