import alerts from '../src/data/alerts.json' with { type: 'json' }
import { explainWithOpenRouter } from './_lib/openrouter.js'
import { buildExplanationPrompt } from '../src/services/ai/explanationPrompt.js'
import { validateExtractionResult } from '../src/services/ai/schema.js'
import { verifyMedicine } from '../src/logic/verifyMedicine.js'

const OPENROUTER_TIMEOUT_MS = 10000
const MAX_FIELD_LENGTH = 500
const EXPLAINABLE_STATUSES = ['confirmed_alert', 'flagged', 'no_flags_found']

// Explanation: OpenRouter only, no AI fallback (the browser falls back to a
// deterministic explanation if this fails). Only the extracted fields are
// accepted — verification is re-run here against the bundled alerts, so this
// endpoint can't be used to send an arbitrary prompt on our key.
export async function POST(request) {
  let extraction
  try {
    ;({ extraction } = await request.json())
    validateExtractionResult(extraction)
  } catch (err) {
    return Response.json({ error: `Invalid extraction: ${err.message}` }, { status: 400 })
  }

  const tooLong = Object.values(extraction).some((v) => typeof v === 'string' && v.length > MAX_FIELD_LENGTH)
  if (tooLong) {
    return Response.json({ error: 'Extraction field too long' }, { status: 400 })
  }

  const verification = verifyMedicine(extraction, alerts)
  if (!EXPLAINABLE_STATUSES.includes(verification.status)) {
    return Response.json({ error: `No explanation for status "${verification.status}"` }, { status: 400 })
  }

  try {
    const text = await explainWithOpenRouter(
      buildExplanationPrompt(verification, extraction),
      process.env.OPENROUTER_API_KEY,
      { signal: AbortSignal.timeout(OPENROUTER_TIMEOUT_MS) },
    )
    console.log('[explanation] served by openrouter')
    return Response.json({ text, provider: 'openrouter' })
  } catch (err) {
    console.error('[explanation] openrouter failed:', err.message)
    return Response.json({ error: 'Explanation failed' }, { status: 502 })
  }
}
