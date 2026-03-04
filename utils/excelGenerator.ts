import { Platform } from 'react-native';
import { EmploymentCertificateData } from './excelFieldMappings';
import employmentCertificateTemplate from '../assets/templates/employment_certificate.xlsx';
import { renderEmploymentTemplate } from './employmentExcelCore';

function getTemplateAssetUrl(): string {
  if (typeof employmentCertificateTemplate !== 'string') {
    throw new Error('Excel template URL is not available on this platform');
  }
  return employmentCertificateTemplate;
}

/**
 * 就労証明書のExcelテンプレートをダウンロード
 *
 * @param filename - ダウンロードするファイル名
 */
export async function downloadTemplateExcel(filename: string): Promise<void> {
  if (Platform.OS !== 'web') {
    console.warn('Excel template download is only available on web platform');
    throw new Error('この機能はWeb版でのみ利用可能です');
  }

  try {
    const templateAsset = getTemplateAssetUrl();
    const response = await fetch(templateAsset);
    if (!response.ok) {
      throw new Error(`Template not found: ${response.status}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Template download failed:', error);
    throw error;
  }
}

/**
 * 就労証明書のExcelファイルを生成
 */
export async function generateEmploymentCertificateExcel(
  data: EmploymentCertificateData
): Promise<ArrayBuffer> {
  if (Platform.OS !== 'web') {
    throw new Error('Excel generation is currently supported on web only');
  }

  const templateAsset = getTemplateAssetUrl();
  const response = await fetch(templateAsset);
  if (!response.ok) {
    throw new Error(`Template fetch failed: ${response.status}`);
  }

  const templateBuffer = await response.arrayBuffer();
  return renderEmploymentTemplate(templateBuffer, data);
}

/**
 * Excelファイルをダウンロード（ヘルパー関数）
 */
export async function downloadExcel(buffer: ArrayBuffer, filename: string): Promise<void> {
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
