export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { image, mimeType, barcode, product_name } = req.body
  if (!image) return res.status(400).json({ error: 'image required' })
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!validTypes.includes(mimeType)) return res.status(400).json({ error: 'invalid mimeType' })

  const ctrl = new AbortController()
  const timeout = setTimeout(() => ctrl.abort(), 25000)

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: 'You extract ingredient lists from product label photos. Return ONLY valid JSON: {"ingredients": string[], "raw_text": string}. Each array item is one ingredient in label order, original spelling. raw_text is the full ingredient block verbatim. No commentary, no markdown.',
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType, data: image } },
            { type: 'text', text: `Extract the complete ingredient list from this product label. Product: ${product_name || 'unknown'}.` },
          ],
        }],
      }),
    })
    clearTimeout(timeout)
    if (!r.ok) return res.status(r.status).json({ error: await r.text() })
    const data = await r.json()
    const text = data.content[0].text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '')
    const parsed = JSON.parse(text)
    return res.json(parsed)
  } catch (err) {
    clearTimeout(timeout)
    if (err.name === 'AbortError') return res.status(504).json({ error: 'Timeout' })
    return res.status(500).json({ error: err.message })
  }
}
