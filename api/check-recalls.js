export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { product_name, brand, category } = req.body
  if (!product_name && !brand) return res.status(400).json({ error: 'product_name or brand required' })

  const results = await Promise.allSettled([
    brand ? fetchFDA(brand) : Promise.resolve([]),
    product_name ? fetchCPSC(product_name) : Promise.resolve([]),
  ])

  const fdaRecalls = results[0].status === 'fulfilled' ? results[0].value : []
  const cpscRecalls = results[1].status === 'fulfilled' ? results[1].value : []
  const all = [...fdaRecalls, ...cpscRecalls].sort((a, b) => b.severity - a.severity || new Date(b.date) - new Date(a.date)).slice(0, 8)

  const tier = all.some(r => r.severity === 3) ? 'recalled' : all.length > 0 ? 'watch' : 'clean'
  return res.json({ tier, recalls: all })
}

async function fetchFDA(brand) {
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 8000)
    const url = `https://api.fda.gov/food/enforcement.json?search=brand_name:"${encodeURIComponent(brand)}"&limit=5`
    const r = await fetch(url, { signal: ctrl.signal })
    clearTimeout(t)
    if (r.status === 404) return []
    if (!r.ok) return []
    const data = await r.json()
    return (data.results || []).map(item => ({
      title: item.product_description || '',
      date: item.recall_initiation_date || '',
      reason: item.reason_for_recall || '',
      severity: item.classification === 'Class I' ? 3 : item.classification === 'Class II' ? 2 : 1,
      url: '',
      source: 'fda',
    }))
  } catch { return [] }
}

async function fetchCPSC(product_name) {
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 8000)
    const url = `https://www.saferproducts.gov/RestWebServices/Recall?format=json&ProductName=${encodeURIComponent(product_name)}`
    const r = await fetch(url, { signal: ctrl.signal })
    clearTimeout(t)
    if (!r.ok) return []
    const data = await r.json()
    return (data || []).slice(0, 5).map(item => ({
      title: item.Title || '',
      date: item.RecallDate || '',
      reason: item.Description || '',
      severity: 2,
      url: item.URL || '',
      source: 'cpsc',
    }))
  } catch { return [] }
}
