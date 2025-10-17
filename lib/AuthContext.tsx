import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  name?: string;
  parentInfo?: {
    phone?: string;
    address?: string;
    emergencyContact?: string;
  };
  children?: Array<{
    id: string;
    name: string;
    birthDate: string;
    allergies?: string[];
    medicalInfo?: string;
    photo?: string;
    dailyLife?: {
      eating: string;
      weaning: string;
      nursing: string;
      toilet: string;
    };
    vaccines?: {
      progress: number;
      total: number;
    };
    sleep?: {
      wakeUp: string;
      nap: string;
      bedtime: string;
    };
    sizes?: {
      diaper: string;
      clothes: string;
    };
    preferences?: {
      likes: string[];
      dislikes: string[];
      comfortItems?: string;
      sleepRoutine?: string;
      dietaryRestrictions?: string;
    };
    development?: {
      milestones: {
        title: string;
        achieved: boolean;
      }[];
    };
    health?: {
      currentTemperature?: string;
      lastCheckDate?: string;
    };
  }>;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isFirstLaunch: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'user',
  FIRST_LAUNCH: 'first_launch',
  AUTH_TOKEN: 'auth_token',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const [storedUser, , authToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH),
        AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
      ]);

      // Always show onboarding for demo purposes
      // In production, remove this line
      setIsFirstLaunch(true);
      
      // Original logic (commented out for demo)
      // setIsFirstLaunch(firstLaunch === null);
      
      if (storedUser && authToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // TODO: Implement actual authentication with backend
      // For now, simulate login
      let mockUser: User;
      
      if (email === 'demo@example.com' && password === 'demo123') {
        // デモユーザー用のモックデータ
        mockUser = {
          id: 'demo-user',
          email: 'demo@example.com',
          name: 'ゲストユーザー',
          parentInfo: {
            phone: '090-1234-5678',
            address: '東京都渋谷区',
            emergencyContact: '080-9876-5432',
          },
          children: [
            {
              id: 'demo-child-1',
              name: 'デモ太郎',
              birthDate: '2021-05-15',
              allergies: ['卵', 'ピーナッツ'],
              medicalInfo: 'アレルギー薬を常備',
              photo: 'https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&w=600',
              dailyLife: {
                eating: "箸 (自立)",
                weaning: "完了",
                nursing: "卒乳済み",
                toilet: "トイレ",
              },
              vaccines: {
                progress: 12,
                total: 14,
              },
              sleep: {
                wakeUp: "6:30",
                nap: "13:00-15:00",
                bedtime: "20:00",
              },
              sizes: {
                diaper: "パンツ",
                clothes: "100cm",
              },
              preferences: {
                likes: ["サッカー", "恐竜図鑑", "お絵かき"],
                dislikes: ["野菜（特にピーマン）", "大きな音"],
                comfortItems: "恐竜のぬいぐるみ",
                sleepRoutine: "絵本を2冊読んでから寝る",
                dietaryRestrictions: "卵・ピーナッツアレルギー",
              },
              development: {
                milestones: [
                  { title: "複雑な文章を話す", achieved: true },
                  { title: "片足でバランスを取る", achieved: true },
                  { title: "ハサミで紙を切る", achieved: true },
                  { title: "トイレを自分で使う", achieved: true },
                  { title: "簡単な数を数える", achieved: true },
                ],
              },
              health: {
                currentTemperature: "36.7℃",
                lastCheckDate: "2025-10-04",
              },
            },
            {
              id: 'demo-child-2',
              name: 'デモ花子',
              birthDate: '2019-08-20',
              allergies: [],
              medicalInfo: '',
              photo: 'https://images.pexels.com/photos/1912868/pexels-photo-1912868.jpeg?auto=compress&cs=tinysrgb&w=600',
              dailyLife: {
                eating: "箸 (自立)",
                weaning: "完了",
                nursing: "卒乳済み",
                toilet: "トイレ",
              },
              vaccines: {
                progress: 14,
                total: 14,
              },
              sleep: {
                wakeUp: "6:00",
                nap: "なし",
                bedtime: "20:30",
              },
              sizes: {
                diaper: "パンツ",
                clothes: "110cm",
              },
              preferences: {
                likes: ["ピアノ", "絵本", "ダンス"],
                dislikes: ["暗い場所"],
                comfortItems: "ピンクのタオルケット",
                sleepRoutine: "音楽を聴きながら寝る",
                dietaryRestrictions: "なし",
              },
              development: {
                milestones: [
                  { title: "ひらがなを読む", achieved: true },
                  { title: "自転車に乗る", achieved: true },
                  { title: "簡単な計算をする", achieved: true },
                  { title: "お手伝いをする", achieved: true },
                ],
              },
              health: {
                currentTemperature: "36.5℃",
                lastCheckDate: "2025-10-04",
              },
            },
          ],
        };
      } else {
        // 通常のユーザー
        mockUser = {
          id: '1',
          email,
          name: 'テストユーザー',
        };
      }

      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock_token');
      setUser(mockUser);
    } catch (error) {
      throw new Error('ログインに失敗しました');
    }
  };

  const register = async (userData: Partial<User>) => {
    try {
      // TODO: Implement actual registration with backend
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email || '',
        name: userData.name,
        parentInfo: userData.parentInfo,
        children: userData.children,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock_token');
      setUser(newUser);
    } catch (error) {
      throw new Error('登録に失敗しました');
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
      ]);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!user) return;
      
      const updatedUser = { ...user, ...userData };
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      throw new Error('ユーザー情報の更新に失敗しました');
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, 'false');
      setIsFirstLaunch(false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isFirstLaunch,
    login,
    register,
    logout,
    updateUser,
    completeOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}