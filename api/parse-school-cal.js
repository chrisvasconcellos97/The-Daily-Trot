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
        max_tokens: 1000,
        system: 'Extract school calendar dates from this image. Return JSON array only: [{ name: string, start_date: "YYYY-MM-DD", end_date: "YYYY-MM-DD"|null, type: "No School"|"Early Dismissal"|"Holiday" }]. Respond with only the JSON array, no markdown.',
        messages: [{
          role: 'user',
          content: [{
            type: 'image',
            source: { type: 'base64', media_type: mimeType || 'image/jpeg', data: image },
          }, {
            type: 'text',
            text: 'Extract all school closure and early dismissal dates from this calendar.',
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
