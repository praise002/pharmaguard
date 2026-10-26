// OpenRouter model IDs are namespaced by upstream provider. Same gpt-4o the
// explanation prompt was tuned against, just routed through OpenRouter.
const OPENROUTER_MODEL = 'openai/gpt-4o'

export async function explainWithOpenRouter(prompt, apiKey, { signal } = {}) {
  if (!apiKey) throw new Error('Missing OpenRouter API key')

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'X-Title': 'PharmaGuard',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal,
  })

  if (!res.ok) {
    throw new Error(`OpenRouter request failed: ${res.status} ${await res.text()}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('OpenRouter response had no content')

  return text.trim()
}
