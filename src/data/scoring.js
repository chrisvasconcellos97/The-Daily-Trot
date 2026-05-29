import { INGREDIENTS, normalize, ORGANIC_MARKERS } from './ingredients.js'

const AVOID_PENALTY = 3
const CAUTION_PENALTY = 1
const AVOID_CAP = 6
const CAUTION_CAP = 3
const MIN_INGREDIENTS = 2

function resolveContext(category, productName = '') {
  if (category === 'food') return 'food'
  if (category === 'cleaning') return 'cleaning'
  if (category === 'cosmetic') {
    const rinse = /shampoo|conditioner|cleanser|body wash|soap|face wash|hand wash/i
    return rinse.test(productName) ? 'cosmetic-rinseoff' : 'cosmetic-leaveon'
  }
  return 'other'
}

export function scoreProduct(ingredients = [], category = 'other', productName = '') {
  if (!Array.isArray(ingredients) || ingredients.length < MIN_INGREDIENTS) {
    return { score: null, flags: [], breakdown: 'Not enough ingredient data to score this product. Scan the label to help.', scorable: false }
  }

  const context = resolveContext(category, productName)
  let score = 10
  let avoidPenalty = 0
  let cautionPenalty = 0
  const flags = []
  const seen = new Set()

  for (const raw of ingredients) {
    const key = normalize(raw)
    if (!key) continue
    const entry = INGREDIENTS[key]
    if (!entry) continue
    const canonical = entry.canonical || key
    if (seen.has(canonical)) continue
    seen.add(canonical)

    const tier = (entry.categoryOverride && entry.categoryOverride[context]) || entry.tier
    if (tier === 'avoid') {
      avoidPenalty += AVOID_PENALTY
      flags.push({ ingredient: raw, tier: 'avoid', reason: entry.reason })
    } else if (tier === 'caution') {
      cautionPenalty += CAUTION_PENALTY
      flags.push({ ingredient: raw, tier: 'caution', reason: entry.reason })
    } else if (tier === 'safe') {
      flags.push({ ingredient: raw, tier: 'safe', reason: entry.reason })
    }
  }

  score -= Math.min(avoidPenalty, AVOID_CAP)
  score -= Math.min(cautionPenalty, CAUTION_CAP)

  let bonus = 0
  if (context === 'food') {
    const hasOrganic = ingredients.some(i => ORGANIC_MARKERS.includes(normalize(i)))
    if (hasOrganic) { bonus = 0.5; score += bonus }
  }

  score = Math.max(1, Math.min(10, score))
  score = Math.round(score * 10) / 10

  const avoidCount = flags.filter(f => f.tier === 'avoid').length
  const cautionCount = flags.filter(f => f.tier === 'caution').length
  const safeCount = flags.filter(f => f.tier === 'safe').length
  const parts = ['Started at 10.']
  if (avoidCount) parts.push(`${avoidCount} ingredient${avoidCount > 1 ? 's' : ''} to avoid (−${Math.min(avoidPenalty, AVOID_CAP)}).`)
  if (cautionCount) parts.push(`${cautionCount} to watch (−${Math.min(cautionPenalty, CAUTION_CAP)}).`)
  if (bonus) parts.push('Certified organic (+0.5).')
  if (safeCount && !avoidCount && !cautionCount) parts.push('Clean ingredients throughout.')
  parts.push(`Final score: ${score}/10.`)

  return { score, flags, breakdown: parts.join(' '), scorable: true }
}
