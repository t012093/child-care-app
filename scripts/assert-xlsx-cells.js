#!/usr/bin/env node

const path = require('path');
const XLSX = require('xlsx');

function usage() {
  console.log(
    [
      'Usage:',
      '  node scripts/assert-xlsx-cells.js <file.xlsx> <CELL=VALUE> [CELL=VALUE ...]',
      '',
      'Examples:',
      '  node scripts/assert-xlsx-cells.js artifacts/sample.xlsx M33=10 P33=30 AC33=75',
      '  node scripts/assert-xlsx-cells.js artifacts/sample.xlsx M31=☑ P31=□',
    ].join('\n')
  );
}

function parseExpected(rawValue) {
  if (/^-?\d+(?:\.\d+)?$/.test(rawValue)) {
    return Number(rawValue);
  }
  return rawValue;
}

function parseChecks(args) {
  return args.map((arg) => {
    const separatorIndex = arg.indexOf('=');
    if (separatorIndex <= 0 || separatorIndex === arg.length - 1) {
      throw new Error(`Invalid cell assertion "${arg}". Expected format CELL=VALUE`);
    }
    const cell = arg.slice(0, separatorIndex).toUpperCase();
    const expected = parseExpected(arg.slice(separatorIndex + 1));
    return { cell, expected };
  });
}

function getActualValue(sheet, cell) {
  const target = sheet[cell];
  return target ? target.v : null;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 2 || args.includes('--help') || args.includes('-h')) {
    usage();
    process.exit(args.length < 2 ? 1 : 0);
  }

  const filePath = path.resolve(args[0]);
  const checks = parseChecks(args.slice(1));

  const workbook = XLSX.readFile(filePath, { cellDates: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const results = checks.map(({ cell, expected }) => {
    const actual = getActualValue(sheet, cell);
    return {
      cell,
      expected,
      actual,
      pass: actual === expected,
    };
  });

  console.table(results);

  const failed = results.filter((result) => !result.pass);
  if (failed.length > 0) {
    console.error(`Cell assertion failed: ${failed.length}/${results.length}`);
    process.exit(1);
  }

  console.log(`All assertions passed: ${results.length}/${results.length}`);
}

main();
