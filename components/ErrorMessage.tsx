import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, RefreshCw, X } from 'lucide-react-native';
import { facilityColors } from '../constants/colors';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  type?: 'inline' | 'card' | 'toast';
}

export default function ErrorMessage({
  title = 'エラーが発生しました',
  message = '時間をおいて再度お試しください',
  onRetry,
  onDismiss,
  type = 'card',
}: ErrorMessageProps) {
  if (type === 'toast') {
    return (
      <View style={styles.toastContainer}>
        <View style={styles.toastContent}>
          <AlertCircle size={20} color="#EF4444" />
          <Text style={styles.toastText}>{message}</Text>
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.toastClose}>
            <X size={20} color={facilityColors.textSub} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (type === 'inline') {
    return (
      <View style={styles.inlineContainer}>
        <AlertCircle size={18} color="#EF4444" />
        <Text style={styles.inlineText}>{message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      <View style={styles.iconContainer}>
        <AlertCircle size={48} color="#EF4444" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.actions}>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <RefreshCw size={18} color="white" />
            <Text style={styles.retryButtonText}>再試行</Text>
          </TouchableOpacity>
        )}
        {onDismiss && (
          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <Text style={styles.dismissButtonText}>閉じる</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Card style
  cardContainer: {
    backgroundColor: facilityColors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: facilityColors.textMain,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: facilityColors.textSub,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: facilityColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  dismissButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: facilityColors.accentSoft,
  },
  dismissButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: facilityColors.textMain,
  },

  // Inline style
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  inlineText: {
    fontSize: 13,
    color: '#DC2626',
    flex: 1,
  },

  // Toast style
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: facilityColors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  toastText: {
    fontSize: 14,
    color: facilityColors.textMain,
    flex: 1,
  },
  toastClose: {
    padding: 4,
  },
});
