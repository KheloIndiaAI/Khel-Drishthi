import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  type: 'stc' | 'region';
  items: Array<{
    id: string;
    name: string;
    state?: string;
  }>;
}

interface CreatedCredential {
  username: string;
  email: string;
  password: string | null;
  name: string;
  state?: string;
  type: 'stc' | 'region';
  centreId?: string;
  regionId?: string;
  success: boolean;
  error?: string;
}

const DOMAIN = '@kheldrishti.local';

/**
 * Generates a unique, cryptographically random password for a single account.
 * The returned value is shown to the admin exactly once in the response; it is
 * never stored and cannot be recovered afterwards. Lost passwords must go
 * through the built-in password reset flow.
 */
function generatePassword(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("") + "!Aa1";
}

function generateUsername(name: string, type: 'stc' | 'region'): string {
  // Remove special characters, spaces, and convert to lowercase
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 30); // Limit length
  
  const prefix = type === 'stc' ? 'stc' : 'rc';
  return `${prefix}${cleanName}`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the caller is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: CreateUserRequest = await req.json();
    const { type, items } = body;

    if (!type || !items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: type and items required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating ${items.length} ${type} users...`);

    const results: CreatedCredential[] = [];

    for (const item of items) {
      const username = generateUsername(item.name, type);
      const email = `${username}${DOMAIN}`;
      // Unique per-user password; surfaced once in the response and never recoverable.
      const password = generatePassword();
      
      console.log(`Creating user: ${username} (${email})`);

      try {
        // Check if user already exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const userExists = existingUsers?.users?.some(u => u.email === email);

        if (userExists) {
          results.push({
            username,
            email,
            password: null,
            name: item.name,
            state: item.state,
            type,
            centreId: type === 'stc' ? item.id : undefined,
            regionId: type === 'region' ? item.id : undefined,
            success: false,
            error: 'User already exists',
          });
          continue;
        }

        // Create user with admin API
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            name: item.name,
            // Must satisfy public.profiles check constraint: profiles_assignment_type_check
            assignment_type: type === 'stc' ? 'centre_incharge' : 'regional_officer',
            requested_centre_id: type === 'stc' ? item.id : undefined,
            requested_region_id: type === 'region' ? item.id : undefined,
          },
        });

        if (createError || !newUser?.user) {
          console.error(`Failed to create user ${email}:`, createError);
          results.push({
            username,
            email,
            password: null,
            name: item.name,
            state: item.state,
            type,
            centreId: type === 'stc' ? item.id : undefined,
            regionId: type === 'region' ? item.id : undefined,
            success: false,
            error: createError?.message || 'Unknown error',
          });
          continue;
        }

        const userId = newUser.user.id;

        // Update user role to editor
        await supabaseAdmin
          .from('user_roles')
          .update({ role: 'editor' })
          .eq('user_id', userId);

        // Create centre or region assignment
        if (type === 'stc') {
          await supabaseAdmin
            .from('user_centre_assignments')
            .insert({
              user_id: userId,
              centre_id: item.id,
              assigned_by: user.id,
              is_active: true,
            });
        } else {
          await supabaseAdmin
            .from('user_region_assignments')
            .insert({
              user_id: userId,
              region_id: item.id,
              access_level: 'view_edit',
              assigned_by: user.id,
              is_active: true,
            });
        }

        results.push({
          username,
          email,
          password,
          name: item.name,
          state: item.state,
          type,
          centreId: type === 'stc' ? item.id : undefined,
          regionId: type === 'region' ? item.id : undefined,
          success: true,
        });

        console.log(`Successfully created user: ${username}`);

      } catch (err) {
        console.error(`Error creating user ${email}:`, err);
        results.push({
          username,
          email,
          password: null,
          name: item.name,
          state: item.state,
          type,
          centreId: type === 'stc' ? item.id : undefined,
          regionId: type === 'region' ? item.id : undefined,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Bulk creation complete: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        created: successCount,
        failed: failCount,
        credentials: results,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Bulk create users error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
