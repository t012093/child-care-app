# Web Test Report 2026-03-03

## Summary

- Test target: Expo Web app running at `http://localhost:8081`
- Test date: 2026-03-03
- Test method: manual route verification with Playwright
- Result: app boots and major parent-side screens render

## Later Fixes

- 2026-03-04 に以下を修正済みです
- Google Maps API キー未設定時は、エラーオーバーレイではなくフォールバック案内を表示するよう変更
- ゲストユーザー時はプロフィール画面で予約取得を呼ばないよう変更

## Environment Notes

- Expo loaded `.env.local`
- `EXPO_PUBLIC_SUPABASE_URL` was set
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` was set
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` was not present in `.env.local`

## Screens Verified

1. Onboarding features screen
   - Route: `/features`
   - Screenshot: `artifacts/screenshots/2026-03-03/onboarding-features.png`

2. Login screen
   - Route: `/login`
   - Screenshot: `artifacts/screenshots/2026-03-03/login-screen.png`

3. Parent registration screen
   - Route: `/register`
   - Screenshot: `artifacts/screenshots/2026-03-03/register-screen.png`

4. Home screen after guest login
   - Route: `/`
   - Screenshot: `artifacts/screenshots/2026-03-03/home-screen.png`

5. Facility search screen
   - Route: `/reserve`
   - Screenshot: `artifacts/screenshots/2026-03-03/reserve-screen.png`
   - Console log: `artifacts/screenshots/2026-03-03/console-reserve-errors.log`

6. Facility detail screen
   - Route: `/facility/1`
   - Screenshot: `artifacts/screenshots/2026-03-03/facility-detail-screen.png`

7. Profile screen
   - Route: `/profile`
   - Screenshot: `artifacts/screenshots/2026-03-03/profile-screen.png`
   - Console log: `artifacts/screenshots/2026-03-03/console-profile-errors.log`

8. Reservation create screen
   - Route: `/reservation/new?facilityId=1`
   - Screenshot: `artifacts/screenshots/2026-03-03/reservation-create-screen.png`

## What Worked

- Onboarding flow advanced from feature introduction to terms and then login
- Login screen rendered correctly
- Registration screen rendered correctly with email verification inputs
- Guest login worked and navigated into the main app
- Home screen rendered with facility search, notifications, and content sections
- Facility search list rendered and facility detail pages opened
- Reservation creation form rendered with child selection, date, time, and type controls
- Profile screen rendered guest user data and child cards

## Observed Issues

### 1. Google Maps error on search and facility detail

- The facility search screen and facility detail screen showed a Google Maps API error overlay
- Likely cause: missing `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env.local`
- User-visible impact:
  - `/reserve` shows `This page can't load Google Maps correctly`
  - `/facility/1` also shows a degraded map state

### 2. Guest profile triggers reservation fetch error

- On `/profile`, the screen rendered successfully, but the console logged a reservations fetch failure
- Observed error:
  - Supabase request used `user_id=eq.demo-user`
  - PostgREST returned `invalid input syntax for type uuid`
- User-visible impact:
  - Reservation section falls back to `まだ予約はありません`
  - Console contains avoidable errors in guest mode

## Notes On Reservation Submission

- The reservation creation screen and confirmation step rendered correctly in guest mode
- Final successful submission was not confirmed in this test
- Based on the current code, guest reservation submission is expected to be blocked because guest user IDs are not UUIDs

## Recommended Next Fixes

1. Add `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` to local env for web verification
2. Skip `fetchParentReservations` when the current user is the demo guest account
3. Re-run the same web check with a real parent account to verify:
   - login
   - reservation creation
   - profile reservation list
