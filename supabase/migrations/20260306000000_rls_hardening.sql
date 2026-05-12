/*
  # RLS hardening

  1. facilities INSERT: force status = 'pending_approval' so clients cannot
     create already-active facilities.
  2. facility_reviews UPDATE by facility admins: restrict to response columns
     only, preventing review text/rating tampering.
  3. notifications: split FOR ALL into granular policies so users cannot
     fabricate notifications for themselves via the client.
*/

-- ============================================================================
-- 1. Facilities: enforce pending_approval on INSERT
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can create facilities" ON facilities;

CREATE POLICY "Authenticated users can create facilities"
  ON facilities FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND status = 'pending_approval'
  );

-- ============================================================================
-- 2. Facility reviews: restrict admin UPDATE to response columns
-- ============================================================================

DROP POLICY IF EXISTS "Facility owners can respond to reviews" ON facility_reviews;

CREATE POLICY "Facility admins can respond to reviews"
  ON facility_reviews FOR UPDATE
  TO authenticated
  USING (public.is_facility_admin(facility_id))
  WITH CHECK (public.is_facility_admin(facility_id));

-- Prevent facility admins from tampering with review content.
-- Only facility_response and responded_at may change; rating, comment, user_id
-- must stay the same.
CREATE OR REPLACE FUNCTION protect_review_content()
RETURNS TRIGGER AS $$
BEGIN
  -- If the updater is not the review author, block changes to core fields
  IF NEW.user_id <> auth.uid() THEN
    NEW.rating := OLD.rating;
    NEW.comment := OLD.comment;
    NEW.user_id := OLD.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

DROP TRIGGER IF EXISTS protect_review_content_trigger ON facility_reviews;
CREATE TRIGGER protect_review_content_trigger
  BEFORE UPDATE ON facility_reviews
  FOR EACH ROW
  EXECUTE FUNCTION protect_review_content();

-- ============================================================================
-- 3. Notifications: replace FOR ALL with granular policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage their notifications" ON notifications;

-- Users can read their own notifications
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can mark their notifications as read
CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only service role (Edge Functions / server) can INSERT notifications.
-- No client-side INSERT policy is created intentionally.
