import { extractWithGemini } from './geminiClient.js'
import { extractWithOpenAI } from './openaiClient.js'
import { resizeImageForUpload } from './imageUtils.js'

const GEMINI_TIMEOUT_MS = 10000

// Vision: Gemini is primary, OpenAI is the fallback (opposite of the
// explanation service, where OpenAI is primary and Gemini is the fallback).
export async function analyzeMedicineImages(rawImages) {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY
  const images = await Promise.all(rawImages.map(resizeImageForUpload))

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS)

  try {
    const result = await extractWithGemini(images, geminiKey, { signal: controller.signal })
    console.log('[vision] served by gemini')
    return { ...result, provider: 'gemini' }
  } catch (err) {
    console.warn('[vision] gemini failed, falling back to openai:', err.message)
  } finally {
    clearTimeout(timeoutId)
  }

  const result = await extractWithOpenAI(images, openaiKey)
  console.log('[vision] served by openai')
  return { ...result, provider: 'openai' }
}
