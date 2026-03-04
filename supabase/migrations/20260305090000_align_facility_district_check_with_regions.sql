/*
  # Align facilities.district constraint with app region master

  The app already uses Toyama district IDs in sample facilities and UI filters.
  This migration expands the DB check constraint so inserts from reservation
  flow (`ensureFacilityRecord`) can persist those district IDs.
*/

ALTER TABLE facilities
DROP CONSTRAINT IF EXISTS facilities_district_check;

ALTER TABLE facilities
ADD CONSTRAINT facilities_district_check
CHECK (
  district IS NULL OR district IN (
    'central',
    'north',
    'east',
    'white-stone',
    'atsubetsu',
    'toyohira',
    'kiyota',
    'south',
    'west',
    'teine',
    'toyama-中央',
    'toyama-東部',
    'toyama-西部',
    'toyama-南部',
    'toyama-北部',
    'toyama-和合',
    'toyama-呉羽',
    'toyama-水橋',
    'toyama-大沢野',
    'toyama-八尾',
    'toyama-婦中',
    'takaoka',
    'uozu',
    'himi',
    'namerikawa',
    'kurobe',
    'tonami',
    'oyabe',
    'nanto',
    'imizu'
  )
);
