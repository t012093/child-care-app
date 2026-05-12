import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, ChevronRight } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useAuth } from '../../lib/AuthContext';
import { BoardPost, DEMO_BOARD_POSTS, fetchBoardPosts } from '../../lib/boardService';

function formatRelativeTime(createdAt: string) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diffMs = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return 'たった今';
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}分前`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}時間前`;
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)}日前`;

  return date.toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
  });
}

function senderLabel(senderType: BoardPost['senderType']) {
  return senderType === 'facility' ? '施設からのお知らせ' : '運営からのお知らせ';
}

export default function BoardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadPosts = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setLoadError(null);

    try {
      if (!user) {
        setPosts([]);
        setLoadError('ログイン情報を確認できません。');
        return;
      }

      if (user.id === 'demo-user') {
        setPosts(DEMO_BOARD_POSTS);
        return;
      }

      const fetched = await fetchBoardPosts(user.id, 40);
      setPosts(fetched);
    } catch (error) {
      setPosts([]);
      setLoadError(error instanceof Error ? error.message : '掲示板の取得に失敗しました。');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>掲示板</Text>
        <Text style={styles.subtitle}>施設や運営からのお知らせ</Text>
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.stateText}>掲示板を読み込み中...</Text>
        </View>
      ) : loadError ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{loadError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => void loadPosts()}>
            <Text style={styles.retryButtonText}>再読み込み</Text>
          </TouchableOpacity>
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.centerState}>
          <Bell size={48} color={colors.textSub} />
          <Text style={styles.emptyTitle}>まだお知らせはありません</Text>
          <Text style={styles.emptySubtext}>新しいお知らせが届くとここに表示されます</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void loadPosts(true)}
              tintColor={colors.accent}
            />
          }
        >
          <View style={styles.listContainer}>
            {posts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={[styles.postCard, post.isUnread && styles.postCardUnread]}
                onPress={() => router.push(`/board/${post.id}`)}
                activeOpacity={0.8}
              >
                <View style={styles.postHeader}>
                  <Text style={styles.postType}>{senderLabel(post.senderType)}</Text>
                  <Text style={styles.postTime}>{formatRelativeTime(post.createdAt)}</Text>
                </View>

                <View style={styles.postTitleRow}>
                  <Text style={styles.postTitle} numberOfLines={1}>
                    {post.title}
                  </Text>
                  {post.isUnread && <View style={styles.unreadDot} />}
                </View>

                <Text style={styles.postSummary} numberOfLines={2}>
                  {post.summary}
                </Text>

                <View style={styles.postFooter}>
                  <Text style={styles.moreText}>詳細を見る</Text>
                  <ChevronRight size={16} color={colors.textSub} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textMain,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSub,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  postCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  postCardUnread: {
    borderColor: `${colors.accent}55`,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  postType: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
  },
  postTime: {
    fontSize: 12,
    color: colors.textSub,
  },
  postTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  postTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    backgroundColor: colors.accent,
  },
  postSummary: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSub,
    marginBottom: 10,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  moreText: {
    fontSize: 12,
    color: colors.textSub,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 10,
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
  retryButton: {
    marginTop: 4,
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: colors.surface,
    fontWeight: '700',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
  },
  emptySubtext: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSub,
    textAlign: 'center',
  },
});
