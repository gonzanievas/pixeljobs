import axios from 'axios'

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

async function scrapeDribbble() {
  try {
    const res = await axios.get(
      'https://dribbble.com/jobs.rss',
      { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 }
    )
    const xml = res.data
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || []
    return items.slice(0, 20).map(item => {
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

async function scrapeGraphicDesignJobs() {
  try {
    const res = await axios.get(
      'https://www.graphicdesignjob.co/feed/',
      { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 }
    )
    const xml = res.data
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || []
    return items.slice(0, 15).map(item => {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
                    item.match(/<title>(.*?)<\/title>/)?.[1] || ''
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
      return {
        title: title.replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
        company: '',
        url: link.trim(),
        source: 'GraphicDesignJob',
        tags: ['graphic design'],
        date: new Date().toISOString(),
      }
    }).filter(j => j.title)
  } catch (err) {
    console.error('GraphicDesignJob error:', err.message)
    return []
  }
}

export async function GET() {
  try {
    const [remoteOK, wwr, dribbble, gdj] = await Promise.all([
      scrapeRemoteOK(),
      scrapeWeWorkRemotely(),
      scrapeDribbble(),
      scrapeGraphicDesignJobs(),
    ])

    const allJobs = [...remoteOK, ...wwr, ...dribbble, ...gdj]

    return Response.json({
      ok: true,
      count: allJobs.length,
      sources: {
        remoteOK: remoteOK.length,
        weWorkRemotely: wwr.length,
        dribbble: dribbble.length,
        graphicDesignJob: gdj.length,
      },
      jobs: allJobs,
    })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Error scraping jobs' }, { status: 500 })
  }
}