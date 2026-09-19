import { EXTRACTION_INSTRUCTION, buildOpenAiResponseSchema, validateExtractionResult } from './schema.js'
import { fileToBase64 } from './imageUtils.js'

const OPENAI_MODEL = 'gpt-4o'

export async function extractWithOpenAI(images, apiKey, { signal } = {}) {
  if (!apiKey) throw new Error('Missing OpenAI API key')

  const imageParts = []
  for (const file of images) {
    imageParts.push({
      type: 'image_url',
      image_url: { url: `data:${file.type};base64,${await fileToBase64(file)}` },
    })
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: EXTRACTION_INSTRUCTION }, ...imageParts],
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'medicine_extraction',
          schema: buildOpenAiResponseSchema(),
          strict: true,
        },
      },
    }),
    signal,
  })

  if (!res.ok) {
    throw new Error(`OpenAI request failed: ${res.status} ${await res.text()}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('OpenAI response had no content')

  return validateExtractionResult(JSON.parse(text))
}

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
