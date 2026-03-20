import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return Response.json({ error: 'Token inválido.' }, { status: 400 })
    }

    const { error } = await supabase
      .from('subscribers')
      .delete()
      .eq('token', token)

    if (error) throw error

    return Response.json({ ok: true })

  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Error al darse de baja.' }, { status: 500 })
  }
}