import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthChangeEvent,
  Session,
  User as SupabaseAuthUser,
} from '@supabase/supabase-js';
import { Child as DbChild, supabase } from './supabase';
import { extractFunctionError } from './emailVerification';

export interface User {
  id: string;
  email: string;
  name?: string;
  parentInfo?: {
    phone?: string;
    address?: string;
    emergencyContact?: string;
  };
  children?: {
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
  }[];
}

type RegisterInput = Partial<User> & {
  email: string;
  password: string;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isFirstLaunch: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterInput) => Promise<void>;
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

const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'demo123';
const DEMO_AUTH_TOKEN = 'mock_token';

const DEMO_USER: User = {
  id: 'demo-user',
  email: DEMO_EMAIL,
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
      photo:
        'https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&w=600',
      dailyLife: {
        eating: '箸 (自立)',
        weaning: '完了',
        nursing: '卒乳済み',
        toilet: 'トイレ',
      },
      vaccines: {
        progress: 12,
        total: 14,
      },
      sleep: {
        wakeUp: '6:30',
        nap: '13:00-15:00',
        bedtime: '20:00',
      },
      sizes: {
        diaper: 'パンツ',
        clothes: '100cm',
      },
      preferences: {
        likes: ['サッカー', '恐竜図鑑', 'お絵かき'],
        dislikes: ['野菜（特にピーマン）', '大きな音'],
        comfortItems: '恐竜のぬいぐるみ',
        sleepRoutine: '絵本を2冊読んでから寝る',
        dietaryRestrictions: '卵・ピーナッツアレルギー',
      },
      development: {
        milestones: [
          { title: '複雑な文章を話す', achieved: true },
          { title: '片足でバランスを取る', achieved: true },
          { title: 'ハサミで紙を切る', achieved: true },
          { title: 'トイレを自分で使う', achieved: true },
          { title: '簡単な数を数える', achieved: true },
        ],
      },
      health: {
        currentTemperature: '36.7℃',
        lastCheckDate: '2025-10-04',
      },
    },
    {
      id: 'demo-child-2',
      name: 'デモ花子',
      birthDate: '2019-08-20',
      allergies: [],
      medicalInfo: '',
      photo:
        'https://images.pexels.com/photos/1912868/pexels-photo-1912868.jpeg?auto=compress&cs=tinysrgb&w=600',
      dailyLife: {
        eating: '箸 (自立)',
        weaning: '完了',
        nursing: '卒乳済み',
        toilet: 'トイレ',
      },
      vaccines: {
        progress: 14,
        total: 14,
      },
      sleep: {
        wakeUp: '6:00',
        nap: 'なし',
        bedtime: '20:30',
      },
      sizes: {
        diaper: 'パンツ',
        clothes: '110cm',
      },
      preferences: {
        likes: ['ピアノ', '絵本', 'ダンス'],
        dislikes: ['暗い場所'],
        comfortItems: 'ピンクのタオルケット',
        sleepRoutine: '音楽を聴きながら寝る',
        dietaryRestrictions: 'なし',
      },
      development: {
        milestones: [
          { title: 'ひらがなを読む', achieved: true },
          { title: '自転車に乗る', achieved: true },
          { title: '簡単な計算をする', achieved: true },
          { title: 'お手伝いをする', achieved: true },
        ],
      },
      health: {
        currentTemperature: '36.5℃',
        lastCheckDate: '2025-10-04',
      },
    },
  ],
};

function normalizeBirthDate(value: string) {
  return value.replace(/\//g, '-');
}

function mapAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'メールアドレスまたはパスワードが正しくありません。';
  }

  if (normalized.includes('invalid_credentials')) {
    return 'メールアドレスまたはパスワードが正しくありません。';
  }

  if (normalized.includes('email not confirmed')) {
    return 'メール確認が完了していません。確認メールをご確認ください。';
  }

  if (normalized.includes('email logins are disabled')) {
    return 'メールアドレスでのログインが無効化されています。運営へお問い合わせください。';
  }

  if (normalized.includes('user already registered')) {
    return 'このメールアドレスは既に登録されています。';
  }

  if (normalized.includes('email address is not verified')) {
    return 'メール認証が完了していません。認証コードを確認してください。';
  }

  if (normalized.includes('verification has expired')) {
    return '認証コードの有効期限が切れています。もう一度送信してください。';
  }

  if (normalized.includes('too many requests')) {
    return '一定時間あたりの送信回数を超えました。少し待ってからお試しください。';
  }

  if (normalized.includes('password should be at least')) {
    return 'パスワードは6文字以上で入力してください。';
  }

  if (
    normalized.includes('network request failed') ||
    normalized.includes('failed to fetch')
  ) {
    return '通信に失敗しました。ネットワーク接続を確認して再度お試しください。';
  }

  return message;
}

