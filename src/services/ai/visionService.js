import { extractWithGemini } from './geminiClient.js'
import { resizeImageForUpload } from './imageUtils.js'

const GEMINI_TIMEOUT_MS = 10000

// Vision: Gemini only. Primary key first; if it fails or times out (e.g. the
// daily free-tier quota is exhausted on that key), retry with a second
// Gemini API key as fallback. OpenAI is never used for vision.
export async function analyzeMedicineImages(rawImages) {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY
  const geminiFallbackKey = import.meta.env.VITE_GEMINI_FALLBACK_API_KEY
  const images = await Promise.all(rawImages.map(resizeImageForUpload))

  const primaryController = new AbortController()
  const primaryTimeoutId = setTimeout(() => primaryController.abort(), GEMINI_TIMEOUT_MS)

  try {
    const result = await extractWithGemini(images, geminiKey, { signal: primaryController.signal })
    console.log('[vision] served by gemini (primary key)')
    return { ...result, provider: 'gemini' }
  } catch (err) {
    console.warn('[vision] gemini (primary key) failed, retrying with fallback key:', err.message)
  } finally {
    clearTimeout(primaryTimeoutId)
  }

  const fallbackController = new AbortController()
  const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), GEMINI_TIMEOUT_MS)

  try {
    const result = await extractWithGemini(images, geminiFallbackKey, { signal: fallbackController.signal })
    console.log('[vision] served by gemini (fallback key)')
    return { ...result, provider: 'gemini' }
  } finally {
    clearTimeout(fallbackTimeoutId)
  }
}
