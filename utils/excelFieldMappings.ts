/**
 * 就労証明書のデータ型定義
 *
 * 実テンプレートの「標準的な様式」に合わせて、
 * 事業所情報・本人情報・勤務条件・記載者情報を整理する。
 */

export const employmentIndustryOptions = [
  '農業・林業',
  '漁業',
  '鉱業・採石業・砂利採取業',
  '建設業',
  '製造業',
  '電気・ガス・熱供給・水道業',
  '情報通信業',
  '運輸業・郵便業',
  '卸売業・小売業',
  '金融業・保険業',
  '不動産業・物品賃貸業',
  '学術研究・専門・技術サービス',
  '宿泊業・飲食サービス業',
  '生活関連サービス業・娯楽業',
  '医療・福祉',
  '教育・学習支援業',
  '複合サービス事業',
  '公務',
  'その他',
] as const;

export const employmentTypes = [
  '正社員',
  'パート・アルバイト',
  '派遣社員',
  '契約社員',
  '会計年度任用職員',
  '非常勤・臨時職員',
  '役員',
  '自営業主',
  '自営業専従者',
  '家族従業者',
  '内職',
  '業務委託',
  'その他',
] as const;

export const scheduleTypes = ['fixed', 'variable'] as const;
export const workloadUnits = ['monthly', 'weekly'] as const;

export type EmploymentIndustry = typeof employmentIndustryOptions[number];
export type EmploymentType = typeof employmentTypes[number];
export type WorkScheduleType = typeof scheduleTypes[number];
export type WorkloadUnit = typeof workloadUnits[number];

export interface EmploymentCertificateData {
  employerIndustry: EmploymentIndustry | string;
  employerName: string;
  employerRepresentative: string;
  employerAddress: string;
  employerPhone: string;
  contactPersonName: string;
  contactPhone: string;
  issueDate: string;
  parentKana: string;
  parentName: string;
  parentBirthDate: string;
  workplaceName: string;
  workplaceAddress: string;
  hireDate: string;
  employmentType: EmploymentType | string;
  scheduleType: WorkScheduleType;
  monthlyWorkDays: string;
  weeklyWorkDays: string;
  fixedWorkStartTime: string;
  fixedWorkEndTime: string;
  fixedBreakMinutes: string;
  variableWorkDaysUnit: WorkloadUnit;
  variableWorkDays: string;
  variableWorkHoursUnit: WorkloadUnit;
  variableWorkHours: string;
  variableWorkStartTime: string;
  variableWorkEndTime: string;
  variableBreakMinutes: string;
  remarks: string;
}

function todayIsoDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function createEmptyEmploymentCertificateData(): EmploymentCertificateData {
  return {
    employerIndustry: 'その他',
    employerName: '',
    employerRepresentative: '',
    employerAddress: '',
    employerPhone: '',
    contactPersonName: '',
    contactPhone: '',
    issueDate: todayIsoDate(),
    parentKana: '',
    parentName: '',
    parentBirthDate: '',
    workplaceName: '',
    workplaceAddress: '',
    hireDate: '',
    employmentType: '正社員',
    scheduleType: 'fixed',
    monthlyWorkDays: '',
    weeklyWorkDays: '',
    fixedWorkStartTime: '',
    fixedWorkEndTime: '',
    fixedBreakMinutes: '',
    variableWorkDaysUnit: 'monthly',
    variableWorkDays: '',
    variableWorkHoursUnit: 'monthly',
    variableWorkHours: '',
    variableWorkStartTime: '',
    variableWorkEndTime: '',
    variableBreakMinutes: '',
    remarks: '',
  };
}

function getString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === 'string' ? value : '';
}

function normalizeEmploymentType(value: string): EmploymentType | string {
  if (value === 'パート' || value === 'アルバイト') {
    return 'パート・アルバイト';
  }
  if (value === '自営業') {
    return '自営業主';
  }
  return value || '正社員';
}

function normalizeUnit(value: string): WorkloadUnit {
  return value === 'weekly' ? 'weekly' : 'monthly';
}

function normalizeScheduleType(value: string): WorkScheduleType {
  return value === 'variable' ? 'variable' : 'fixed';
}

/**
 * 旧ドラフト保存形式も読み込めるように、現行の様式向けデータへ寄せる。
 */
export function normalizeEmploymentCertificateData(
  value: unknown
): EmploymentCertificateData {
  const fallback = createEmptyEmploymentCertificateData();

  if (!value || typeof value !== 'object') {
    return fallback;
  }

  const record = value as Record<string, unknown>;
  const data: EmploymentCertificateData = {
    ...fallback,
    employerIndustry: getString(record, 'employerIndustry') || fallback.employerIndustry,
    employerName: getString(record, 'employerName'),
    employerRepresentative: getString(record, 'employerRepresentative'),
    employerAddress: getString(record, 'employerAddress'),
    employerPhone: getString(record, 'employerPhone'),
    contactPersonName:
      getString(record, 'contactPersonName') || getString(record, 'issuerName'),
    contactPhone: getString(record, 'contactPhone'),
    issueDate: getString(record, 'issueDate') || fallback.issueDate,
    parentKana: getString(record, 'parentKana'),
    parentName: getString(record, 'parentName'),
    parentBirthDate: getString(record, 'parentBirthDate'),
    workplaceName: getString(record, 'workplaceName'),
    workplaceAddress: getString(record, 'workplaceAddress'),
    hireDate: getString(record, 'hireDate'),
    employmentType: normalizeEmploymentType(getString(record, 'employmentType')),
    scheduleType: normalizeScheduleType(getString(record, 'scheduleType')),
    monthlyWorkDays: getString(record, 'monthlyWorkDays'),
    weeklyWorkDays:
      getString(record, 'weeklyWorkDays') || getString(record, 'workingDaysPerWeek'),
    fixedWorkStartTime:
      getString(record, 'fixedWorkStartTime') || getString(record, 'workStartTime'),
    fixedWorkEndTime:
      getString(record, 'fixedWorkEndTime') || getString(record, 'workEndTime'),
    fixedBreakMinutes: getString(record, 'fixedBreakMinutes'),
    variableWorkDaysUnit: normalizeUnit(getString(record, 'variableWorkDaysUnit')),
    variableWorkDays: getString(record, 'variableWorkDays'),
    variableWorkHoursUnit: normalizeUnit(getString(record, 'variableWorkHoursUnit')),
    variableWorkHours:
      getString(record, 'variableWorkHours') || getString(record, 'workingHoursPerWeek'),
    variableWorkStartTime: getString(record, 'variableWorkStartTime'),
    variableWorkEndTime: getString(record, 'variableWorkEndTime'),
    variableBreakMinutes: getString(record, 'variableBreakMinutes'),
    remarks: getString(record, 'remarks'),
  };

  return data;
}