function mapDbChildToUserChild(child: DbChild): NonNullable<User['children']>[number] {
  return {
    id: child.id,
    name: child.name,
    birthDate: child.birthday,
    allergies: child.allergies || [],
    medicalInfo: child.medical_notes || undefined,
    photo: child.photo_url || undefined,
  };
}

function extractChildrenFromMetadata(
  metadata: Record<string, unknown>
): NonNullable<User['children']> {
  if (!Array.isArray(metadata.children)) {
    return [];
  }

  return metadata.children.flatMap((child, index) => {
    if (!child || typeof child !== 'object') {
      return [];
    }

    const value = child as Record<string, unknown>;
    const name = typeof value.name === 'string' ? value.name.trim() : '';
    const birthDate =
      typeof value.birthDate === 'string'
        ? normalizeBirthDate(value.birthDate)
        : typeof value.birthday === 'string'
          ? normalizeBirthDate(value.birthday)
          : '';

    if (!name || !birthDate) {
      return [];
    }

    return [
      {
        id: typeof value.id === 'string' ? value.id : `metadata-child-${index}`,
        name,
        birthDate,
        allergies: Array.isArray(value.allergies)
          ? value.allergies.filter((item): item is string => typeof item === 'string')
          : [],
        medicalInfo:
          typeof value.medicalInfo === 'string'
            ? value.medicalInfo
            : typeof value.medical_notes === 'string'
              ? value.medical_notes
              : undefined,
        photo:
          typeof value.photo === 'string'
            ? value.photo
            : typeof value.photo_url === 'string'
              ? value.photo_url
              : undefined,
      },
    ];
  });
}

async function clearDemoState() {
  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEYS.USER),
    AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
  ]);
}

async function setDemoState() {
  await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEMO_USER));
  await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, DEMO_AUTH_TOKEN);
}

async function loadDemoUserFromStorage() {
  const [storedUser, authToken] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.USER),
    AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  ]);

  if (!storedUser || authToken !== DEMO_AUTH_TOKEN) {
    return null;
  }

  const parsedUser = JSON.parse(storedUser) as User;
  if (parsedUser.id !== DEMO_USER.id) {
    await clearDemoState();
    return null;
  }

  return parsedUser;
}

async function fetchUserChildren(userId: string) {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message || 'お子様情報の取得に失敗しました。');
  }

  return ((data as DbChild[] | null) || []).map(mapDbChildToUserChild);
}

async function buildAppUser(authUser: SupabaseAuthUser): Promise<User> {
  const metadata = authUser.user_metadata || {};
  let children: NonNullable<User['children']> = [];

  try {
    children = await fetchUserChildren(authUser.id);
  } catch (error) {
    console.warn(
      'Failed to load children from database, falling back to auth metadata:',
      error
    );
    children = extractChildrenFromMetadata(metadata as Record<string, unknown>);
  }

  const parentInfo = {
    phone: typeof metadata.phone === 'string' ? metadata.phone : undefined,
    address: typeof metadata.address === 'string' ? metadata.address : undefined,
    emergencyContact:
      typeof metadata.emergency_contact === 'string'
        ? metadata.emergency_contact
        : undefined,
  };

  return {
    id: authUser.id,
    email: authUser.email || '',
    name: typeof metadata.name === 'string' ? metadata.name : undefined,
    parentInfo:
      parentInfo.phone || parentInfo.address || parentInfo.emergencyContact
        ? parentInfo
        : undefined,
    children,
  };
}

