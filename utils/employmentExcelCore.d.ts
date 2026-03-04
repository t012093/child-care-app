import type { EmploymentCertificateData } from './excelFieldMappings';

export function applyEmploymentTemplateData(
  sheetXml: string,
  data: EmploymentCertificateData
): string;

export function renderEmploymentTemplate(
  templateBuffer: ArrayBuffer | ArrayBufferView | Uint8Array | number[],
  data: EmploymentCertificateData
): ArrayBuffer;
