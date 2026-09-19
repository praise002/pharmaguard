import { EXTRACTION_INSTRUCTION, buildGeminiResponseSchema, validateExtractionResult } from './schema.js'
import { fileToBase64 } from './imageUtils.js'

// A Google-maintained alias (always points at their current stable lite
// model) rather than a pinned version number — pinned versions have been
// retired mid-build twice already (gemini-2.5-flash, gemini-2.5-flash-lite),
// each time breaking every Gemini call with a 404 until caught and updated.
// Also tested as noticeably more available under load: 0 failures across
// several real extraction calls, vs. intermittent 503s on gemini-3.6-flash.
const GEMINI_MODEL = 'gemini-flash-lite-latest'

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
