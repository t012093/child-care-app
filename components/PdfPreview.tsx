import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Pdf from 'react-native-pdf';

interface PdfPreviewProps {
  uri: string;
  onLoadComplete?: (numberOfPages: number) => void;
  onError?: (error: any) => void;
}

export default function PdfPreview({ uri, onLoadComplete, onError }: PdfPreviewProps) {
  return (
    <Pdf
      source={{ uri }}
      style={styles.pdf}
      onLoadComplete={onLoadComplete}
      onError={onError}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 200,
  },
});
