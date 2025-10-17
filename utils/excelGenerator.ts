import { Platform } from 'react-native';
import {
  EmploymentCertificateData,
  employmentCertificateMappings,
} from './excelFieldMappings';

/**
 * Excelテンプレートを読み込む
 * Web版・モバイル版共通でMetro asset systemを使用
 */
async function loadExcelTemplate(): Promise<ArrayBuffer | null> {
  try {
    // Metro asset systemで配信されるURLを取得
    const asset = require('../assets/templates/employment_certificate.xlsx');

    // Web版・モバイル版ともにfetchで取得
    const response = await fetch(asset);
    if (!response.ok) {
      console.warn('Excel template not found');
      return null;
    }
    return await response.arrayBuffer();
  } catch (error) {
    console.error('Excel template loading error:', error);
    return null;
  }
}

/**
 * 名前付きセルに値を設定
 * ExcelJSを使用してExcelファイルの名前付きセルに値を書き込みます
 */
async function fillNamedCells(
  workbook: any,
  data: EmploymentCertificateData
): Promise<void> {
  // 全てのワークシートを取得
  workbook.eachSheet((worksheet: any) => {
    // データフィールドごとに処理
    Object.entries(employmentCertificateMappings).forEach(
      ([dataKey, namedCell]) => {
        const value = data[dataKey as keyof EmploymentCertificateData];
        if (!value) return;

        try {
          // 名前付きセルを検索
          const definedNames = workbook.definedNames.model;
          const namedRange = definedNames[namedCell];

          if (namedRange) {
            // セルのアドレスを取得
            const cellAddress = namedRange.ranges?.[0];
            if (cellAddress) {
              const cell = worksheet.getCell(cellAddress);
              if (cell) {
                cell.value = String(value);
              }
            }
          } else {
            // 名前付きセルが見つからない場合は警告を出すが続行
            console.warn(
              `Named cell not found: ${namedCell} for field ${dataKey}`
            );
          }
        } catch (error) {
          console.warn(
            `Error setting value for named cell ${namedCell}:`,
            error
          );
        }
      }
    );
  });
}

/**
 * 就労証明書のExcelファイルを生成（Web版のみ）
 *
 * @param data - フォーム入力データ
 * @returns 生成されたExcelファイルのArrayBuffer（失敗時はnull）
 */
export async function generateEmploymentCertificateExcel(
  data: EmploymentCertificateData
): Promise<ArrayBuffer | null> {
  // モバイル版では未対応
  if (Platform.OS !== 'web') {
    console.warn(
      'Excel generation is only available on web platform. Use template download on mobile.'
    );
    return null;
  }

  try {
    // Web版でのみExcelJSを動的import
    const ExcelJS = await import('exceljs');

    // テンプレート読み込み
    const templateBuffer = await loadExcelTemplate();
    if (!templateBuffer) {
      console.error('Failed to load Excel template');
      return null;
    }

    // Workbookを作成してテンプレートを読み込み
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateBuffer);

    // 名前付きセルに値を設定
    await fillNamedCells(workbook, data);

    // Excelファイルをバッファに書き込み
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    console.error('Excel generation failed:', error);
    return null;
  }
}

/**
 * Excelファイルをダウンロード（Web版）
 *
 * @param buffer - Excelファイルのバッファ
 * @param filename - ダウンロードするファイル名
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
    // モバイル版: expo-sharing等を使用（今後実装予定）
    console.log('Mobile Excel download not implemented yet');
  }
}

/**
 * 就労証明書Excelファイルのダウンロード用URL生成（プレビュー用）
 *
 * @param buffer - Excelファイルのバッファ
 * @returns Blob URL
 */
export function createExcelBlobUrl(buffer: ArrayBuffer): string {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  return URL.createObjectURL(blob);
}

/**
 * テンプレートExcelファイルのダウンロード（入力なし）
 *
 * @param filename - ダウンロードするファイル名
 */
export async function downloadTemplateExcel(filename: string): Promise<void> {
  try {
    const templateBuffer = await loadExcelTemplate();
    if (!templateBuffer) {
      throw new Error('Template not found');
    }
    await downloadExcel(templateBuffer, filename);
  } catch (error) {
    console.error('Template download failed:', error);
    throw error;
  }
}
