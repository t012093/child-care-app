# Web Test Report 2026-03-04 (Employment Variable Schedule)

## Summary

- Target: `http://localhost:8081`
- Flow: `/application/employment/new` -> `/application/employment/preview/draft`
- Scenario: `変則就労` 入力で「入力済みExcelをダウンロード」
- Result: PASS

## Input Values (Step 3 Variable Schedule)

- `scheduleType`: `variable` (`変則就労`)
- `monthlyWorkDays`: `22`
- `weeklyWorkDays`: `5`
- `variableWorkDays`: `18`
- `variableWorkHours`: `150`
- `variableWorkStartTime`: `10:30`
- `variableWorkEndTime`: `19:45`
- `variableBreakMinutes`: `75`

## Evidence

- Screenshot:
  - `artifacts/screenshots/employment-preview-variable-download.png`
- Downloaded workbook copy:
  - `artifacts/employment_certificate_variable_e2e_20260304.xlsx`
- Browser console:
  - Error: `0`
  - Warning: `3` (既存のスタイル系 warning)

## Cell Verification

Validation command:

```bash
node scripts/assert-xlsx-cells.js artifacts/employment_certificate_variable_e2e_20260304.xlsx \
  'M31=☑' 'P31=□' 'M32=☑' 'P32=□' \
  S31=150 W31=0 S32=18 M33=10 P33=30 T33=19 W33=45 AC33=75
```

Verification target:

- `M31` = `☑`
- `P31` = `□`
- `M32` = `☑`
- `P32` = `□`
- `S31` = `150`
- `W31` = `0`
- `S32` = `18`
- `M33` = `10`
- `P33` = `30`
- `T33` = `19`
- `W33` = `45`
- `AC33` = `75`

All assertions passed: `12/12`.
