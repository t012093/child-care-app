import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const approvalAdminUserId = Deno.env.get('FACILITY_APPROVAL_ADMIN_USER_ID') || '';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function jsonResponse(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

type Decision = 'approve' | 'reject';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(500, { error: 'Supabase service role settings are missing.' });
  }

  if (!isUuid(approvalAdminUserId)) {
    return jsonResponse(500, { error: 'FACILITY_APPROVAL_ADMIN_USER_ID is not configured.' });
  }

  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    return jsonResponse(401, { error: 'Authorization header is required.' });
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return jsonResponse(401, { error: 'Failed to validate user session.' });
  }

  if (user.id !== approvalAdminUserId) {
    return jsonResponse(403, { error: 'You do not have permission to moderate facilities.' });
  }

  let body: { facilityId?: string; decision?: Decision };

  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body.' });
  }

  const facilityId = typeof body.facilityId === 'string' ? body.facilityId.trim() : '';
  const decision = body.decision;

  if (!isUuid(facilityId)) {
    return jsonResponse(400, { error: 'Valid facilityId is required.' });
  }

  if (decision !== 'approve' && decision !== 'reject') {
    return jsonResponse(400, { error: 'decision must be approve or reject.' });
  }

  const { data: facility, error: facilityError } = await supabaseAdmin
    .from('facilities')
    .select('id, status')
    .eq('id', facilityId)
    .maybeSingle();

  if (facilityError) {
    return jsonResponse(500, { error: facilityError.message || 'Failed to load facility.' });
  }

  if (!facility) {
    return jsonResponse(404, { error: 'Facility not found.' });
  }

  if (facility.status !== 'pending_approval') {
    return jsonResponse(409, { error: 'Facility is already moderated.' });
  }

  const nextStatus = decision === 'approve' ? 'active' : 'inactive';

  const { error: updateError } = await supabaseAdmin
    .from('facilities')
    .update({ status: nextStatus })
    .eq('id', facilityId)
    .eq('status', 'pending_approval');

  if (updateError) {
    return jsonResponse(500, {
      error: updateError.message || 'Failed to update facility status.',
    });
  }

  return jsonResponse(200, {
    success: true,
    facilityId,
    status: nextStatus,
  });
});
