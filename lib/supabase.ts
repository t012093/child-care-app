import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { createMockSupabaseClient } from './supabase.mock';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const mockFlag = process.env.EXPO_PUBLIC_USE_MOCK;

const hasCreds = Boolean(supabaseUrl && supabaseAnonKey);
const USE_MOCK = mockFlag === 'true';
export const SUPABASE_CONFIGURED = hasCreds && !USE_MOCK;

if (USE_MOCK) {
  console.warn('[mock] EXPO_PUBLIC_USE_MOCK=true: モックモードで動作します');
} else if (!hasCreds) {
  console.error(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY が未設定です。\n' +
    'モックモードを使う場合は EXPO_PUBLIC_USE_MOCK=true を設定してください。'
  );
}

export const supabase = (USE_MOCK || !hasCreds)
  ? (createMockSupabaseClient() as any)
  : createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: Platform.OS === 'web'
        ? {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
          }
        : {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
          },
    });

// ============================================================================
// Database Types
// ============================================================================

export type Facility = {
  id: string;
  name: string;
  type: 'nursery' | 'sick-child' | 'clinic' | 'temporary-care' | 'licensed';
  address: string;
  postal_code?: string;
  lat: number;
  lng: number;
  phone?: string;
  email?: string;
  description?: string;
  rating: number;
  images: string[];
  category: string;
  stock: number;
  featured: boolean;

  // 新規フィールド
  owner_user_id?: string;
  status: 'active' | 'inactive' | 'pending_approval';
  prefecture?: string; // 都道府県（例: '北海道', '富山県'）
  district?: string; // 市区町村（例: '中央区', '富山市'）
  opening_hours?: {
    weekday: string;
    saturday: string;
  };
  capacity?: number;
  age_range?: string;
  has_lunch: boolean;
  provider?: string;
  pdf_template_url?: string;

  created_at: string;
  updated_at: string;
};

export type Child = {
  id: string;
  user_id: string;
  name: string;
  birthday: string;
  gender?: 'male' | 'female' | 'other';
  allergies?: string[];
  medical_notes?: string;

  // 新規フィールド
  photo_url?: string;
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance_info?: Record<string, any>;

  created_at: string;
  updated_at: string;
};

export type Reservation = {
  id: string;
  facility_id: string;
  child_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reservation_type?: '一時預かり' | '見学' | '相談';
  notes?: string;
  facility_name?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  child_name?: string;
  child_birth_date?: string;
  allergies?: string[];
  medical_notes?: string;
  special_requests?: string;

  // 新規フィールド
  confirmed_by?: string;
  confirmed_at?: string;
  cancelled_by?: string;
  cancelled_by_type?: 'parent' | 'facility';
  cancelled_at?: string;
  cancellation_reason?: string;
  check_in_time?: string;
  check_in_by?: string;
  check_out_time?: string;
  check_out_by?: string;

  created_at: string;
  updated_at: string;
};

export type FacilityStaff = {
  id: string;
  facility_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'staff';
  name: string;
  email?: string;
  phone?: string;
  photo_url?: string;
  status: 'active' | 'inactive' | 'invited';
  invited_at?: string;
  joined_at?: string;
  created_at: string;
  updated_at: string;
};

export type FacilityAvailability = {
  id: string;
  facility_id: string;
  date: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  current_reservations: number;
  is_available: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  sender_id: string;
  sender_type: 'parent' | 'facility';
  recipient_id: string;
  facility_id?: string;
  subject?: string;
  body: string;
  attachments?: string[];
  is_read: boolean;
  read_at?: string;
  thread_id?: string;
  created_at: string;
};

export type FacilityReview = {
  id: string;
  facility_id: string;
  user_id: string;
  reservation_id?: string;
  rating: number;
  comment?: string;
  facility_response?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: 'reservation_created' | 'reservation_confirmed' | 'reservation_cancelled' | 'message_received' | 'review_posted' | 'system_alert';
  title: string;
  body: string;
  data?: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
};

// ============================================================================
// Helper Types
// ============================================================================

export type ReservationWithRelations = Reservation & {
  facility?: Facility;
  child?: Child;
  user?: {
    id: string;
    email?: string;
  };
};

export type FacilityWithStats = Facility & {
  total_reservations?: number;
  average_rating?: number;
  review_count?: number;
};
