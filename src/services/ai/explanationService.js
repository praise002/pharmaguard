import { postJson } from './apiClient.js'

// Server-side OpenRouter call times out at 10s (see api/explain.js); a little
// headroom on top for the round trip.
const EXPLANATION_TIMEOUT_MS = 12000

// Explanation: OpenRouter only, via /api/explain, no AI fallback. If this
// fails or times out, the caller (ResultScreen) falls back to
// buildFallbackExplanation below — a deterministic, non-AI explanation —
// rather than trying a second AI provider. Only the extraction is sent; the
// server re-runs verification itself before building the prompt.
export async function generateExplanation(extraction) {
  const result = await postJson(
    '/api/explain',
    { extraction },
    { signal: AbortSignal.timeout(EXPLANATION_TIMEOUT_MS) },
  )
  console.log(`[explanation] served by ${result.provider}`)
  return result
}

/**
 * Deterministic, non-AI explanation used only if OpenRouter fails — so the
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
