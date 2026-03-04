#!/usr/bin/env node
/* eslint-env node */
/* global __dirname, Buffer */

const fs = require('fs');
const path = require('path');
const { renderEmploymentTemplate } = require('../utils/employmentExcelCore.js');

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

function arrayBufferToBuffer(value) {
  return Buffer.from(new Uint8Array(value));
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

  const templateBuffer = fs.readFileSync(TEMPLATE_PATH);
  const rendered = renderEmploymentTemplate(templateBuffer, data);

  ensureDir(outputPath);
  fs.writeFileSync(outputPath, arrayBufferToBuffer(rendered));

  console.log(`Rendered workbook: ${outputPath}`);
  console.log(
    'Filled fields: issueDate, employer info, parent/workplace, hireDate, employmentType, schedule section, remarks'
  );
}

main();
