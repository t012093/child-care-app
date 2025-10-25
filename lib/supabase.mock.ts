/**
 * Supabase Mock Client
 *
 * 開発環境でSupabaseの実環境がない場合に使用するモッククライアント
 * localStorageを使ってデータを永続化します
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// Mock Data Storage
// ============================================================================

const STORAGE_KEYS = {
  USERS: '@mock_users',
  FACILITIES: '@mock_facilities',
  FACILITY_STAFF: '@mock_facility_staff',
  CHILDREN: '@mock_children',
  RESERVATIONS: '@mock_reservations',
  CURRENT_USER: '@mock_current_user',
};

// ============================================================================
// Helper Functions
// ============================================================================

async function getStorageData<T>(key: string): Promise<T[]> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading from storage:', error);
    return [];
  }
}

async function setStorageData<T>(key: string, data: T[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing to storage:', error);
  }
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============================================================================
// Mock Auth
// ============================================================================

const mockAuth = {
  async signUp(credentials: {
    email: string;
    password: string;
    options?: { data?: Record<string, any> };
  }) {
    console.log('🔧 Mock: signUp', credentials.email);

    // ユーザーリストを取得
    const users = await getStorageData<any>(STORAGE_KEYS.USERS);

    // 既存ユーザーチェック
    const existingUser = users.find((u) => u.email === credentials.email);
    if (existingUser) {
      return {
        data: null,
        error: { message: 'User already registered' },
      };
    }

    // 新規ユーザー作成
    const newUser = {
      id: generateUUID(),
      email: credentials.email,
      user_metadata: credentials.options?.data || {},
      created_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString(), // モックでは即座に確認済み
    };

    users.push(newUser);
    await setStorageData(STORAGE_KEYS.USERS, users);
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));

    return {
      data: {
        user: newUser,
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
        },
      },
      error: null,
    };
  },

  async signInWithPassword(credentials: { email: string; password: string }) {
    console.log('🔧 Mock: signInWithPassword', credentials.email);

    const users = await getStorageData<any>(STORAGE_KEYS.USERS);
    const user = users.find((u) => u.email === credentials.email);

    if (!user) {
      return {
        data: null,
        error: { message: 'Invalid login credentials' },
      };
    }

    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

    return {
      data: {
        user,
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
        },
      },
      error: null,
    };
  },

  async signOut() {
    console.log('🔧 Mock: signOut');
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    return { error: null };
  },

  async getUser() {
    const userStr = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!userStr) {
      return { data: { user: null }, error: null };
    }

    return {
      data: { user: JSON.parse(userStr) },
      error: null,
    };
  },

  async getSession() {
    const userStr = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!userStr) {
      return { data: { session: null }, error: null };
    }

    return {
      data: {
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          user: JSON.parse(userStr),
        },
      },
      error: null,
    };
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    // モックでは何もしない
    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    };
  },
};

// ============================================================================
// Mock Database Query Builder
// ============================================================================

class MockQueryBuilder {
  private table: string;
  private data: any;
  private filterConditions: Array<{ column: string; value: any }> = [];
  private selectColumns: string = '*';

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = '*') {
    this.selectColumns = columns;
    return this;
  }

  async insert(data: any) {
    console.log(`🔧 Mock: insert into ${this.table}`, data);

    const storageKey = this.getStorageKey();
    const items = await getStorageData<any>(storageKey);

    const newItem = Array.isArray(data)
      ? data.map((d) => ({
          ...d,
          id: d.id || generateUUID(),
          created_at: d.created_at || new Date().toISOString(),
          updated_at: d.updated_at || new Date().toISOString(),
        }))
      : {
          ...data,
          id: data.id || generateUUID(),
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
        };

    if (Array.isArray(newItem)) {
      items.push(...newItem);
    } else {
      items.push(newItem);
    }

    await setStorageData(storageKey, items);
    this.data = newItem;

    return this;
  }

  async update(data: any) {
    console.log(`🔧 Mock: update ${this.table}`, data);

    const storageKey = this.getStorageKey();
    const items = await getStorageData<any>(storageKey);

    const updatedItems = items.map((item) => {
      const matches = this.filterConditions.every(
        (cond) => item[cond.column] === cond.value
      );
      if (matches) {
        return {
          ...item,
          ...data,
          updated_at: new Date().toISOString(),
        };
      }
      return item;
    });

    await setStorageData(storageKey, updatedItems);
    this.data = updatedItems.filter((item) =>
      this.filterConditions.every((cond) => item[cond.column] === cond.value)
    );

    return this;
  }

  async delete() {
    console.log(`🔧 Mock: delete from ${this.table}`);

    const storageKey = this.getStorageKey();
    const items = await getStorageData<any>(storageKey);

    const remainingItems = items.filter(
      (item) =>
        !this.filterConditions.every((cond) => item[cond.column] === cond.value)
    );

    await setStorageData(storageKey, remainingItems);
    return { error: null };
  }

  eq(column: string, value: any) {
    this.filterConditions.push({ column, value });
    return this;
  }

  single() {
    return this;
  }

  async then(resolve: (value: any) => void, reject?: (error: any) => void) {
    try {
      if (this.data !== undefined) {
        // insert/update の結果がある場合
        const result = Array.isArray(this.data) ? this.data[0] : this.data;
        resolve({ data: result, error: null });
      } else {
        // select の場合
        const storageKey = this.getStorageKey();
        const items = await getStorageData<any>(storageKey);

        let filteredItems = items;
        if (this.filterConditions.length > 0) {
          filteredItems = items.filter((item) =>
            this.filterConditions.every((cond) => item[cond.column] === cond.value)
          );
        }

        resolve({ data: filteredItems, error: null });
      }
    } catch (error) {
      if (reject) {
        reject({ data: null, error });
      } else {
        resolve({ data: null, error });
      }
    }
  }

  private getStorageKey(): string {
    const keyMap: Record<string, string> = {
      facilities: STORAGE_KEYS.FACILITIES,
      facility_staff: STORAGE_KEYS.FACILITY_STAFF,
      children: STORAGE_KEYS.CHILDREN,
      reservations: STORAGE_KEYS.RESERVATIONS,
    };
    return keyMap[this.table] || `@mock_${this.table}`;
  }
}

// ============================================================================
// Mock Supabase Client
// ============================================================================

export const createMockSupabaseClient = () => {
  return {
    auth: mockAuth,
    from: (table: string) => new MockQueryBuilder(table),
    // Realtime機能のモック（何もしない）
    channel: () => ({
      on: () => ({ subscribe: () => {} }),
      subscribe: () => {},
    }),
  };
};

// ============================================================================
// Mock Data Utilities
// ============================================================================

/**
 * 開発用のサンプルデータを投入
 */
export async function seedMockData() {
  console.log('🌱 Seeding mock data...');

  // サンプル施設を追加
  const facilities = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'モック保育園',
      type: 'nursery',
      district: 'central',
      address: '札幌市中央区北3条西4丁目',
      phone: '011-123-4567',
      email: 'mock@example.com',
      lat: 43.064,
      lng: 141.346,
      category: 'nursery',
      stock: 10,
      featured: true,
      rating: 4.5,
      images: [],
      status: 'active',
      has_lunch: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  await setStorageData(STORAGE_KEYS.FACILITIES, facilities);
  console.log('✅ Mock data seeded');
}

/**
 * すべてのモックデータをクリア
 */
export async function clearMockData() {
  console.log('🗑️  Clearing mock data...');
  await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  console.log('✅ Mock data cleared');
}
