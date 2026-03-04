# Web Test Report 2026-03-04 (Employment Fixed Schedule)

## Summary

- Target: `http://localhost:8081`
- Flow: `/application/employment/new` -> `/application/employment/preview/draft`
- Scenario: `固定就労` 入力で「入力済みExcelをダウンロード」
- Result: PASS

## Input Values (Step 3 Fixed Schedule)

- `scheduleType`: `fixed` (`固定就労`)
- `monthlyWorkDays`: `21`
- `weeklyWorkDays`: `5`
- `fixedWorkStartTime`: `08:15`
- `fixedWorkEndTime`: `17:45`
- `fixedBreakMinutes`: `60`

## Evidence

- Screenshot:
  - `artifacts/screenshots/employment-preview-fixed-download.png`
- Downloaded workbook copy:
  - `artifacts/employment_certificate_fixed_e2e_20260304.xlsx`
- Browser console:
  - Error: `0`
  - Warning: `3` (既存のスタイル系 warning)

## Cell Verification

Validation command:

```bash
node scripts/assert-xlsx-cells.js artifacts/employment_certificate_fixed_e2e_20260304.xlsx \
  'M31=□' 'P31=□' 'M32=□' 'P32=□' \
  K28=8 N28=15 T28=17 W28=45 AC28=60 Q27=21 AC27=5
```

Verification target:

- `M31` = `□`
- `P31` = `□`
- `M32` = `□`
- `P32` = `□`
- `K28` = `8`
- `N28` = `15`
- `T28` = `17`
- `W28` = `45`
- `AC28` = `60`
- `Q27` = `21`
- `AC27` = `5`

All assertions passed: `11/11`.
