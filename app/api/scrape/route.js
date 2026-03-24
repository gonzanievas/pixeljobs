import axios from 'axios'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const DESIGN_KEYWORDS = [
  'designer', 'design', 'ux', 'ui', 'ux/ui', 'figma',
  'branding', 'motion', 'illustration', 'graphic', 'visual',
  'product designer', 'web designer', 'creative', 'art director',
  'brand', 'identity', 'animation', 'typograph'
]

function isDesignJob(title) {
  const lower = title.toLowerCase()
  return DESIGN_KEYWORDS.some(k => lower.includes(k))
}

async function analyzeJobWithAI(job) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

    const prompt = `Sos un experto en reclutamiento para el mundo del diseño gráfico y UX/UI. 
Analizá esta oferta de trabajo y respondé SOLO con un JSON válido, sin texto adicional, sin backticks:

Título: ${job.title}
Empresa: ${job.company}
Fuente: ${job.source}

Respondé con este formato exacto:
{
  "que_buscan": "1-2 oraciones sobre qué busca realmente esta empresa en el candidato",
  "como_destacar": "1-2 oraciones concretas sobre cómo destacar la aplicación",
  "nivel": "junior | mid | senior | no especificado",
  "stack": "herramientas mencionadas o probables como Figma Adobe etc",
  "tip": "1 consejo corto y concreto para aplicar a esta oferta"
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const clean = text.replace(/```json|```/g, '').trim()
    const json = JSON.parse(clean)
    return json
  } catch (err) {
    console.error('AI analysis error:', err.message)
    return null
  }
}

async function scrapeRemoteOK() {
  try {
    const res = await axios.get('https://remoteok.com/api', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000,
    })
    const jobs = res.data.filter(j => j.position && isDesignJob(j.position))
    return jobs.slice(0, 10).map(j => ({
      title: j.position,
      company: j.company,
      url: `https://remoteok.com/remote-jobs/${j.slug}`,
      source: 'RemoteOK',
      tags: j.tags || [],
      date: j.date,
    }))
  } catch (err) {
    console.error('RemoteOK error:', err.message)
    return []
  }
}

async function scrapeWeWorkRemotely() {
  try {
    const res = await axios.get(
      'https://weworkremotely.com/categories/remote-design-jobs.rss',
      { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 }
    )
    const xml = res.data
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || []
    return items.slice(0, 10).map(item => {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || ''
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const company = title.split(' at ')?.[1] || ''
      const position = title.split(' at ')?.[0] || title
      return {
        title: position.trim(),
        company: company.trim(),
        url: link,
        source: 'WeWorkRemotely',
        tags: ['design'],
        date: new Date().toISOString(),
      }
    }).filter(j => j.title)
  } catch (err) {
    console.error('WeWorkRemotely error:', err.message)
    return []
  }
}

async function scrapeDribbble() {
  try {
    const res = await axios.get(
      'https://dribbble.com/jobs.rss',
      { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 }
    )
    const xml = res.data
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || []
    return items.slice(0, 10).map(item => {
      const title = item.match(/<title>(.*?)<\/title>/)?.[1] || ''
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const desc = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/s)?.[1] || ''
      const company = desc.match(/<strong>(.*?)<\/strong>/)?.[1] || ''
      return {
        title: title.replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
        company: company.trim(),
        url: link.trim(),
        source: 'Dribbble',
        tags: ['design'],
        date: new Date().toISOString(),
      }
    }).filter(j => j.title && isDesignJob(j.title))
  } catch (err) {
    console.error('Dribbble error:', err.message)
    return []
  }
}

export async function GET() {
  try {
    const [remoteOK, wwr, dribbble] = await Promise.all([
      scrapeRemoteOK(),
      scrapeWeWorkRemotely(),
      scrapeDribbble(),
    ])

    const allJobs = [...remoteOK, ...wwr, ...dribbble]

    // Analizar las primeras 5 ofertas con IA
    const jobsWithAI = await Promise.all(
      allJobs.slice(0, 5).map(async job => {
        const analysis = await analyzeJobWithAI(job)
        return { ...job, ai: analysis }
      })
    )

    const restJobs = allJobs.slice(5).map(job => ({ ...job, ai: null }))
    const finalJobs = [...jobsWithAI, ...restJobs]

    return Response.json({
      ok: true,
      count: finalJobs.length,
      sources: {
        remoteOK: remoteOK.length,
        weWorkRemotely: wwr.length,
        dribbble: dribbble.length,
      },
      jobs: finalJobs,
    })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Error scraping jobs' }, { status: 500 })
  }
}