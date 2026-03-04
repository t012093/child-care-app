import { Platform } from 'react-native';
import * as XLSX from 'xlsx';
import { EmploymentCertificateData } from './excelFieldMappings';

const INDUSTRY_CHECKBOX_MAP: Record<string, string> = {
  '農業・林業': 'I14',
  '漁業': 'M14',
  '鉱業・採石業・砂利採取業': 'Q14',
  '建設業': 'X14',
  '製造業': 'AA14',
  '電気・ガス・熱供給・水道業': 'AE14',
  '情報通信業': 'I15',
  '運輸業・郵便業': 'M15',
  '卸売業・小売業': 'R15',
  '金融業・保険業': 'W15',
  '不動産業・物品賃貸業': 'AE15',
  '学術研究・専門・技術サービス': 'I16',
  '宿泊業・飲食サービス業': 'Q16',
  '生活関連サービス業・娯楽業': 'W16',
  '医療・福祉': 'AF16',
  '教育・学習支援業': 'I17',
  '複合サービス事業': 'N17',
  '公務': 'S17',
  'その他': 'W17',
};

const EMPLOYMENT_TYPE_CHECKBOX_MAP: Record<string, string> = {
  '正社員': 'I23',
  'パート・アルバイト': 'L23',
  '派遣社員': 'Q23',
  '契約社員': 'T23',
  '会計年度任用職員': 'W23',
  '非常勤・臨時職員': 'AB23',
  '役員': 'AG23',
  '自営業主': 'I24',
  '自営業専従者': 'L24',
  '家族従業者': 'Q24',
  '内職': 'U24',
  '業務委託': 'W24',
  'その他': 'AA24',
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripTypeAttribute(attrs: string): string {
  return attrs.replace(/\s+t="[^"]*"/g, '');
}

function renderCell(
  ref: string,
  attrs: string,
  payload: string,
  kind: 'text' | 'number'
): string {
  const baseAttrs = stripTypeAttribute(attrs);

  if (!payload) {
    return `<c r="${ref}"${baseAttrs}/>`;
  }

  if (kind === 'number') {
    return `<c r="${ref}"${baseAttrs}><v>${payload}</v></c>`;
  }

  const escaped = escapeXml(payload);
  const preserve = /^\s|\s$/.test(payload) ? ' xml:space="preserve"' : '';
  return `<c r="${ref}"${baseAttrs} t="inlineStr"><is><t${preserve}>${escaped}</t></is></c>`;
}

function setCellValue(
  xml: string,
  ref: string,
  payload: string,
  kind: 'text' | 'number' = 'text'
): string {
  const emptyCell = new RegExp(`<c r="${ref}"([^>]*)\\/>`);
  const fullCell = new RegExp(`<c r="${ref}"([^>]*)>[\\s\\S]*?<\\/c>`);

  if (emptyCell.test(xml)) {
    return xml.replace(emptyCell, (_, attrs: string) =>
      renderCell(ref, attrs, payload, kind)
    );
  }
  if (fullCell.test(xml)) {
    return xml.replace(fullCell, (_, attrs: string) =>
      renderCell(ref, attrs, payload, kind)
    );
  }

  throw new Error(`Cell ${ref} was not found in template`);
}

function setCheckbox(xml: string, ref: string, checked: boolean): string {
  return setCellValue(xml, ref, checked ? '☑' : '□');
}

function splitPhone(phone: string): [string, string, string] {
  const trimmed = String(phone || '').trim();
  if (!trimmed) return ['', '', ''];

  const hyphenParts = trimmed.split('-').filter(Boolean);
  if (hyphenParts.length === 3) {
    return [hyphenParts[0], hyphenParts[1], hyphenParts[2]];
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) {
    return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)];
  }
  if (digits.length === 11) {
    return [digits.slice(0, 3), digits.slice(3, 7), digits.slice(7)];
  }

  return [trimmed, '', ''];
}

function splitDate(dateValue: string): [string, string, string] {
  const match = String(dateValue || '').match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (!match) return ['', '', ''];
  return [String(Number(match[1])), String(Number(match[2])), String(Number(match[3]))];
}

function splitTime(timeValue: string): [string, string] {
  const match = String(timeValue || '').match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return ['', ''];
  return [String(Number(match[1])), String(Number(match[2]))];
}

function splitWorkHours(value: string): [string, string] {
  const raw = String(value || '').trim();
  if (!raw) return ['', ''];

  const timeParts = raw.match(/^(\d{1,3}):(\d{1,2})$/);
  if (timeParts) {
    return [String(Number(timeParts[1])), String(Number(timeParts[2]))];
  }

  const decimalParts = raw.match(/^(\d{1,3})(?:\.(\d+))?$/);
  if (decimalParts) {
    const hours = Number(decimalParts[1]);
    const decimal = decimalParts[2] ? Number(`0.${decimalParts[2]}`) : 0;
    const minutes = Math.round(decimal * 60);
    return [String(hours), String(minutes)];
  }

  return [raw, ''];
}

