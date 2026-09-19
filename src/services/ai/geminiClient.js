import { EXTRACTION_INSTRUCTION, buildGeminiResponseSchema, validateExtractionResult } from './schema.js'
import { fileToBase64 } from './imageUtils.js'

const GEMINI_MODEL = 'gemini-2.5-flash'

export async function extractWithGemini(images, apiKey, { signal } = {}) {
  if (!apiKey) throw new Error('Missing Gemini API key')

  const parts = [{ text: EXTRACTION_INSTRUCTION }]
  for (const file of images) {
    parts.push({ inlineData: { mimeType: file.type, data: await fileToBase64(file) } })
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0,
          responseMimeType: 'application/json',
          responseSchema: buildGeminiResponseSchema(),
        },
      }),
      signal,
    },
  )

  if (!res.ok) {
    throw new Error(`Gemini request failed: ${res.status} ${await res.text()}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini response had no content')

  return validateExtractionResult(JSON.parse(text))
}

export async function explainWithGemini(prompt, apiKey, { signal } = {}) {
  if (!apiKey) throw new Error('Missing Gemini API key')

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal,
    },
  )

  if (!res.ok) {
    throw new Error(`Gemini request failed: ${res.status} ${await res.text()}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini response had no content')

  return text.trim()
}
