export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json({
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anon_key_exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    anon_key_prefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30),
    service_key_exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    service_key_prefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 30),
    keys_are_equal: process.env.SUPABASE_SERVICE_ROLE_KEY === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    node_env: process.env.NODE_ENV,
  })
}
