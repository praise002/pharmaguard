const OPENAI_MODEL = 'gpt-4o'

export async function explainWithOpenAI(prompt, apiKey, { signal } = {}) {
  if (!apiKey) throw new Error('Missing OpenAI API key')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal,
  })

  if (!res.ok) {
    throw new Error(`OpenAI request failed: ${res.status} ${await res.text()}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('OpenAI response had no content')

  return text.trim()
}
