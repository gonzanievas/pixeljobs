import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function GET() {
  try {
    const { count, error } = await supabase
      .from('subscribers')
      .select('*', { count: 'exact', head: true })

    if (error) throw error

    return Response.json({ count: count || 0 })

  } catch (err) {
    console.error(err)
    return Response.json({ count: 0 })
  }
}