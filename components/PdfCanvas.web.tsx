import React, { useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { FieldMapping } from '../utils/pdfMappingStorage';

interface PdfCanvasProps {
  pdfUrl: string;
  mappings: FieldMapping[];
  hasSelectedField: boolean;
  onCanvasClick: (x: number, y: number) => void;
}

interface FieldMarker {
  id: string;
  label: string;
  x: number;
  y: number;
}

export default function PdfCanvas({ pdfUrl, mappings, hasSelectedField, onCanvasClick }: PdfCanvasProps) {
  const [currentPage] = useState(0);
  const [fieldMarkers, setFieldMarkers] = useState<FieldMarker[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !hasSelectedField) return;

    const rect = containerRef.current.getBoundingClientRect();
    // オフセット調整 - 少し左上に
    const x = event.clientX - rect.left - 5; // 5px左に
    const y = event.clientY - rect.top - 5; // 5px上に

    onCanvasClick(x, y);
  };

  // mappingsからマーカーを生成
  React.useEffect(() => {
    const markers = mappings
      .filter(m => m.coordinate.page === currentPage)
      .map(m => ({
        id: m.fieldId,
        label: m.fieldLabel,
        x: m.coordinate.x,
        y: m.coordinate.y,
      }));
    setFieldMarkers(markers);
  }, [mappings, currentPage]);

  return (
    <View style={styles.container}>
      <div
        ref={containerRef}
        style={{
          flex: 1,
          position: 'relative',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 8,
          overflow: 'auto',
          cursor: hasSelectedField ? 'crosshair' : 'default',
        }}
        onClick={handleClick}
      >
        <iframe
          src={pdfUrl}
          style={{
            width: '100%',
            height: '800px',
            border: 'none',
            pointerEvents: 'none',
          }}
          title="PDF Preview"
        />

        {/* フィールドマーカー表示 */}
        {fieldMarkers.map((marker) => (
          <div
            key={marker.id}
            style={{
              position: 'absolute',
              left: marker.x,
              top: marker.y,
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              border: '2px solid #3B82F6',
              borderRadius: 4,
              padding: '4px 8px',
              fontSize: 12,
              color: '#1E40AF',
              fontWeight: 600,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {marker.label}
          </div>
        ))}

        {hasSelectedField && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(59, 130, 246, 0.9)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>📍</span>
            <span>PDF上の配置したい場所をクリック</span>
          </div>
        )}
      </div>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
