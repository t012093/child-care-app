#!/usr/bin/env node
/* eslint-env node */
/* global __dirname */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const RENDER_SCRIPT = path.resolve(__dirname, 'render-employment-certificate-poc.js');
const ASSERT_SCRIPT = path.resolve(__dirname, 'assert-xlsx-cells.js');
const KEEP_ARTIFACTS = process.env.KEEP_EXCEL_TEST_ARTIFACTS === '1';

function runNode(scriptPath, args) {
  execFileSync(process.execPath, [scriptPath, ...args], {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  });
}

function testFixedSchedule(outputPath) {
  const inputPath = path.resolve(ROOT_DIR, 'docs/examples/employment_fixed_input.json');

  runNode(RENDER_SCRIPT, [inputPath, outputPath]);
  runNode(ASSERT_SCRIPT, [
    outputPath,
    'M31=□',
    'P31=□',
    'M32=□',
    'P32=□',
    'K28=8',
    'N28=15',
    'T28=17',
    'W28=45',
    'AC28=60',
    'Q27=21',
    'AC27=5',
  ]);
}

function testVariableSchedule(outputPath) {
  const inputPath = path.resolve(ROOT_DIR, 'docs/examples/employment_variable_input.json');

  runNode(RENDER_SCRIPT, [inputPath, outputPath]);
  runNode(ASSERT_SCRIPT, [
    outputPath,
    'M31=☑',
    'P31=□',
    'M32=□',
    'P32=☑',
    'S31=160',
    'W31=30',
    'S32=5',
    'M33=8',
    'P33=30',
    'T33=17',
    'W33=15',
    'AC33=45',
    'Q27=20',
    'AC27=5',
  ]);
}

function main() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'employment-excel-tests-'));
  const fixedOutput = path.join(tempDir, 'employment_certificate_test_fixed.xlsx');
  const variableOutput = path.join(tempDir, 'employment_certificate_test_variable.xlsx');

  try {
    console.log('[test:excel] Running fixed schedule checks...');
    testFixedSchedule(fixedOutput);

    console.log('[test:excel] Running variable schedule checks...');
    testVariableSchedule(variableOutput);

    console.log('[test:excel] All Excel checks passed.');
    if (KEEP_ARTIFACTS) {
      console.log(`[test:excel] Kept test artifacts: ${tempDir}`);
    }
  } finally {
    if (!KEEP_ARTIFACTS) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

main();
