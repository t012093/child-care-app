/**
 * PDF自動入力用フィールドマッピング設定
 *
 * 自治体PDFの種類に応じて、以下の2つの方式をサポート：
 * 1. acroform: PDFにフォームフィールドが埋め込まれている場合
 * 2. coordinate: 座標指定でテキストを描画する場合
 */

export interface CoordinateField {
  x: number;
  y: number;
  page: number;
  size?: number;
}

export interface PDFFieldMapping {
  type: 'acroform' | 'coordinate';
  fields: {
    [key: string]: string | CoordinateField;
  };
}

export interface PDFFieldMappings {
  [templateName: string]: PDFFieldMapping;
}

/**
 * フィールドマッピング定義
 *
 * 使用方法:
 * 1. Adobe Acrobatで自治体PDFを開く
 * 2. フォームフィールドがある場合: typeを'acroform'に設定し、フィールド名をマッピング
 * 3. フォームフィールドがない場合: typeを'coordinate'に設定し、座標を測定してマッピング
 */
export const pdfFieldMappings: PDFFieldMappings = {
  // サンプル: AcroFormフィールドがある場合
  application_form_acroform: {
    type: 'acroform',
    fields: {
      facilityName: 'field_facility_name',
      applicationType: 'field_application_type',
      parentName: 'field_parent_name',
      parentPhone: 'field_parent_phone',
      parentEmail: 'field_parent_email',
      address: 'field_address',
      childName: 'field_child_name',
      childBirthDate: 'field_child_birthdate',
      childGender: 'field_child_gender',
      desiredStartDate: 'field_desired_start_date',
      notes: 'field_notes',
    },
  },

  // サンプル: 座標指定の場合（PDF左下が原点(0,0)）
  application_form_coordinate: {
    type: 'coordinate',
    fields: {
      facilityName: { x: 150, y: 750, page: 0, size: 12 },
      applicationType: { x: 150, y: 720, page: 0, size: 12 },
      parentName: { x: 150, y: 680, page: 0, size: 12 },
      parentPhone: { x: 150, y: 650, page: 0, size: 12 },
      parentEmail: { x: 150, y: 620, page: 0, size: 12 },
      address: { x: 150, y: 590, page: 0, size: 12 },
      childName: { x: 150, y: 550, page: 0, size: 12 },
      childBirthDate: { x: 150, y: 520, page: 0, size: 12 },
      childGender: { x: 150, y: 490, page: 0, size: 12 },
      desiredStartDate: { x: 150, y: 460, page: 0, size: 12 },
      notes: { x: 150, y: 420, page: 0, size: 10 },
    },
  },

  // 一時保育事業利用申込書（座標指定）
  temporary_care_application: {
    type: 'coordinate',
    fields: {
      // ページ1: 基本情報
      childName: { x: 200, y: 720, page: 0, size: 12 },
      childBirthDate: { x: 200, y: 690, page: 0, size: 12 },
      childGender: { x: 450, y: 690, page: 0, size: 12 },
      address: { x: 150, y: 660, page: 0, size: 11 },
      parentName: { x: 200, y: 630, page: 0, size: 12 },
      parentPhone: { x: 200, y: 600, page: 0, size: 12 },
      facilityName: { x: 200, y: 570, page: 0, size: 12 },
      desiredStartDate: { x: 200, y: 540, page: 0, size: 12 },
      notes: { x: 100, y: 480, page: 0, size: 10 },
    },
  },
};

/**
 * 座標調査ヘルパー関数
 *
 * PDF座標系の参考:
 * - 原点(0,0)は左下
 * - A4サイズ: 幅595px × 高さ842px
 * - 上部の座標: y=800前後
 * - 下部の座標: y=50前後
 */
export function getPDFCoordinateHelper() {
  return {
    A4_WIDTH: 595,
    A4_HEIGHT: 842,
    // よく使う座標
    TOP: 800,
    MIDDLE: 420,
    BOTTOM: 50,
    LEFT_MARGIN: 50,
    CENTER: 297.5,
  };
}
