import { scoreProduct } from '../src/data/scoring.js'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const OPEN_APIS = [
  { url: 'https://world.openfoodfacts.org/api/v2/product', source: 'open_food_facts', category: 'food' },
  { url: 'https://world.openbeautyfacts.org/api/v2/product', source: 'open_beauty_facts', category: 'cosmetic' },
  { url: 'https://world.openproductsfacts.org/api/v2/product', source: 'open_products_facts', category: 'cleaning' },
]

function extractIngredients(product) {
  if (product.ingredients && Array.isArray(product.ingredients) && product.ingredients.length > 0) {
    return product.ingredients.map(i => i.text || i.id || '').filter(Boolean)
  }
  if (product.ingredients_text) {
    return product.ingredients_text.split(/,|;/).map(s => s.trim()).filter(Boolean)
  }
  return []
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { barcode, familyId, confirmedIngredients } = req.body
  if (!barcode) return res.status(400).json({ error: 'barcode required' })

  // If confirmedIngredients provided, skip fan-out and score directly
  if (confirmedIngredients && Array.isArray(confirmedIngredients)) {
    const scored = scoreProduct(confirmedIngredients, 'other', '')
    await supabase.from('scanned_products').upsert({
      barcode,
      ingredients: confirmedIngredients,
      score: scored.score,
      score_breakdown: { flags: scored.flags, breakdown: scored.breakdown, scorable: scored.scorable },
      source: 'user_contributed',
    }, { onConflict: 'barcode' })
    return res.json({ found: true, score: scored.score, flags: scored.flags, breakdown: scored.breakdown, watch_tier: 'clean', watch_reason: null, source: 'user_contributed', needs_ingredient_scan: false })
  }

  // Cache check
  const { data: cached } = await supabase.from('scanned_products').select('*').eq('barcode', barcode).single()
  if (cached && cached.score !== null) {
    const watchRes = await checkWatch(barcode, cached.brand)
    return res.json({
      found: true,
      product_name: cached.product_name,
      brand: cached.brand,
      category: cached.category,
      score: cached.score,
      flags: cached.score_breakdown?.flags || [],
      breakdown: cached.score_breakdown?.breakdown || '',
      watch_tier: watchRes.tier,
      watch_reason: watchRes.reason,
      source: cached.source,
      needs_ingredient_scan: false,
    })
  }

  // Fan-out to Open* APIs
  const results = await Promise.allSettled(
    OPEN_APIS.map(async api => {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 8000)
      try {
        const r = await fetch(`${api.url}/${barcode}.json`, { signal: ctrl.signal })
        clearTimeout(t)
        if (!r.ok) return null
        const data = await r.json()
        if (data.status !== 1) return null
        return { product: data.product, source: api.source, category: api.category }
      } catch { clearTimeout(t); return null }
    })
  )

  const hit = results.find(r => r.status === 'fulfilled' && r.value !== null)?.value
  if (!hit) return res.json({ found: false, needs_ingredient_scan: true, score: null })

  const { product, source, category } = hit
  const product_name = product.product_name || product.product_name_en || ''
  const brand = product.brands || ''
  const ingredients = extractIngredients(product)
  const scored = scoreProduct(ingredients, category, product_name)

  await supabase.from('scanned_products').upsert({
    barcode, product_name, brand, category, ingredients,
    score: scored.score,
    score_breakdown: { flags: scored.flags, breakdown: scored.breakdown, scorable: scored.scorable },
    source,
  }, { onConflict: 'barcode' })

  // Silent approve if clean enough
  if (familyId && scored.score !== null && scored.score >= 7) {
    supabase.from('approved_products').upsert({ family_id: familyId, barcode, product_name, brand, category, score: scored.score }, { onConflict: 'family_id,barcode' }).then(() => {}).catch(() => {})
  }

  const watchRes = await checkWatch(barcode, brand)

  return res.json({
    found: true, product_name, brand, category,
    score: scored.score,
    flags: scored.flags,
    breakdown: scored.breakdown,
    watch_tier: watchRes.tier,
    watch_reason: watchRes.reason,
    source,
    needs_ingredient_scan: scored.score === null,
  })
}

async function checkWatch(barcode, brand) {
  const { data } = await supabase
    .from('watch_list')
    .select('tier,reason,severity')
    .or(`barcode.eq.${barcode},brand.ilike.${brand || 'NOMATCH'}`)
    .or('expires_at.is.null,expires_at.gt.now()')
    .order('severity', { ascending: false })
    .limit(1)
  if (data && data.length > 0) return { tier: data[0].tier, reason: data[0].reason }
  return { tier: 'clean', reason: null }
}
