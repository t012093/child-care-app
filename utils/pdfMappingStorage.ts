import { CoordinateField } from '../constants/pdfFields';

export interface FieldMapping {
  fieldId: string;
  fieldLabel: string;
  coordinate: CoordinateField;
}

export interface PdfMappingData {
  templateName: string;
  fields: FieldMapping[];
  lastUpdated: string;
}

const STORAGE_KEY_PREFIX = 'pdf_mapping_';

/**
 * PDFマッピングデータをLocalStorageに保存
 */
export function savePdfMapping(templateName: string, mappings: FieldMapping[]): void {
  const data: PdfMappingData = {
    templateName,
    fields: mappings,
    lastUpdated: new Date().toISOString(),
  };

  try {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${templateName}`,
      JSON.stringify(data)
    );
  } catch (error) {
    console.error('Failed to save PDF mapping:', error);
  }
}

/**
 * LocalStorageからPDFマッピングデータを読み込み
 */
export function loadPdfMapping(templateName: string): PdfMappingData | null {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${templateName}`);
    if (!data) return null;

    return JSON.parse(data) as PdfMappingData;
  } catch (error) {
    console.error('Failed to load PDF mapping:', error);
    return null;
  }
}

/**
 * PDFマッピングデータを削除
 */
export function deletePdfMapping(templateName: string): void {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${templateName}`);
  } catch (error) {
    console.error('Failed to delete PDF mapping:', error);
  }
}

/**
 * すべてのPDFマッピングデータをリスト取得
 */
export function listAllPdfMappings(): PdfMappingData[] {
  const mappings: PdfMappingData[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        const data = localStorage.getItem(key);
        if (data) {
          mappings.push(JSON.parse(data));
        }
      }
    }
  } catch (error) {
    console.error('Failed to list PDF mappings:', error);
  }

  return mappings;
}

/**
 * pdfFields.ts形式にエクスポート
 */
export function exportToPdfFieldsFormat(mappings: FieldMapping[]): string {
  const fields: Record<string, CoordinateField> = {};

  mappings.forEach(mapping => {
    fields[mapping.fieldId] = mapping.coordinate;
  });

  return JSON.stringify(fields, null, 2);
}
