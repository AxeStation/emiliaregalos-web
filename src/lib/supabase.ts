import { createClient } from '@supabase/supabase-js'

// Server-side only — used in Server Components for read-only queries.
// The service_role key is NOT exposed to the client (no NEXT_PUBLIC_ prefix).
export var supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
