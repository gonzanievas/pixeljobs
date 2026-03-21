import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, specialties, modality, language, frequency, seniority } = body

    if (!email || !specialties || !modality || !language) {
      return Response.json(
        { error: 'Faltan campos requeridos.' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('subscribers')
      .insert([{ email, specialties, modality, language, frequency, seniority: seniority || 'all' }])

    if (error) {
      if (error.code === '23505') {
        return Response.json(
          { error: 'Este email ya está suscripto.' },
          { status: 409 }
        )
      }
      throw error
    }

    const specialtyLabels = {
      uxui: 'UX / UI',
      branding: 'Branding',
      motion: 'Motion',
      illustration: 'Ilustración',
      product: 'Product Design',
      '3d': '3D',
    }

    const specialtiesText = specialties
      .map(s => specialtyLabels[s] || s)
      .join(', ')

    await resend.emails.send({
      from: 'Pixel Jobs <onboarding@resend.dev>',
      to: email,
      subject: '¡Ya estás dentro de PORFO! 🎨',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="margin:0;padding:0;background:#0a0a0a;font-family:'DM Sans',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
                  
                  <!-- Logo -->
                  <tr>
                    <td style="padding-bottom:32px;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background:#c8ff00;border-radius:8px;width:32px;height:32px;text-align:center;vertical-align:middle;">
                            <span style="font-size:16px;">✦</span>
                          </td>
                          <td style="padding-left:10px;">
                            <span style="font-family:monospace;font-size:14px;font-weight:600;color:#ffffff;letter-spacing:0.1em;">PIXEL JOBS</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Título -->
                  <tr>
                    <td style="padding-bottom:16px;">
                      <h1 style="margin:0;font-size:32px;font-weight:700;color:#ffffff;line-height:1.2;">
                        Bienvenido/a a<br/>
                        <span style="color:#c8ff00;">Pixel Jobs</span> 🎨
                      </h1>
                    </td>
                  </tr>

                  <!-- Subtítulo -->
                  <tr>
                    <td style="padding-bottom:32px;">
                      <p style="margin:0;font-size:16px;color:#888;line-height:1.6;">
                        Ya estás suscripto/a. A partir de ahora te vamos a mandar las mejores ofertas de diseño filtradas especialmente para vos.
                      </p>
                    </td>
                  </tr>

                  <!-- Preferencias -->
                  <tr>
                    <td style="padding-bottom:32px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #222;border-radius:12px;padding:24px;">
                        <tr>
                          <td style="padding-bottom:16px;">
                            <p style="margin:0;font-size:11px;color:#555;letter-spacing:0.1em;">TUS PREFERENCIAS</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom:10px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="font-size:13px;color:#666;">Especialidad</td>
                                <td align="right" style="font-size:13px;color:#fff;">${specialtiesText}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom:10px;border-top:1px solid #1a1a1a;padding-top:10px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="font-size:13px;color:#666;">Modalidad</td>
                                <td align="right" style="font-size:13px;color:#fff;text-transform:capitalize;">${modality}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="border-top:1px solid #1a1a1a;padding-top:10px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="font-size:13px;color:#666;">Frecuencia</td>
                                <td align="right" style="font-size:13px;color:#fff;text-transform:capitalize;">${frequency === 'daily' ? 'Diario' : 'Semanal'}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- CTA -->
                  <tr>
                    <td style="padding-bottom:40px;">
                      <p style="margin:0;font-size:15px;color:#888;line-height:1.6;">
                        Vas a recibir tu primer digest de ofertas pronto. Mientras tanto, si querés cambiar tus preferencias o darte de baja, podés hacerlo desde el sitio.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="border-top:1px solid #1a1a1a;padding-top:24px;">
                      <p style="margin:0;font-size:12px;color:#444;line-height:1.6;">
                        Recibiste este mail porque te suscribiste en PORFO.vercel.app<br/>
                        Si no fuiste vos, ignorá este mensaje.<br/>
<a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=" || ''}" style="color:#555;">Darme de baja</a>
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    return Response.json({ ok: true }, { status: 200 })

  } catch (err) {
    console.error(err)
    return Response.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}