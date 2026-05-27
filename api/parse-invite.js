export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { image, mimeType } = req.body
  if (!image) return res.status(400).json({ error: 'image required' })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 25000)

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
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: 'Extract event details from this invitation image. Return JSON only with fields: title, date (YYYY-MM-DD), time (HH:MM 24h or null), location, host, category (one of: Birthday, Pool Party, Holiday, School, Other), rsvpBy (YYYY-MM-DD or null), notes. Respond with only the JSON object, no markdown.',
        messages: [{
          role: 'user',
          content: [{
            type: 'image',
            source: { type: 'base64', media_type: mimeType || 'image/jpeg', data: image },
          }, {
            type: 'text',
            text: 'Extract the event details from this invitation.',
          }],
        }],
      }),
    })

    clearTimeout(timeout)
    if (!response.ok) {
      const err = await response.text()
      return res.status(response.status).json({ error: err })
    }

    const data = await response.json()
    const text = data.content[0].text.trim()
    const parsed = JSON.parse(text.replace(/^```json\n?/, '').replace(/\n?```$/, ''))
    return res.json(parsed)
  } catch (err) {
    clearTimeout(timeout)
    if (err.name === 'AbortError') return res.status(504).json({ error: 'Timeout' })
    return res.status(500).json({ error: err.message })
  }
}
