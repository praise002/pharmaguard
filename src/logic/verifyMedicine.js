import { similarityRatio } from './stringSimilarity.js'

const CONFIDENCE_THRESHOLD = 0.5
const LOOKALIKE_SIMILARITY_THRESHOLD = 0.65
const LOOKALIKE_MIN_WORD_LENGTH = 4

function isEmpty(value) {
  return value === null || value === undefined || String(value).trim() === ''
}

function normalize(value) {
  return isEmpty(value) ? '' : String(value).trim().toLowerCase()
}

function firstWord(value) {
  const match = String(value || '').match(/[a-z0-9]+/i)
  return match ? match[0].toLowerCase() : ''
}

function isUnreadable(extraction) {
  const lowConfidence =
    typeof extraction.confidence === 'number' && extraction.confidence < CONFIDENCE_THRESHOLD
  const missingBoth = isEmpty(extraction.batch_no) && isEmpty(extraction.nafdac_reg_no)
  return lowConfidence || missingBoth
}

const KEY_FIELD_LABELS = [
  { name: 'product_name', label: 'Product name' },
  { name: 'batch_no', label: 'Batch number' },
  { name: 'nafdac_reg_no', label: 'NAFDAC registration number' },
  { name: 'expiry_date', label: 'Expiry date' },
]

/**
 * Which key fields came back empty — shown on the "unreadable" screen so the
 * user knows exactly what to re-photograph, instead of a generic "try again."
 */
function getMissingKeyFields(extraction) {
  return KEY_FIELD_LABELS.filter((f) => isEmpty(extraction[f.name])).map((f) => f.label)
}

function isExpired(dateStr) {
  if (isEmpty(dateStr)) return false

  const parts = String(dateStr).trim().split('-').map(Number)
  if (parts.some(Number.isNaN)) return false

  const [year, month, day] = parts
  if (!year || !month) return false

  const expiry = new Date(year, month - 1, day || 1)
  if (parts.length === 2) {
    // Only month/year printed: treat the pack as valid through the end of that month.
    expiry.setMonth(expiry.getMonth() + 1)
    expiry.setDate(0)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return expiry < today
}

/**
 * Step 5: exact match against alerts.json. Only batch_no and the one
 * confirmed-fake registration number in the dataset (alert 042/2026) count —
 * everything else is a deterministic flag, not a confirmed alert.
 *
 * Two narrow exceptions, both meaning "no single batch is the problem — the
 * whole class is":
 * - type "unregistered_all_stock" (e.g. Otrivin, 019/2026): NAFDAC confirmed
 *   the manufacturer isn't importing ANY of that product, so a product-name
 *   match is itself the exact match.
 * - alerts with an "active_ingredient" (e.g. Levamisole, 030/2026): the
 *   recall applies to every brand containing that ingredient, not a specific
 *   product or batch, so an ingredient match is itself the exact match.
 * Neither extends to alerts lacking a batch_no for other reasons (e.g.
 * Forxiga lookalikes), where genuine stock does exist and only some
 * counterfeits mimic it — those stay in the fuzzy lookalike check below.
 */
export function findExactAlertMatch(extraction, alerts) {
  const batchNo = normalize(extraction.batch_no)
  const regNo = normalize(extraction.nafdac_reg_no)
  const productWord = firstWord(extraction.product_name)
  const activeIngredient = normalize(extraction.active_ingredient)

  for (const alert of alerts) {
    if (batchNo && alert.batch_no && normalize(alert.batch_no) === batchNo) {
      return alert
    }
    if (regNo && alert.fake_reg_no && normalize(alert.fake_reg_no) === regNo) {
      return alert
    }
    if (
      alert.type === 'unregistered_all_stock' &&
      productWord &&
      productWord === firstWord(alert.product)
    ) {
      return alert
    }
    if (
      alert.active_ingredient &&
      activeIngredient &&
      activeIngredient.includes(normalize(alert.active_ingredient))
    ) {
      return alert
    }
  }
  return null
}

/**
 * Step 6c: fuzzy-match the extracted product name's first word against the
 * first word of every genuine product name in the dataset (e.g. "Coglaet" vs
 * "Colgate", "Ulmicort" vs "Pulmicort"). An exact word match is excluded here
 * since that's either genuine or would already have been caught by step 5.
 */
export function findBrandLookalike(productName, alerts) {
  const extractedWord = firstWord(productName)
  if (extractedWord.length < LOOKALIKE_MIN_WORD_LENGTH) return null

  let best = null
  for (const alert of alerts) {
    const brandWord = firstWord(alert.product)
    if (brandWord.length < LOOKALIKE_MIN_WORD_LENGTH || brandWord === extractedWord) continue

    const ratio = similarityRatio(extractedWord, brandWord)
    if (ratio >= LOOKALIKE_SIMILARITY_THRESHOLD && (!best || ratio > best.ratio)) {
      best = { ratio, alert }
    }
  }
  return best
}

/**
 * Steps 6-7: deterministic rule checks, run only when there's no exact alert match.
 */
export function collectFlags(extraction, alerts) {
  const flags = []

  if (isExpired(extraction.expiry_date)) {
    flags.push({
      type: 'expired',
      message: `The expiry date printed on this pack (${extraction.expiry_date}) has already passed.`,
    })
  }

  if (isEmpty(extraction.nafdac_reg_no)) {
    flags.push({
      type: 'missing_reg_no',
      message: 'No NAFDAC registration number is visible on this pack.',
    })
  }

  const lookalike = findBrandLookalike(extraction.product_name, alerts)
  if (lookalike) {
    flags.push({
      type: 'lookalike_brand',
      message: `The product name "${extraction.product_name}" closely resembles the known brand "${lookalike.alert.product}", without matching it exactly.`,
      relatedAlert: lookalike.alert,
    })
  }

  return flags
}

/**
 * Full verification pipeline (spec steps 2, 4-8). Takes the raw extraction
 * result from the vision model (M3) plus the alerts dataset (M1) and returns
 * one of the four screen statuses, with whatever evidence backs it.
 */
export function verifyMedicine(extraction, alerts) {
  if (!extraction.is_drug) {
    return { status: 'not_a_drug', matchedAlert: null, flags: [] }
  }

  if (isUnreadable(extraction)) {
    return {
      status: 'unreadable',
      matchedAlert: null,
      flags: [],
      missingFields: getMissingKeyFields(extraction),
    }
  }

  const matchedAlert = findExactAlertMatch(extraction, alerts)
  if (matchedAlert) {
    return { status: 'confirmed_alert', matchedAlert, flags: [] }
  }

  const flags = collectFlags(extraction, alerts)
  if (flags.length > 0) {
    return { status: 'flagged', matchedAlert: null, flags }
  }

  return { status: 'no_flags_found', matchedAlert: null, flags: [] }
}
