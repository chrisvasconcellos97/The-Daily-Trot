const rateMap = new Map()

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const ip = req.headers['x-forwarded-for'] || 'unknown'
  const now = Date.now()
  const windowMs = 60000
  const limit = 20

  const record = rateMap.get(ip) || { count: 0, start: now }
  if (now - record.start > windowMs) { record.count = 0; record.start = now }
  record.count++
  rateMap.set(ip, record)
  if (record.count > limit) return res.status(429).json({ error: 'Rate limit exceeded' })

  const { messages } = req.body

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 25000)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: `You are Lillie, a warm and playful AI companion for busy parents using The Daily Trot app. You're like a loyal, slightly anxious dachshund — enthusiastic, helpful, and always looking out for the family. Keep responses concise and friendly (2-4 sentences). You help parents manage schedules, packing lists, activities, and day-to-day family life. Be encouraging and warm. Use the occasional gentle emoji but don't overdo it.`,
        messages: messages.map(m => ({ role: m.role, content: m.content }))
      })
    })

    clearTimeout(timeout)
    if (!response.ok) {
      const err = await response.text()
      return res.status(response.status).json({ error: err })
    }

    const data = await response.json()
    return res.json({ content: data.content[0].text })
  } catch (err) {
    clearTimeout(timeout)
    if (err.name === 'AbortError') return res.status(504).json({ error: 'Timeout' })
    return res.status(500).json({ error: err.message })
  }
}
