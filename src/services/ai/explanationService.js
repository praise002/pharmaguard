import { explainWithGemini } from './geminiClient.js'
import { explainWithOpenAI } from './openaiClient.js'
import { buildExplanationPrompt } from './explanationPrompt.js'

const OPENAI_TIMEOUT_MS = 10000

// Explanation: OpenAI is primary, Gemini is the fallback (opposite of the
// vision service, where Gemini is primary and OpenAI is the fallback).
export async function generateExplanation(verification, extraction) {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY
  const prompt = buildExplanationPrompt(verification, extraction)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS)

  try {
    const text = await explainWithOpenAI(prompt, openaiKey, { signal: controller.signal })
    console.log('[explanation] served by openai')
    return { text, provider: 'openai' }
  } catch (err) {
    console.warn('[explanation] openai failed, falling back to gemini:', err.message)
  } finally {
    clearTimeout(timeoutId)
  }

  const text = await explainWithGemini(prompt, geminiKey)
  console.log('[explanation] served by gemini')
  return { text, provider: 'gemini' }
}

/**
 * Deterministic, non-AI explanation used only if both Gemini and OpenAI
 * fail — so the result screen always has an accurate (if less polished)
 * explanation to show instead of a dead end during a live demo.
 */
export function buildFallbackExplanation(verification) {
  if (verification.status === 'confirmed_alert') {
    const alert = verification.matchedAlert
    return `This pack matches NAFDAC Public Alert No. ${alert.alert_id}: ${alert.issue}. Source: nafdac.gov.ng, Public Alert ${alert.alert_id}.`
  }
  if (verification.status === 'flagged') {
    return verification.flags.map((flag) => flag.message).join(' ')
  }
  return 'Nothing in our current dataset or packaging rules caught an issue with this pack.'
}
