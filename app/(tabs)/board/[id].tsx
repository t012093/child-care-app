import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '../../../constants/colors';
import { useAuth } from '../../../lib/AuthContext';
import {
  BoardPost,
  DEMO_BOARD_POSTS,
  fetchBoardPostById,
  markBoardPostAsRead,
} from '../../../lib/boardService';

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function senderLabel(senderType: BoardPost['senderType']) {
  return senderType === 'facility' ? '施設からのお知らせ' : '運営からのお知らせ';
}

export default function BoardDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const postId = Array.isArray(id) ? id[0] : id;

  const router = useRouter();
  const { user } = useAuth();

  const [post, setPost] = useState<BoardPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadPost = async () => {
      if (!postId) {
        if (!isMounted) return;
        setPost(null);
        setLoadError('お知らせIDが指定されていません。');
        setIsLoading(false);
        return;
      }

      if (!user) {
        if (!isMounted) return;
        setPost(null);
        setLoadError('ログイン情報を確認できません。');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        if (user.id === 'demo-user') {
          const demoPost = DEMO_BOARD_POSTS.find((item) => item.id === postId) || null;
          if (!isMounted) return;
          if (!demoPost) {
            setPost(null);
            setLoadError('お知らせが見つかりませんでした。');
            setIsLoading(false);
            return;
          }

          setPost(demoPost);
          setIsLoading(false);
          return;
        }

        const fetched = await fetchBoardPostById(postId, user.id);

        if (!isMounted) return;

        if (!fetched) {
          setPost(null);
          setLoadError('お知らせが見つかりませんでした。');
          setIsLoading(false);
          return;
        }

        setPost(fetched);

        if (fetched.isUnread) {
          await markBoardPostAsRead(fetched.id, user.id);
        }
      } catch (error) {
        if (!isMounted) return;
        setPost(null);
        setLoadError(error instanceof Error ? error.message : '詳細の取得に失敗しました。');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPost();

    return () => {
      isMounted = false;
    };
  }, [postId, user]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.stateText}>お知らせを読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{loadError || 'お知らせが見つかりませんでした。'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '掲示板',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={colors.textMain} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.metaRow}>
            <Text style={styles.metaType}>{senderLabel(post.senderType)}</Text>
            <Text style={styles.metaDate}>{formatDateTime(post.createdAt)}</Text>
          </View>

          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.body}>{post.body}</Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaType: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '700',
  },
  metaDate: {
    fontSize: 12,
    color: colors.textSub,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textMain,
    lineHeight: 30,
    marginBottom: 14,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textMain,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  stateText: {
    fontSize: 14,
    color: colors.textSub,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.error,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 4,
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButtonText: {
    color: colors.surface,
    fontWeight: '700',
  },
});