function normalizeEmploymentType(value: string): string {
  if (value === 'パート' || value === 'アルバイト') return 'パート・アルバイト';
  if (value === '自営業') return '自営業主';
  return value;
}

function decodeBinary(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }
  if (content instanceof Uint8Array) {
    return new TextDecoder('utf-8').decode(content);
  }
  if (ArrayBuffer.isView(content)) {
    const view = content as ArrayBufferView;
    return new TextDecoder('utf-8').decode(
      new Uint8Array(view.buffer, view.byteOffset, view.byteLength)
    );
  }
  if (content instanceof ArrayBuffer) {
    return new TextDecoder('utf-8').decode(new Uint8Array(content));
  }
  if (Array.isArray(content)) {
    return new TextDecoder('utf-8').decode(new Uint8Array(content));
  }
  throw new Error('Unsupported binary content');
}

function toArrayBuffer(value: unknown): ArrayBuffer {
  if (value instanceof ArrayBuffer) {
    return value;
  }
  if (value instanceof Uint8Array) {
    const copied = new Uint8Array(value.byteLength);
    copied.set(value);
    return copied.buffer;
  }
  if (ArrayBuffer.isView(value)) {
    const view = value as ArrayBufferView;
    const copied = new Uint8Array(view.byteLength);
    copied.set(new Uint8Array(view.buffer, view.byteOffset, view.byteLength));
    return copied.buffer;
  }
  if (Array.isArray(value)) {
    const bytes = new Uint8Array(value);
    return bytes.buffer;
  }
  throw new Error('Unsupported output type from CFB.write');
}

