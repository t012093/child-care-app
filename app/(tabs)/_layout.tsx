import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import BottomNav from '../../components/BottomNav';
import WebHeader from '../../components/WebHeader';
import { colors } from '../../constants/colors';

export default function TabsLayout() {
  // Custom tab bar component that uses our BottomNav
  const TabBar = () => <BottomNav />;

  return (
    <>
      <WebHeader />
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={TabBar}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
        }}
      />
      <Tabs.Screen
        name="reserve"
        options={{
          title: '予約',
        }}
      />
      <Tabs.Screen
        name="board"
        options={{
          title: '掲示板',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'プロフィール',
        }}
      />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});