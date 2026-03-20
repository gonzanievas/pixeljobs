import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, specialties, modality, language, frequency } = body

    if (!email || !specialties || !modality || !language) {
      return Response.json(
        { error: 'Faltan campos requeridos.' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('subscribers')
      .insert([{ email, specialties, modality, language, frequency }])

    if (error) {
      if (error.code === '23505') {
        return Response.json(
          { error: 'Este email ya está suscripto.' },
          { status: 409 }
        )
      }
      throw error
    }

    return Response.json({ ok: true }, { status: 200 })

  } catch (err) {
    console.error(err)
    return Response.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}