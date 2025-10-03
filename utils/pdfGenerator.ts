import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { pdfFieldMappings, PDFFieldMapping } from '../constants/pdfFields';

export interface ApplicationData {
  facilityName: string;
  applicationType: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  childName: string;
  childBirthDate: string;
  childGender: string;
  desiredStartDate: string;
  notes?: string;
}

/**
 * PDFテンプレートマップ
 * モバイル版では動的requireができないため、静的にマッピング
 */
const PDF_TEMPLATES: Record<string, any> = {
  // 一時保育申込書
  'temporary_care_application': require('../assets/templates/temporary_care_application.pdf'),
};

/**
 * PDFテンプレートを読み込む
 */
async function loadPDFTemplate(templateName: string): Promise<ArrayBuffer | null> {
  try {
    if (Platform.OS === 'web') {
      // Web版: publicフォルダから読み込み
      const response = await fetch(`/assets/templates/${templateName}.pdf`);
      if (!response.ok) {
        console.warn(`PDF template not found: ${templateName}`);
        return null;
      }
      return await response.arrayBuffer();
    } else {
      // モバイル版: 静的マッピングから取得
      const asset = PDF_TEMPLATES[templateName];
      if (!asset) {
        console.warn(`PDF template not found in static mapping: ${templateName}`);
        return null;
      }

      // Asset Moduleからファイルを読み込む
      const assetModule = require('@react-native/assets-registry/registry');
      const assetInfo = assetModule.getAssetByID(asset);

      if (!assetInfo) {
        return null;
      }

      const fileUri = assetInfo.uri;
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes.buffer;
    }
  } catch (error) {
    console.error('PDF template loading error:', error);
    return null;
  }
}

/**
 * AcroFormフィールドに値を設定
 */
async function fillAcroFormFields(
  pdfDoc: any,
  data: ApplicationData,
  mapping: PDFFieldMapping
): Promise<void> {
  const form = pdfDoc.getForm();

  Object.entries(mapping.fields).forEach(([dataKey, fieldName]) => {
    const value = data[dataKey as keyof ApplicationData];
    if (!value || typeof fieldName !== 'string') return;

    try {
      const field = form.getTextField(fieldName);
      field.setText(String(value));
    } catch (error) {
      console.warn(`Field not found: ${fieldName}`);
    }
  });
}

/**
 * 座標指定でテキストを描画
 */
async function drawTextByCoordinates(
  pdfDoc: any,
  data: ApplicationData,
  mapping: PDFFieldMapping,
  StandardFonts: any,
  rgb: any
): Promise<void> {
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  Object.entries(mapping.fields).forEach(([dataKey, position]) => {
    const value = data[dataKey as keyof ApplicationData];
    if (!value || typeof position === 'string') return;

    const { x, y, page: pageIndex, size = 12 } = position;
    const page = pdfDoc.getPage(pageIndex);

    page.drawText(String(value), {
      x,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  });
}

/**
 * @react-pdf/rendererで新規PDF生成（Web版のみ）
 */
export async function generatePDFFromReact(data: ApplicationData): Promise<Blob | null> {
  // モバイル版では@react-pdf/rendererは使用不可（import.metaエラー）
  if (Platform.OS !== 'web') {
    console.warn('@react-pdf/renderer is only supported on web platform');
    return null;
  }

  const ReactPDF = await import('@react-pdf/renderer');
  const { Document, Page, Text, View, StyleSheet, pdf } = ReactPDF;
  const React = await import('react');

  const styles = StyleSheet.create({
    page: {
      padding: 40,
      fontSize: 12,
      fontFamily: 'Helvetica',
    },
    title: {
      fontSize: 20,
      marginBottom: 20,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    section: {
      marginBottom: 15,
    },
    label: {
      fontSize: 10,
      color: '#666',
      marginBottom: 4,
    },
    value: {
      fontSize: 12,
      marginBottom: 8,
    },
  });

  const MyDocument = React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(Text, { style: styles.title }, data.applicationType),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.label }, '施設名'),
        React.createElement(Text, { style: styles.value }, data.facilityName)
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.label }, '保護者氏名'),
        React.createElement(Text, { style: styles.value }, data.parentName)
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.label }, '電話番号'),
        React.createElement(Text, { style: styles.value }, data.parentPhone)
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.label }, 'メールアドレス'),
        React.createElement(Text, { style: styles.value }, data.parentEmail)
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.label }, '住所'),
        React.createElement(Text, { style: styles.value }, data.address)
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.label }, 'お子様氏名'),
        React.createElement(Text, { style: styles.value }, data.childName)
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.label }, '生年月日'),
        React.createElement(Text, { style: styles.value }, data.childBirthDate)
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.label }, '性別'),
        React.createElement(Text, { style: styles.value }, data.childGender)
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.label }, '希望開始日'),
        React.createElement(Text, { style: styles.value }, data.desiredStartDate)
      ),
      data.notes &&
        React.createElement(
          View,
          { style: styles.section },
          React.createElement(Text, { style: styles.label }, '備考'),
          React.createElement(Text, { style: styles.value }, data.notes)
        )
    )
  );

  return await pdf(MyDocument).toBlob();
}

