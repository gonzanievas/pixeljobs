import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)
const resend = new Resend(process.env.RESEND_API_KEY)

async function getJobs() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/scrape`)
  const data = await res.json()
  return data.jobs || []
}

function matchesPreferences(job, subscriber) {
  const title = (job.title || '').toLowerCase()
  const tags = (job.tags || []).map(t => t.toLowerCase())

  const specialtyMap = {
    uxui: ['ux', 'ui', 'ux/ui', 'product designer', 'figma'],
    branding: ['brand', 'branding', 'identity'],
    motion: ['motion', 'animation', 'after effects'],
    illustration: ['illustration', 'illustrator'],
    product: ['product designer', 'product design'],
    '3d': ['3d', 'blender', 'cinema 4d'],
  }

  const specialties = subscriber.specialties || []
  const matches = specialties.some(spec => {
    const keywords = specialtyMap[spec] || [spec]
    return keywords.some(k => title.includes(k) || tags.includes(k))
  })

  return matches
}

function buildEmailHtml(jobs, subscriber) {
  const jobsHtml = jobs.slice(0, 8).map(job => `
    <tr>
      <td style="padding:20px 0;border-bottom:1px solid #1a1a1a;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <p style="margin:0 0 4px;font-size:11px;color:#555;letter-spacing:0.08em;">${job.source.toUpperCase()}</p>
              <h2 style="margin:0 0 6px;font-size:18px;font-weight:600;color:#ffffff;">${job.title}</h2>
              <p style="margin:0 0 12px;font-size:14px;color:#888;">${job.company}</p>
              <a href="${job.url}" style="display:inline-block;background:#c8ff00;color:#0a0a0a;font-size:13px;font-weight:600;padding:8px 16px;border-radius:8px;text-decoration:none;">Ver oferta →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

              <!-- Logo -->
              <tr>
                <td style="padding-bottom:32px;">
                  <span style="font-family:monospace;font-size:14px;font-weight:600;color:#c8ff00;letter-spacing:0.1em;">✦ PIXEL JOBS</span>
                </td>
              </tr>

              <!-- Título -->
              <tr>
                <td style="padding-bottom:8px;">
                  <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">
                    ${jobs.length} ofertas nuevas 🎨
                  </h1>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom:32px;">
                  <p style="margin:0;font-size:15px;color:#666;">Curadas para tu perfil · ${new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </td>
              </tr>

              <!-- Ofertas -->
              <tr>
                <td>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${jobsHtml}
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding-top:32px;border-top:1px solid #1a1a1a;margin-top:32px;">
                  <p style="margin:0;font-size:12px;color:#444;line-height:1.6;">
                    Recibiste este mail porque te suscribiste en PORFO.vercel.app<br/>
                    Si no querés recibir más mails, ignorá este mensaje.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('*')

    if (error) throw error
    if (!subscribers || subscribers.length === 0) {
      return Response.json({ ok: true, message: 'No hay suscriptores' })
    }

    const allJobs = await getJobs()
    if (allJobs.length === 0) {
      return Response.json({ ok: true, message: 'No hay ofertas nuevas' })
    }

    let sent = 0
    for (const subscriber of subscribers) {
      const matchedJobs = allJobs.filter(job => matchesPreferences(job, subscriber))
      if (matchedJobs.length === 0) continue

      await resend.emails.send({
        from: 'Pixel Jobs <onboarding@resend.dev>',
        to: subscriber.email,
        subject: `${matchedJobs.length} ofertas de diseño para vos 🎨`,
        html: buildEmailHtml(matchedJobs, subscriber),
      })
      sent++
    }

    return Response.json({ ok: true, sent, total: subscribers.length })

  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Error enviando digest' }, { status: 500 })
  }
}