function applyEmploymentTemplateData(
  sheetXml: string,
  data: EmploymentCertificateData
): string {
  let xml = sheetXml;

  const [issueYear, issueMonth, issueDay] = splitDate(data.issueDate);
  xml = setCellValue(xml, 'AA3', issueYear, 'number');
  xml = setCellValue(xml, 'AF3', issueMonth, 'number');
  xml = setCellValue(xml, 'AI3', issueDay, 'number');

  const industryCell = INDUSTRY_CHECKBOX_MAP[String(data.employerIndustry)] ?? INDUSTRY_CHECKBOX_MAP['その他'];
  Object.values(INDUSTRY_CHECKBOX_MAP).forEach((ref) => {
    xml = setCheckbox(xml, ref, ref === industryCell);
  });

  xml = setCellValue(xml, 'Z4', data.employerName);
  xml = setCellValue(xml, 'Z5', data.employerRepresentative);
  xml = setCellValue(xml, 'Z6', data.employerAddress);

  const [employerPhone1, employerPhone2, employerPhone3] = splitPhone(data.employerPhone);
  xml = setCellValue(xml, 'Z7', employerPhone1);
  xml = setCellValue(xml, 'AD7', employerPhone2);
  xml = setCellValue(xml, 'AI7', employerPhone3);

  xml = setCellValue(xml, 'Z8', data.contactPersonName);

  const [contactPhone1, contactPhone2, contactPhone3] = splitPhone(data.contactPhone);
  xml = setCellValue(xml, 'Z9', contactPhone1);
  xml = setCellValue(xml, 'AD9', contactPhone2);
  xml = setCellValue(xml, 'AI9', contactPhone3);

  xml = setCellValue(xml, 'I18', data.parentKana);
  xml = setCellValue(xml, 'I19', data.parentName);

  const [birthYear, birthMonth, birthDay] = splitDate(data.parentBirthDate);
  xml = setCellValue(xml, 'AD19', birthYear, 'number');
  xml = setCellValue(xml, 'AH19', birthMonth, 'number');
  xml = setCellValue(xml, 'AJ19', birthDay, 'number');

  const [hireYear, hireMonth, hireDay] = splitDate(data.hireDate);
  xml = setCheckbox(xml, 'I20', true);
  xml = setCheckbox(xml, 'K20', false);
  xml = setCellValue(xml, 'M21', data.workplaceName);
  xml = setCellValue(xml, 'M22', data.workplaceAddress);
  xml = setCellValue(xml, 'T20', hireYear, 'number');
  xml = setCellValue(xml, 'W20', hireMonth, 'number');
  xml = setCellValue(xml, 'Y20', hireDay, 'number');

  const employmentType = normalizeEmploymentType(String(data.employmentType || ''));
  const employmentCell =
    EMPLOYMENT_TYPE_CHECKBOX_MAP[employmentType] ?? EMPLOYMENT_TYPE_CHECKBOX_MAP['その他'];
  Object.values(EMPLOYMENT_TYPE_CHECKBOX_MAP).forEach((ref) => {
    xml = setCheckbox(xml, ref, ref === employmentCell);
  });

  xml = setCellValue(xml, 'Q27', data.monthlyWorkDays, 'number');
  xml = setCellValue(xml, 'AC27', data.weeklyWorkDays, 'number');

  if (data.scheduleType === 'variable') {
    const isMonthlyHours = data.variableWorkHoursUnit !== 'weekly';
    const isMonthlyDays = data.variableWorkDaysUnit !== 'weekly';
    xml = setCheckbox(xml, 'M31', isMonthlyHours);
    xml = setCheckbox(xml, 'P31', !isMonthlyHours);
    xml = setCheckbox(xml, 'M32', isMonthlyDays);
    xml = setCheckbox(xml, 'P32', !isMonthlyDays);

    const [variableHours, variableMinutes] = splitWorkHours(data.variableWorkHours);
    xml = setCellValue(xml, 'S31', variableHours, 'number');
    xml = setCellValue(xml, 'W31', variableMinutes, 'number');
    xml = setCellValue(xml, 'S32', data.variableWorkDays, 'number');

    const [startHour, startMinute] = splitTime(data.variableWorkStartTime);
    const [endHour, endMinute] = splitTime(data.variableWorkEndTime);
    xml = setCellValue(xml, 'M33', startHour, 'number');
    xml = setCellValue(xml, 'P33', startMinute, 'number');
    xml = setCellValue(xml, 'T33', endHour, 'number');
    xml = setCellValue(xml, 'W33', endMinute, 'number');
    xml = setCellValue(xml, 'AC33', data.variableBreakMinutes, 'number');
  } else {
    const [startHour, startMinute] = splitTime(data.fixedWorkStartTime);
    const [endHour, endMinute] = splitTime(data.fixedWorkEndTime);
    xml = setCellValue(xml, 'K28', startHour, 'number');
    xml = setCellValue(xml, 'N28', startMinute, 'number');
    xml = setCellValue(xml, 'T28', endHour, 'number');
    xml = setCellValue(xml, 'W28', endMinute, 'number');
    xml = setCellValue(xml, 'AC28', data.fixedBreakMinutes, 'number');

    xml = setCheckbox(xml, 'M31', false);
    xml = setCheckbox(xml, 'P31', false);
    xml = setCheckbox(xml, 'M32', false);
    xml = setCheckbox(xml, 'P32', false);
    xml = setCellValue(xml, 'S31', '', 'number');
    xml = setCellValue(xml, 'W31', '', 'number');
    xml = setCellValue(xml, 'S32', '', 'number');
    xml = setCellValue(xml, 'M33', '', 'number');
    xml = setCellValue(xml, 'P33', '', 'number');
    xml = setCellValue(xml, 'T33', '', 'number');
    xml = setCellValue(xml, 'W33', '', 'number');
    xml = setCellValue(xml, 'AC33', '', 'number');
  }

  xml = setCellValue(xml, 'I50', data.remarks);
  return xml;
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
    const templateAsset = require('../assets/templates/employment_certificate.xlsx');
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
 *
 * テンプレートの ZIP 構造を保持したまま sheet1.xml の対象セルだけを更新する。
 */
export async function generateEmploymentCertificateExcel(
  data: EmploymentCertificateData
): Promise<ArrayBuffer> {
  if (Platform.OS !== 'web') {
    throw new Error('Excel generation is currently supported on web only');
  }

  const templateAsset = require('../assets/templates/employment_certificate.xlsx');
  const response = await fetch(templateAsset);
  if (!response.ok) {
    throw new Error(`Template fetch failed: ${response.status}`);
  }

  const templateBuffer = await response.arrayBuffer();
  const cfb = (XLSX as any).CFB.read(new Uint8Array(templateBuffer), { type: 'array' });

  const fullPaths: string[] = cfb.FullPaths || [];
  const index = fullPaths.findIndex(
    (p) => p === 'Root Entry/xl/worksheets/sheet1.xml'
  );
  if (index < 0) {
    throw new Error('sheet1.xml not found in template');
  }

  const entry = cfb.FileIndex[index];
  const currentXml = decodeBinary(entry.content);
  const updatedXml = applyEmploymentTemplateData(currentXml, data);
  const encoded = new TextEncoder().encode(updatedXml);
  entry.content = encoded;
  entry.size = encoded.byteLength;

  const zipped = (XLSX as any).CFB.write(cfb, { fileType: 'zip', type: 'array' });
  return toArrayBuffer(zipped);
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