/**
 * 自治体PDFテンプレートを使用してPDF生成（Web版のみ）
 */
export async function generatePDFFromTemplate(
  data: ApplicationData,
  templateName: string = 'application_form'
): Promise<Uint8Array | null> {
  // モバイル版ではテンプレート機能を使用しない
  if (Platform.OS !== 'web') {
    console.warn('PDF template feature is only available on web platform');
    return null;
  }

  try {
    // Web版でのみpdf-libを動的import
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

    // テンプレート読み込み
    const templateBytes = await loadPDFTemplate(templateName);

    // テンプレートがない場合はnullを返す
    if (!templateBytes) {
      console.warn('PDF template not found, use generatePDFFromReact instead');
      return null;
    }

    const pdfDoc = await PDFDocument.load(templateBytes);
    const mapping = pdfFieldMappings[templateName];

    if (!mapping) {
      throw new Error(`No field mapping found for template: ${templateName}`);
    }

    // マッピングタイプに応じて処理
    if (mapping.type === 'acroform') {
      await fillAcroFormFields(pdfDoc, data, mapping);
    } else if (mapping.type === 'coordinate') {
      await drawTextByCoordinates(pdfDoc, data, mapping, StandardFonts, rgb);
    }

    return await pdfDoc.save();
  } catch (error) {
    console.error('PDF generation from template failed:', error);
    return null;
  }
}

/**
 * PDFをダウンロード（Web版）
 */
export async function downloadPDF(pdfBytes: Uint8Array | Blob, filename: string): Promise<void> {
  if (Platform.OS === 'web') {
    const blob = pdfBytes instanceof Blob ? pdfBytes : new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  } else {
    // モバイル版: expo-sharing等を使用
    console.log('Mobile PDF download not implemented yet');
  }
}

/**
 * メイン生成関数
 */
export async function generateApplicationPDF(
  data: ApplicationData,
  useTemplate: boolean = false
): Promise<{ success: boolean; blob?: Blob; bytes?: Uint8Array; error?: string }> {
  try {
    // モバイル版ではPDF生成機能は未対応
    if (Platform.OS !== 'web') {
      return {
        success: false,
        error: 'PDF生成機能はWeb版でのみ利用可能です。ブラウザでアクセスしてください。'
      };
    }

    if (useTemplate) {
      // テンプレートを使用
      const bytes = await generatePDFFromTemplate(data);
      if (bytes) {
        return { success: true, bytes };
      }
      // テンプレートがない場合はReact PDFにフォールバック
    }

    // @react-pdf/rendererで生成
    const blob = await generatePDFFromReact(data);
    if (!blob) {
      return {
        success: false,
        error: 'PDF生成に失敗しました'
      };
    }
    return { success: true, blob };
  } catch (error) {
    console.error('PDF generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
