import { extractWithGemini } from './_lib/gemini.js'

const GEMINI_TIMEOUT_MS = 10000
const MAX_IMAGES = 2

// Vision: Gemini only. Primary key first; if it fails or times out (e.g. the
// daily free-tier quota is exhausted on that key), retry with a second
// Gemini API key as fallback. Keys are server-only env vars, never shipped
// to the browser.
export async function POST(request) {
  let images
  try {
    ;({ images } = await request.json())
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const valid =
    Array.isArray(images) &&
    images.length >= 1 &&
    images.length <= MAX_IMAGES &&
    images.every(
      (img) => typeof img?.mimeType === 'string' && img.mimeType.startsWith('image/') && typeof img.data === 'string',
    )
  if (!valid) {
    return Response.json({ error: `Expected 1-${MAX_IMAGES} images as { mimeType, data }` }, { status: 400 })
  }

  try {
    const result = await extractWithGemini(images, process.env.GEMINI_API_KEY, {
      signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
    })
    console.log('[vision] served by gemini (primary key)')
    return Response.json({ ...result, provider: 'gemini' })
  } catch (err) {
    console.warn('[vision] gemini (primary key) failed, retrying with fallback key:', err.message)
  }

  try {
    const result = await extractWithGemini(images, process.env.GEMINI_FALLBACK_API_KEY, {
      signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
    })
    console.log('[vision] served by gemini (fallback key)')
    return Response.json({ ...result, provider: 'gemini' })
  } catch (err) {
    console.error('[vision] gemini (fallback key) failed:', err.message)
    return Response.json({ error: 'Vision extraction failed' }, { status: 502 })
  }
}
