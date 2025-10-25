import { Platform } from 'react-native';
import { EmploymentCertificateData } from './excelFieldMappings';

/**
 * 就労証明書のExcelテンプレートをダウンロード
 *
 * 注: 現在はテンプレートファイルのダウンロードのみ対応
 * 自動入力機能は技術的制約により未実装
 *
 * @param filename - ダウンロードするファイル名
 */
export async function downloadTemplateExcel(filename: string): Promise<void> {
  // Web版専用実装
  if (Platform.OS !== 'web') {
    console.warn('Excel template download is only available on web platform');
    throw new Error('この機能はWeb版でのみ利用可能です');
  }

  try {
    // Metro Asset Systemを使用（.xlsxをassetExtsに追加済み）
    const templateAsset = require('../assets/templates/employment_certificate.xlsx');

    console.log('Downloading Excel template from Metro asset:', templateAsset);

    // fetchで取得
    const response = await fetch(templateAsset);
    if (!response.ok) {
      throw new Error(`Template not found: ${response.status}`);
    }

    const blob = await response.blob();

    // ダウンロード
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    console.log('Template downloaded successfully');
  } catch (error) {
    console.error('Template download failed:', error);
    throw error;
  }
}

/**
 * 就労証明書のExcelファイルを生成（現在は未対応）
 *
 * 技術的制約により、現在はテンプレートダウンロードのみ対応
 * ユーザーは手動でExcelに入力してください
 *
 * @param data - フォーム入力データ
 * @returns null（常に失敗）
 */
export async function generateEmploymentCertificateExcel(
  data: EmploymentCertificateData
): Promise<ArrayBuffer | null> {
  console.warn('Excel auto-fill feature is not available. Please download the template and fill manually.');
  return null;
}

/**
 * Excelファイルをダウンロード（ヘルパー関数）
 */
export async function downloadExcel(
  buffer: ArrayBuffer,
  filename: string
): Promise<void> {
  if (Platform.OS === 'web') {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  } else {
    console.log('Mobile Excel download not implemented yet');
  }
}

/**
 * 就労証明書Excelファイルのダウンロード用URL生成
 */
export function createExcelBlobUrl(buffer: ArrayBuffer): string {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  return URL.createObjectURL(blob);
}
