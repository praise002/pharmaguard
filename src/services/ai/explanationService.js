import { explainWithOpenAI } from './openaiClient.js'
import { buildExplanationPrompt } from './explanationPrompt.js'

const OPENAI_TIMEOUT_MS = 10000

// Explanation: OpenAI only, no AI fallback. If this fails or times out, the
// caller (ResultScreen) falls back to buildFallbackExplanation below — a
// deterministic, non-AI explanation — rather than trying a second AI provider.
export async function generateExplanation(verification, extraction) {
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY
  const prompt = buildExplanationPrompt(verification, extraction)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS)

  try {
    const text = await explainWithOpenAI(prompt, openaiKey, { signal: controller.signal })
    console.log('[explanation] served by openai')
    return { text, provider: 'openai' }
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Deterministic, non-AI explanation used only if OpenAI fails — so the
 * result screen always has an accurate (if less polished) explanation to
 * show instead of a dead end during a live demo.
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