async function insertChildren(
  userId: string,
  children: User['children']
) {
  if (!children?.length) {
    return;
  }

  const payload = children.map((child) => ({
    user_id: userId,
    name: child.name.trim(),
    birthday: normalizeBirthDate(child.birthDate),
    allergies: child.allergies || [],
    medical_notes: child.medicalInfo || null,
    photo_url: child.photo || null,
  }));

  const { error } = await supabase
    .from('children')
    .insert(payload);

  if (error) {
    throw new Error(error.message || 'お子様情報の保存に失敗しました。');
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadAuthState = async () => {
      try {
        const firstLaunch = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
        if (isMounted) {
          setIsFirstLaunch(firstLaunch !== 'false');
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session?.user) {
          const nextUser = await buildAppUser(session.user);
          if (isMounted) {
            setUser(nextUser);
          }
        } else {
          const demoUser = await loadDemoUserFromStorage();
          if (isMounted) {
            setUser(demoUser);
          }
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAuthState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
      void (async () => {
        try {
          if (session?.user) {
            const nextUser = await buildAppUser(session.user);
            if (isMounted) {
              setUser(nextUser);
            }
            await clearDemoState();
          } else {
            const demoUser = await loadDemoUserFromStorage();
            if (isMounted) {
              setUser(demoUser);
            }
          }
        } catch (error) {
          console.error('Error handling auth change:', error);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      })();
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        await setDemoState();
        setUser(DEMO_USER);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        throw new Error(mapAuthError(error?.message || 'ログインに失敗しました。'));
      }

      await clearDemoState();
      const nextUser = await buildAppUser(data.user);
      setUser(nextUser);
    } catch (error) {
      throw new Error(
        error instanceof Error ? mapAuthError(error.message) : 'ログインに失敗しました。'
      );
    }
  };

  const register = async (userData: RegisterInput) => {
    const email = typeof userData.email === 'string' ? userData.email.trim() : '';
    const password = typeof userData.password === 'string' ? userData.password.trim() : '';

    if (!email || !password) {
      throw new Error('登録情報が不足しています。最初から入力し直してください。');
    }

    try {
      const metadata = {
        name: userData.name?.trim() || undefined,
        phone: userData.parentInfo?.phone?.trim() || undefined,
        address: userData.parentInfo?.address?.trim() || undefined,
        emergency_contact: userData.parentInfo?.emergencyContact?.trim() || undefined,
      };

      const supportsFunctions = typeof (supabase as any).functions?.invoke === 'function';

      let authUser: SupabaseAuthUser;

      if (supportsFunctions) {
        const { error: functionError } = await supabase.functions.invoke('register-parent', {
          body: {
            email,
            password,
            name: metadata.name,
            parentInfo: {
              phone: metadata.phone,
              address: metadata.address,
              emergencyContact: metadata.emergency_contact,
            },
            children: userData.children || [],
          },
        });

        if (functionError) {
          throw new Error(
            mapAuthError(await extractFunctionError(functionError, '登録に失敗しました。'))
          );
        }

        const signInResult = await supabase.auth.signInWithPassword({ email, password });
        if (signInResult.error || !signInResult.data.user) {
          throw new Error(
            mapAuthError(
              signInResult.error?.message || '登録は完了しましたが、自動ログインに失敗しました。'
            )
          );
        }
        authUser = signInResult.data.user;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata,
          },
        });

        if (error || !data.user) {
          throw new Error(mapAuthError(error?.message || '登録に失敗しました。'));
        }

        authUser = data.user;

        if (!data.session) {
          const signInResult = await supabase.auth.signInWithPassword({ email, password });
          if (signInResult.error || !signInResult.data.user) {
            throw new Error(
              mapAuthError(
                signInResult.error?.message ||
                  '登録は完了しました。メール確認後にログインしてください。'
              )
            );
          }
          authUser = signInResult.data.user;
        }

        await insertChildren(authUser.id, userData.children);
      }

      await clearDemoState();
      const nextUser = await buildAppUser(authUser);
      setUser(nextUser);
    } catch (error) {
      throw new Error(
        error instanceof Error ? mapAuthError(error.message) : '登録に失敗しました。'
      );
    }
  };

  const logout = async () => {
    try {
      if (user?.id === DEMO_USER.id) {
        await clearDemoState();
      } else {
        await supabase.auth.signOut();
        await clearDemoState();
      }
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!user) return;

      if (user.id === DEMO_USER.id) {
        const updatedUser = { ...user, ...userData };
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        setUser(updatedUser);
        return;
      }

      const nextParentInfo = {
        phone: userData.parentInfo?.phone ?? user.parentInfo?.phone,
        address: userData.parentInfo?.address ?? user.parentInfo?.address,
        emergencyContact:
          userData.parentInfo?.emergencyContact ?? user.parentInfo?.emergencyContact,
      };

      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: userData.name ?? user.name,
          phone: nextParentInfo.phone,
          address: nextParentInfo.address,
          emergency_contact: nextParentInfo.emergencyContact,
        },
      });

      if (error || !data.user) {
        throw new Error(error?.message || 'ユーザー情報の更新に失敗しました。');
      }

      const nextUser = await buildAppUser(data.user);
      setUser(nextUser);
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? mapAuthError(error.message)
          : 'ユーザー情報の更新に失敗しました。'
      );
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
