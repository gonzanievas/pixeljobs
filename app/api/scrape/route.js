import axios from 'axios'

const DESIGN_KEYWORDS = [
  'designer', 'design', 'ux', 'ui', 'ux/ui', 'figma',
  'branding', 'motion', 'illustration', 'graphic', 'visual',
  'product designer', 'web designer', 'creative'
]

function isDesignJob(title) {
  const lower = title.toLowerCase()
  return DESIGN_KEYWORDS.some(k => lower.includes(k))
}

async function scrapeRemoteOK() {
  try {
    const res = await axios.get('https://remoteok.com/api', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000,
    })
    const jobs = res.data.filter(j => j.position && isDesignJob(j.position))
    return jobs.slice(0, 20).map(j => ({
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
    return items.slice(0, 20).map(item => {
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

export async function GET() {
  try {
    const [remoteOK, wwr] = await Promise.all([
      scrapeRemoteOK(),
      scrapeWeWorkRemotely(),
    ])

    const allJobs = [...remoteOK, ...wwr]

    return Response.json({
      ok: true,
      count: allJobs.length,
      jobs: allJobs,
    })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Error scraping jobs' }, { status: 500 })
  }
}