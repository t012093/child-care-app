import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image, TouchableOpacity, Platform } from 'react-native';
import { ChevronRight, Phone, Mail, MessageSquare, LogOut, Settings } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/AuthContext';

interface Child {
  id: string;
  name: string;
  ageMonths: number;
  imageUrl: string;
}

function ChildListItem({ child, onPress }: { child: Child; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.childItem} onPress={onPress}>
      <Image
        source={{ uri: child.imageUrl }}
        style={styles.childAvatar}
      />
      <View style={styles.childInfo}>
        <Text style={styles.childName}>{child.name}</Text>
        <Text style={styles.childAge}>{Math.floor(child.ageMonths / 12)}歳{child.ageMonths % 12}ヶ月</Text>
      </View>
      <ChevronRight size={20} color={colors.textSub} />
    </TouchableOpacity>
  );
}

function ContactCard({ phone, email }: { phone: string; email: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.contactItem}>
        <Phone size={20} color={colors.textSub} />
        <Text style={styles.contactText}>{phone}</Text>
      </View>
      <View style={styles.contactItem}>
        <Mail size={20} color={colors.textSub} />
        <Text style={styles.contactText}>{email}</Text>
      </View>
    </View>
  );
}

function SupportCard() {
  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.supportItem}>
        <Phone size={20} color={colors.accent} />
        <Text style={styles.supportText}>電話相談</Text>
        <ChevronRight size={20} color={colors.textSub} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.supportItem}>
        <MessageSquare size={20} color={colors.accent} />
        <Text style={styles.supportText}>チャットボット</Text>
        <ChevronRight size={20} color={colors.textSub} />
      </TouchableOpacity>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      console.log('Logout button pressed');
      await logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Use actual user data if available, otherwise use mock data
  const parent = user ? {
    name: user.name || "名前未設定",
    phone: user.parentInfo?.phone || "未登録",
    email: user.email,
    imageUrl: user.id === 'demo-user' 
      ? "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600"
      : "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600"
  } : {
    name: "花田 さゆり",
    phone: "090-1234-5678",
    email: "sayuri.hanada@example.com",
    imageUrl: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600"
  };

  const children: Child[] = user?.children ? user.children.map(child => {
    const birthDate = new Date(child.birthDate);
    const today = new Date();
    const ageMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                      (today.getMonth() - birthDate.getMonth());
    return {
      id: child.id,
      name: child.name,
      ageMonths,
      imageUrl: child.photo || "https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&w=600"
    };
  }) : [
    {
      id: "1",
      name: "花田 はな",
      ageMonths: 25,
      imageUrl: "https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      id: "2",
      name: "花田 さくら",
      ageMonths: 36,
      imageUrl: "https://images.pexels.com/photos/1912868/pexels-photo-1912868.jpeg?auto=compress&cs=tinysrgb&w=600"
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>プロフィール</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push('/settings')}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Settings size={20} color={colors.textSub} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <LogOut size={20} color={colors.textSub} />
              <Text style={styles.logoutText}>ログアウト</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileSection}>
          <Image
            source={{ uri: parent.imageUrl }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.parentName}>{parent.name}</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/settings/profile')}
            >
              <Text style={styles.editButtonText}>編集</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>連絡先</Text>
          <ContactCard phone={parent.phone} email={parent.email} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>お子様</Text>
          <View style={styles.card}>
            {children.map((child) => (
              <ChildListItem
                key={child.id}
                child={child}
                onPress={() => router.push(`/child/${child.id}`)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>サポート</Text>
          <SupportCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 24,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textMain,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsButton: {
    padding: 8,
    backgroundColor: colors.accentSoft,
    borderRadius: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.accentSoft,
    borderRadius: 16,
  },
  logoutText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.textSub,
    fontWeight: '500',
  },
  profileSection: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  parentName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: colors.accentSoft,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    padding: 16,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1024 : undefined,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.textMain,
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  childInfo: {
    flex: 1,
    marginLeft: 12,
  },
  childName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textMain,
    marginBottom: 4,
  },
  childAge: {
    fontSize: 14,
    color: colors.textSub,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  supportText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.textMain,
  },
});