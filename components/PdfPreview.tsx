import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { FileText } from 'lucide-react-native';
import { colors } from '../constants/colors';

interface PdfPreviewProps {
  uri: string;
  onLoadComplete?: (numberOfPages: number) => void;
  onError?: (error: any) => void;
}

export default function PdfPreview({ uri, onLoadComplete, onError }: PdfPreviewProps) {
  return (
    <View style={styles.container}>
      <FileText size={64} color={colors.accent} />
      <Text style={styles.title}>PDFプレビュー</Text>
      <Text style={styles.message}>
        PDFプレビュー機能はWeb版でご利用いただけます
      </Text>
      <Text style={styles.hint}>
        ダウンロードボタンからPDFを取得してください
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textMain,
    marginTop: 16,
  },
  message: {
    fontSize: 16,
    color: colors.textSub,
    marginTop: 12,
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    color: colors.textSub,
    marginTop: 8,
    textAlign: 'center',
  },
});
