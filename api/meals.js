const rateMap = new Map()

const PREF_LABELS = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  pescatarian: 'Pescatarian',
  gluten_free: 'Gluten-free',
  dairy_free: 'Dairy-free',
  nut_free: 'Nut-free',
  halal: 'Halal',
  kosher: 'Kosher',
  low_carb: 'Low-carb',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const ip = req.headers['x-forwarded-for'] || 'unknown'
  const now = Date.now()
  const windowMs = 60000
  const limit = 5

  const record = rateMap.get(ip) || { count: 0, start: now }
  if (now - record.start > windowMs) { record.count = 0; record.start = now }
  record.count++
  rateMap.set(ip, record)
  if (record.count > limit) return res.status(429).json({ error: 'Rate limit exceeded' })

  const { groceryItems = [], dietaryPrefs = {} } = req.body || {}

  const itemNames = (groceryItems || [])
    .map(i => (typeof i === 'string' ? i : i?.name))
    .filter(Boolean)

  if (itemNames.length === 0) {
    return res.status(400).json({ error: 'No grocery items provided' })
  }

  const activePrefs = Object.entries(PREF_LABELS)
    .filter(([key]) => dietaryPrefs[key])
    .map(([, label]) => label)

  const system = `You are a practical family meal planner. Given a grocery list and dietary preferences, suggest 10 meals the family can make.

PANTRY STAPLES (always assume available): salt, pepper, cooking oil, butter, garlic, onion, basic spices, sugar, flour, eggs, water, stock/broth.

Rules:
- Prioritize meals where they already own most ingredients
- Be realistic — meals a family with kids would actually cook
- Variety in cooking methods and difficulty
- If dietary restrictions are set, strictly respect them
- Never suggest meals that violate active dietary restrictions`

  const userMessage = `Grocery list (${itemNames.length} items):
${itemNames.map(n => `- ${n}`).join('\n')}

Active dietary restrictions: ${activePrefs.length ? activePrefs.join(', ') : 'none'}

Suggest 10 meals. Return ONLY a valid JSON array (no markdown, no commentary). Each element must be an object with this exact shape:
{
  "name": "string",
  "description": "string (1 sentence)",
  "ingredients_have": ["string"],
  "ingredients_missing": [{"name": "string", "quantity": "string", "optional": false}],
  "prep_minutes": 10,
  "cook_minutes": 20,
  "difficulty": "easy",
  "method": "stovetop",
  "dietary_tags": ["vegetarian"],
  "servings": 4,
  "match_score": 85,
  "steps": ["Step 1...", "Step 2..."]
}

"difficulty" is one of: "easy", "medium", "hard".
"method" is one of: "stovetop", "oven", "slow_cooker", "instant_pot", "grill", "no_cook", "air_fryer".
"match_score" is 0-100 — how well the family's grocery list + pantry staples cover this meal.
"ingredients_have" lists items they already have (from the grocery list or pantry staples).
"ingredients_missing" lists what they'd still need to buy.`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 45000)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-8',
        max_tokens: 4000,
        system,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    clearTimeout(timeout)
    if (!response.ok) {
      const err = await response.text()
      return res.status(response.status).json({ error: err })
    }

    const data = await response.json()
    const raw = data.content?.[0]?.text || ''
    const text = raw.trim().replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim()

    let meals
    try {
      meals = JSON.parse(text)
    } catch {
      return res.status(502).json({ error: 'Could not parse meal suggestions' })
    }

    if (!Array.isArray(meals)) {
      return res.status(502).json({ error: 'Unexpected meal format' })
    }

    return res.json({ meals })
  } catch (err) {
    clearTimeout(timeout)
    if (err.name === 'AbortError') return res.status(504).json({ error: 'Timeout' })
    return res.status(500).json({ error: err.message })
  }
}
