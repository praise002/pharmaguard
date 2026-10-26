import { postJson } from './apiClient.js'
import { fileToBase64, resizeImageForUpload } from './imageUtils.js'

// Covers the server's primary-key attempt + fallback-key retry (10s each,
// see api/extract.js) with a little headroom.
const VISION_TIMEOUT_MS = 25000

// Vision: Gemini only, via /api/extract. The primary → fallback Gemini key
// retry happens server-side.
export async function analyzeMedicineImages(rawImages) {
  const resized = await Promise.all(rawImages.map(resizeImageForUpload))
  const images = await Promise.all(
    resized.map(async (file) => ({ mimeType: file.type, data: await fileToBase64(file) })),
  )

  const result = await postJson('/api/extract', { images }, { signal: AbortSignal.timeout(VISION_TIMEOUT_MS) })
  console.log(`[vision] served by ${result.provider}`)
  return result
}
