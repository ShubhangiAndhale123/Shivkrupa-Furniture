import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'

// Standard CORS headers for Supabase Edge Functions
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Generate a random temporary password if none is provided
function generateSecurePassword(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let result = 'Sk@'
  for (let i = 3; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

serve(async (req: Request) => {
  // 1. Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Only POST is accepted.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // 2. Read environment configuration
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('[admin-add-user] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
      return new Response(
        JSON.stringify({
          error: 'Edge Function environment misconfigured: missing service role credentials.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Authenticate the caller using their Authorization Bearer token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is required.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim()
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Valid Bearer token is required.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Client to verify the calling user's identity
    const supabaseCallerClient = createClient(supabaseUrl, supabaseAnonKey || supabaseServiceRoleKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    })

    const { data: callerData, error: callerAuthError } = await supabaseCallerClient.auth.getUser(token)
    if (callerAuthError || !callerData?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid or expired access token.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const callerId = callerData.user.id

    // 4. Create trusted service-role client for administrative database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // 5. Verify the caller has the 'admin' role in public.profiles
    const { data: callerProfile, error: callerProfileError } = await supabaseAdmin
      .from('profiles')
      .select('id, role, full_name, email')
      .eq('id', callerId)
      .maybeSingle()

    if (callerProfileError) {
      console.error('[admin-add-user] Caller profile query error:', callerProfileError)
      return new Response(
        JSON.stringify({ error: 'Failed to verify caller permissions.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!callerProfile || callerProfile.role !== 'admin') {
      return new Response(
        JSON.stringify({
          error: 'Access denied: Only system administrators are authorized to add or invite users.',
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 6. Parse and validate request payload
    let body: any = {}
    try {
      body = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ error: 'Malformed JSON payload.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const {
      fullName,
      email,
      role,
      department,
      mobile,
      password,
      sendInvite = false,
      redirectTo,
    } = body

    // Validation A: Full Name
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Full name is required and must be at least 2 characters.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validation B: Email format
    const cleanEmail = String(email || '').trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return new Response(
        JSON.stringify({ error: 'A valid email address is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validation C: Strict Role Assignment
    // SECURITY: Only 'staff' or 'production' are allowed.
    // 'admin' or 'customer' creation through this endpoint is strictly disallowed.
    const cleanRole = String(role || '').trim().toLowerCase()
    if (!['staff', 'production'].includes(cleanRole)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid role selection. Only "staff" and "production" accounts can be created.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validation D: Password validation if provided
    if (password && typeof password === 'string' && password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters long.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const cleanFullName = fullName.trim()
    const cleanDepartment = department ? String(department).trim() : null
    const cleanMobile = mobile ? String(mobile).trim() : null

    // 7. Check for duplicate user email in public.profiles
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role, full_name')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (existingProfile) {
      return new Response(
        JSON.stringify({
          error: `An account with email "${cleanEmail}" already exists (Role: ${existingProfile.role}). Please use a different email address.`,
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 8. Provision auth account using Supabase Auth Admin API
    let createdAuthUser: any = null
    let temporaryPasswordUsed: string | null = null

    if (sendInvite) {
      // Option A: Send email invitation link with redirectTo
      const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:3000'
      const destinationUrl = redirectTo || `${siteUrl}/login`

      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        cleanEmail,
        {
          data: {
            full_name: cleanFullName,
            role: cleanRole,
            department: cleanDepartment,
            mobile: cleanMobile,
          },
          redirectTo: destinationUrl,
        }
      )

      if (inviteError) {
        console.error('[admin-add-user] Supabase invite error:', inviteError)
        return new Response(
          JSON.stringify({ error: `Failed to invite user: ${inviteError.message}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      createdAuthUser = inviteData.user
    } else {
      // Option B: Create account with active email confirmation & password
      const chosenPassword = (password && password.trim()) || generateSecurePassword(12)
      temporaryPasswordUsed = chosenPassword

      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: chosenPassword,
        email_confirm: true, // Mark confirmed so user can log in immediately
        user_metadata: {
          full_name: cleanFullName,
          role: cleanRole,
          department: cleanDepartment,
          mobile: cleanMobile,
        },
      })

      if (createError) {
        console.error('[admin-add-user] Supabase createUser error:', createError)
        if (createError.message.toLowerCase().includes('already registered')) {
          return new Response(
            JSON.stringify({ error: `An account with email "${cleanEmail}" is already registered.` }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        return new Response(
          JSON.stringify({ error: `Failed to create user: ${createError.message}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      createdAuthUser = createData.user
    }

    if (!createdAuthUser?.id) {
      return new Response(
        JSON.stringify({ error: 'Auth service did not return a valid user record.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 9. Synchronize & assign the role securely in public.profiles
    // Note: handle_new_user trigger defaults public registration to customer,
    // so we explicitly update the profile to the authorized role (staff or production)
    const { error: profileSyncError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: createdAuthUser.id,
        email: cleanEmail,
        full_name: cleanFullName,
        role: cleanRole,
        department: cleanDepartment,
        mobile: cleanMobile,
        updated_at: new Date().toISOString(),
      })

    if (profileSyncError) {
      console.warn('[admin-add-user] Direct profile upsert note:', profileSyncError.message)
      // Attempt RPC fallback as secondary assurance
      await supabaseAdmin.rpc('admin_provision_user_profile', {
        target_user_id: createdAuthUser.id,
        new_role: cleanRole,
        new_full_name: cleanFullName,
        new_email: cleanEmail,
        new_department: cleanDepartment,
        new_mobile: cleanMobile,
      })
    }

    // 10. Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: sendInvite
          ? `Invitation sent successfully to ${cleanEmail}. The user will receive an email to complete setup.`
          : `User ${cleanFullName} (${cleanRole}) created successfully. They can now log in at /login.`,
        user: {
          id: createdAuthUser.id,
          fullName: cleanFullName,
          email: cleanEmail,
          role: cleanRole,
          department: cleanDepartment,
          mobile: cleanMobile,
          inviteSent: Boolean(sendInvite),
          temporaryPassword: temporaryPasswordUsed,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    console.error('[admin-add-user] Unexpected server error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'An unexpected error occurred while processing the request.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
