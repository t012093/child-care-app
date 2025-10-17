/**
 * 就労証明書のExcelファイル名前付きセルマッピング定義
 *
 * Excelテンプレートで定義された名前付きセル（Named Ranges）と
 * アプリケーションのデータフィールドを対応付けます。
 */

export interface EmploymentCertificateMappings {
  [key: string]: string; // データフィールド名 → Excel名前付きセル名
}

/**
 * 就労証明書の名前付きセルマッピング
 *
 * 例: Excelファイルで「employer_name」という名前付きセルを定義している場合、
 * そのセルにアプリの「employerName」フィールドの値が自動入力されます。
 */
export const employmentCertificateMappings: EmploymentCertificateMappings = {
  // 雇用主情報
  employerName: 'employer_name',
  employerAddress: 'employer_address',
  employerPhone: 'employer_phone',
  employerRepresentative: 'employer_representative', // 事業主氏名

  // 従業員（保護者）情報
  parentName: 'employee_name',
  parentAddress: 'employee_address',
  parentBirthDate: 'employee_birth_date',
  hireDate: 'hire_date', // 雇用開始日

  // 勤務情報
  employmentType: 'employment_type', // 正社員/パート/契約社員等
  workingDaysPerWeek: 'working_days_per_week',
  workingHoursPerWeek: 'working_hours_per_week',
  workStartTime: 'work_start_time',
  workEndTime: 'work_end_time',
  jobDescription: 'job_description', // 業務内容

  // 証明書発行情報
  issueDate: 'issue_date',
  issuerName: 'issuer_name', // 証明書発行者名
  issuerTitle: 'issuer_title', // 証明書発行者役職
};

/**
 * 雇用形態の選択肢
 */
export const employmentTypes = [
  '正社員',
  'パート',
  'アルバイト',
  '契約社員',
  '派遣社員',
  '自営業',
  'その他',
] as const;

export type EmploymentType = typeof employmentTypes[number];

/**
 * データフィールドの型定義
 */
export interface EmploymentCertificateData {
  // 雇用主情報
  employerName: string;
  employerAddress: string;
  employerPhone: string;
  employerRepresentative: string;

  // 従業員（保護者）情報
  parentName: string;
  parentAddress: string;
  parentBirthDate: string;
  hireDate: string;

  // 勤務情報
  employmentType: EmploymentType | string;
  workingDaysPerWeek: string;
  workingHoursPerWeek: string;
  workStartTime: string;
  workEndTime: string;
  jobDescription: string;

  // 証明書発行情報
  issueDate: string;
  issuerName: string;
  issuerTitle: string;
}
