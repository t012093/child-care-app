import { Platform } from 'react-native';
import { ApplicationData } from './pdfGenerator';
import { loadPdfMapping } from './pdfMappingStorage';
import { AssetLike, resolveAssetUri, triggerBrowserDownload } from './downloadHelpers';

/**
 * マッピング設定を使ってPDFに自動入力
 * Web版のみ対応
 */
export async function autoFillPDF(
  templatePath: AssetLike,
  templateName: string,
  data: ApplicationData
): Promise<Blob | null> {
  if (Platform.OS !== 'web') {
    console.warn('PDF auto-fill is only supported on web platform');
    return null;
  }

  try {
    // pdf-libを動的import（Web版のみ）
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

    // マッピング設定を読み込み
    const mappingData = loadPdfMapping(templateName);
    if (!mappingData || mappingData.fields.length === 0) {
      throw new Error('マッピング設定が見つかりません。先にマッピングエディタで設定してください。');
    }

    // テンプレートPDFを読み込み
    const templateUri = resolveAssetUri(templatePath);
    const templateResponse = await fetch(templateUri);
    if (!templateResponse.ok) {
      throw new Error(`テンプレートPDFの取得に失敗しました (${templateResponse.status})`);
    }
    const templateBytes = await templateResponse.arrayBuffer();
    const pdfDoc = await PDFDocument.load(templateBytes);

    // フォントを埋め込み
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // 各フィールドをマッピング座標に描画
    mappingData.fields.forEach((mapping) => {
      const fieldValue = data[mapping.fieldId as keyof ApplicationData];
      if (!fieldValue) return;

      const page = pdfDoc.getPage(mapping.coordinate.page);
      const fontSize = mapping.coordinate.size || 12;

      // テキストを描画
      page.drawText(String(fieldValue), {
        x: mapping.coordinate.x,
        y: mapping.coordinate.y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    });

    // PDF生成
    const pdfBytes = await pdfDoc.save();
    return new Blob([Uint8Array.from(pdfBytes)], { type: 'application/pdf' });
  } catch (error) {
    console.error('PDF auto-fill failed:', error);
    throw error;
  }
}

/**
 * 自動入力済みPDFをダウンロード
 */
export async function downloadAutoFilledPDF(
  templatePath: AssetLike,
  templateName: string,
  data: ApplicationData,
  filename: string
): Promise<void> {
  const blob = await autoFillPDF(templatePath, templateName, data);

  if (!blob) {
    throw new Error('PDFの生成に失敗しました');
  }

  // ダウンロード
  triggerBrowserDownload(blob, filename);
}
