#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const TEMPLATE_PATH = path.resolve(
  __dirname,
  '../assets/templates/employment_certificate.xlsx'
);
const DEFAULT_OUTPUT_PATH = path.resolve(
  __dirname,
  '../artifacts/employment_certificate_poc_output.xlsx'
);

const DEFAULT_DATA = {
  employerIndustry: '医療・福祉',
  employerName: '社会福祉法人ほいポチ',
  employerRepresentative: '山田 太郎',
  employerAddress: '北海道札幌市中央区北1条西2丁目3-4',
  employerPhone: '011-123-4567',
  contactPersonName: '佐藤 花子',
  contactPhone: '011-987-6543',
  issueDate: '2026-03-04',
  parentKana: 'ハナダ サユリ',
  parentName: '花田 さゆり',
  parentBirthDate: '1990-04-01',
  workplaceName: 'ほいポチ札幌支店',
  workplaceAddress: '北海道札幌市中央区南1条西5丁目6-7',
  hireDate: '2020-04-01',
  employmentType: '正社員',
  scheduleType: 'fixed',
  monthlyWorkDays: '20',
  weeklyWorkDays: '5',
  fixedWorkStartTime: '09:00',
  fixedWorkEndTime: '18:00',
  fixedBreakMinutes: '60',
  remarks: 'PoC generated from render-employment-certificate-poc.js',
};

const INDUSTRY_CHECKBOX_MAP = {
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

const EMPLOYMENT_TYPE_CHECKBOX_MAP = {
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

function usage() {
  console.log(
    [
      'Usage:',
      '  node scripts/render-employment-certificate-poc.js [input.json] [output.xlsx]',
      '',
      'If input.json is omitted, built-in sample data is used.',
      `Default output: ${DEFAULT_OUTPUT_PATH}`,
    ].join('\n')
  );
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripTypeAttribute(attrs) {
  return attrs.replace(/\s+t="[^"]*"/g, '');
}

function renderCell(ref, attrs, payload, kind) {
  const baseAttrs = stripTypeAttribute(attrs);

  if (payload === undefined || payload === null || payload === '') {
    return `<c r="${ref}"${baseAttrs}/>`;
  }

  if (kind === 'number') {
    return `<c r="${ref}"${baseAttrs}><v>${payload}</v></c>`;
  }

  const escaped = escapeXml(payload);
  const preserve = /^\s|\s$/.test(String(payload)) ? ' xml:space="preserve"' : '';
  return `<c r="${ref}"${baseAttrs} t="inlineStr"><is><t${preserve}>${escaped}</t></is></c>`;
}

function setCellValue(xml, ref, payload, kind = 'text') {
  const emptyCell = new RegExp(`<c r="${ref}"([^>]*)\\/>`);
  const fullCell = new RegExp(`<c r="${ref}"([^>]*)>[\\s\\S]*?<\\/c>`);

  if (emptyCell.test(xml)) {
    return xml.replace(emptyCell, (_, attrs) => renderCell(ref, attrs, payload, kind));
  }
  if (fullCell.test(xml)) {
    return xml.replace(fullCell, (_, attrs) => renderCell(ref, attrs, payload, kind));
  }

  throw new Error(`Cell ${ref} was not found in template`);
}

function setCheckbox(xml, ref, checked) {
  return setCellValue(xml, ref, checked ? '☑' : '□');
}

function splitPhone(phone) {
  const trimmed = String(phone || '').trim();
  if (!trimmed) return ['', '', ''];

  const hyphenParts = trimmed.split('-').filter(Boolean);
  if (hyphenParts.length === 3) return hyphenParts;

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)];
  if (digits.length === 11) return [digits.slice(0, 3), digits.slice(3, 7), digits.slice(7)];
  return [trimmed, '', ''];
}

function splitDate(dateValue) {
  const match = String(dateValue || '').match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (!match) return ['', '', ''];
  return [String(Number(match[1])), String(Number(match[2])), String(Number(match[3]))];
}

function splitTime(timeValue) {
  const match = String(timeValue || '').match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return ['', ''];
  return [String(Number(match[1])), String(Number(match[2]))];
}

function splitWorkHours(value) {
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

function loadInputData(jsonPath) {
  if (!jsonPath) {
    return DEFAULT_DATA;
  }

  const raw = fs.readFileSync(path.resolve(jsonPath), 'utf8');
  const parsed = JSON.parse(raw);
  return { ...DEFAULT_DATA, ...parsed };
}

function ensureDir(targetPath) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
}

function unzipTemplate(source, destination) {
  execFileSync('unzip', ['-q', source, '-d', destination], { stdio: 'inherit' });
}

function zipWorkbook(sourceDir, outputPath) {
  const absoluteOutput = path.resolve(outputPath);
  if (fs.existsSync(absoluteOutput)) {
    fs.unlinkSync(absoluteOutput);
  }
  execFileSync('zip', ['-qr', absoluteOutput, '.'], { cwd: sourceDir, stdio: 'inherit' });
}

function applyTemplateData(sheetXml, data) {
  let xml = sheetXml;

  const [issueYear, issueMonth, issueDay] = splitDate(data.issueDate);
  xml = setCellValue(xml, 'AA3', issueYear, 'number');
  xml = setCellValue(xml, 'AF3', issueMonth, 'number');
  xml = setCellValue(xml, 'AI3', issueDay, 'number');

  Object.values(INDUSTRY_CHECKBOX_MAP).forEach((ref) => {
    xml = setCheckbox(xml, ref, ref === INDUSTRY_CHECKBOX_MAP[data.employerIndustry]);
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

  Object.values(EMPLOYMENT_TYPE_CHECKBOX_MAP).forEach((ref) => {
    xml = setCheckbox(xml, ref, ref === EMPLOYMENT_TYPE_CHECKBOX_MAP[data.employmentType]);
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

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    usage();
    return;
  }

  const inputPath = args[0];
  const outputPath = args[1] ? path.resolve(args[1]) : DEFAULT_OUTPUT_PATH;
  const data = loadInputData(inputPath);

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'employment-certificate-poc-'));
  const extractedDir = path.join(tempDir, 'workbook');

  try {
    ensureDir(outputPath);
    unzipTemplate(TEMPLATE_PATH, extractedDir);

    const sheetPath = path.join(extractedDir, 'xl', 'worksheets', 'sheet1.xml');
    const originalXml = fs.readFileSync(sheetPath, 'utf8');
    const updatedXml = applyTemplateData(originalXml, data);
    fs.writeFileSync(sheetPath, updatedXml, 'utf8');

    zipWorkbook(extractedDir, outputPath);

    console.log(`Rendered workbook: ${outputPath}`);
    console.log(
      'Filled fields: issueDate, employer info, parent/workplace, hireDate, employmentType, schedule section, remarks'
    );
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

main();
