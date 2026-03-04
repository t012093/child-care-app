/*
  # Fix facility_staff RLS recursion

  `facility_staff` を自己参照する RLS ポリシーが原因で、
  `children` / `reservations` の SELECT 時に無限再帰が発生していました。
  施設所属判定は SECURITY DEFINER 関数へ寄せ、ポリシー内の自己参照を解消します。
*/

CREATE OR REPLACE FUNCTION public.is_facility_owner(target_facility_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.facilities
    WHERE id = target_facility_id
      AND owner_user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_facility_admin(target_facility_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.facility_staff
    WHERE facility_id = target_facility_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND COALESCE(status, 'active') = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_facility_staff_member(target_facility_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.facility_staff
    WHERE facility_id = target_facility_id
      AND user_id = auth.uid()
      AND COALESCE(status, 'active') = 'active'
  );
$$;

DROP POLICY IF EXISTS "Staff can view their own record" ON facility_staff;
DROP POLICY IF EXISTS "Facility admins can view facility staff" ON facility_staff;
DROP POLICY IF EXISTS "Facility owners can insert staff" ON facility_staff;
DROP POLICY IF EXISTS "Facility owners can update staff" ON facility_staff;
DROP POLICY IF EXISTS "Facility owners can delete staff" ON facility_staff;

CREATE POLICY "Facility staff can view facility staff"
  ON facility_staff FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_facility_admin(facility_id)
  );

CREATE POLICY "Facility owners can insert staff"
  ON facility_staff FOR INSERT
  TO authenticated
  WITH CHECK (public.is_facility_owner(facility_id));

CREATE POLICY "Facility owners can update staff"
  ON facility_staff FOR UPDATE
  TO authenticated
  USING (public.is_facility_owner(facility_id))
  WITH CHECK (public.is_facility_owner(facility_id));

CREATE POLICY "Facility owners can delete staff"
  ON facility_staff FOR DELETE
  TO authenticated
  USING (public.is_facility_owner(facility_id));

DROP POLICY IF EXISTS "Facility staff can view facility reservations" ON reservations;
DROP POLICY IF EXISTS "Facility staff can update facility reservations" ON reservations;

CREATE POLICY "Facility staff can view facility reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (public.is_facility_staff_member(facility_id));

CREATE POLICY "Facility staff can update facility reservations"
  ON reservations FOR UPDATE
  TO authenticated
  USING (public.is_facility_staff_member(facility_id))
  WITH CHECK (public.is_facility_staff_member(facility_id));

DROP POLICY IF EXISTS "Facility staff can view children with reservations" ON children;

CREATE POLICY "Facility staff can view children with reservations"
  ON children FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.reservations
      WHERE child_id = children.id
        AND public.is_facility_staff_member(facility_id)
    )
  );

DROP POLICY IF EXISTS "Facility owners can respond to reviews" ON facility_reviews;

CREATE POLICY "Facility owners can respond to reviews"
  ON facility_reviews FOR UPDATE
  TO authenticated
  USING (public.is_facility_admin(facility_id))
  WITH CHECK (public.is_facility_admin(facility_id));

DROP POLICY IF EXISTS "Facility staff can manage availability" ON facility_availability;

CREATE POLICY "Facility staff can manage availability"
  ON facility_availability FOR ALL
  TO authenticated
  USING (public.is_facility_staff_member(facility_id))
  WITH CHECK (public.is_facility_staff_member(facility_id));
