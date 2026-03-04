# Web Test Report 2026-03-05 (Toyama Reservation Flow)

## Summary

- Target: `http://localhost:8081`
- Account: real signed-in parent account
- Scenario: reserve from Toyama facility detail (`/facility/300`)
- Result: PASS

## Preconditions

- `facilities_district_check` was updated to allow Toyama district IDs
- App is connected to Supabase project `madqxcfqakkoskzqydwr`

## Steps

1. Open `/facility/300` (`富山市中央保育所`)
2. Click `予約する`
3. Input reservation data and proceed to confirmation
4. Click `予約を送信`
5. Open `/profile` and confirm reservation row is shown

## Evidence

- Screenshot:
  - `artifacts/screenshots/reservation-toyama-success-20260305.png`
- Network requests:
  - `POST /rest/v1/facilities` => `201`
  - `POST /rest/v1/reservations` => `201`

## Verification Point

- Profile reservation list includes:
  - Facility: `富山市中央保育所`
  - Date/Time: `2026-03-06 09:00 - 12:00`
  - Child/type row is rendered under the reservation card

## Notes

- Browser console had no error-level logs during this flow
- Existing warning logs (style deprecation etc.) remain unrelated to reservation create success
