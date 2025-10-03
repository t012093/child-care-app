import React from 'react';
import { View, StyleSheet } from 'react-native';

interface PdfPreviewProps {
  uri: string;
  onLoadComplete?: (numberOfPages: number) => void;
  onError?: (error: any) => void;
}

export default function PdfPreview({ uri }: PdfPreviewProps) {
  return (
    <View style={styles.container}>
      <iframe
        src={uri}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="PDF Preview"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
