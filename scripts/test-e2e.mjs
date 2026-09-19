// Runs the full extraction -> verification pipeline against the fixtures in
// test-images/ using real API calls. See test-images/README.md for what each
// fixture covers and its last verified outcome.
//
// Usage: node --dns-result-order=ipv4first --env-file=.env scripts/test-e2e.mjs
// (--dns-result-order=ipv4first works around a sandbox-specific IPv6 timeout;
// harmless to include elsewhere.)

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const SRC = path.join(ROOT, 'src')
const IMAGES = path.join(ROOT, 'test-images')

const { extractWithOpenAI } = await import(path.join(SRC, 'services/ai/openaiClient.js'))
const { extractWithGemini } = await import(path.join(SRC, 'services/ai/geminiClient.js'))
const { verifyMedicine } = await import(path.join(SRC, 'logic/verifyMedicine.js'))

const alerts = JSON.parse(readFileSync(path.join(SRC, 'data/alerts.json')))

function loadImage(filename) {
  const filePath = path.join(IMAGES, filename)
  const buffer = readFileSync(filePath)
  return new File([buffer], filename, { type: 'image/png' })
}

const SCENARIOS = [
  {
    name: 'AC3N synthetic pack -> confirmed_alert (024/2026)',
    images: ['augmentin-ac3n-confirmed.png'],
    expectStatus: 'confirmed_alert',
    expectAlert: '024/2026',
  },
  {
    name: 'Otrivin synthetic pack -> confirmed_alert (019/2026)',
    images: ['otrivin-confirmed.png'],
    expectStatus: 'confirmed_alert',
    expectAlert: '019/2026',
  },
  {
    name: 'Retrax (Levamisole) real photo front+back -> confirmed_alert (030/2026)',
    images: ['retrax-levamisole-confirmed-front.png', 'retrax-levamisole-confirmed-back.png'],
    expectStatus: 'confirmed_alert',
    expectAlert: '030/2026',
  },
  {
    name: 'augmentin-expired-flagged.png -> flagged',
    images: ['augmentin-expired-flagged.png'],
    expectStatus: 'flagged',
  },
  {
    name: 'augmentin-partial-read.png (ambiguous real photo) -> flagged or no_flags_found',
    images: ['augmentin-partial-read.png'],
    expectStatus: ['flagged', 'no_flags_found'],
  },
  {
    name: 'not-a-drug.png -> not_a_drug',
    images: ['not-a-drug.png'],
    expectStatus: 'not_a_drug',
  },
  {
    name: 'blurry-unreadable.png -> unreadable',
    images: ['blurry-unreadable.png'],
    expectStatus: 'unreadable',
  },
]

let pass = 0
let fail = 0

for (const scenario of SCENARIOS) {
  console.log(`\n=== ${scenario.name} ===`)
  const files = scenario.images.map(loadImage)

  let extraction
  try {
    extraction = await extractWithOpenAI(files, process.env.VITE_OPENAI_API_KEY)
    console.log('provider: openai')
  } catch (err) {
    console.log('openai failed, falling back to gemini:', err.message.split('\n')[0])
    extraction = await extractWithGemini(files, process.env.VITE_GEMINI_API_KEY)
    console.log('provider: gemini')
  }
  console.log('extraction:', extraction)

  const verification = verifyMedicine(extraction, alerts)
  console.log(
    'verification status:',
    verification.status,
    verification.matchedAlert ? `(alert ${verification.matchedAlert.alert_id})` : '',
  )

  const expected = Array.isArray(scenario.expectStatus) ? scenario.expectStatus : [scenario.expectStatus]
  const statusOk = expected.includes(verification.status)
  const alertOk = !scenario.expectAlert || verification.matchedAlert?.alert_id === scenario.expectAlert
  const ok = statusOk && alertOk

  console.log(
    ok
      ? 'PASS'
      : `FAIL (expected status in [${expected.join(', ')}]${scenario.expectAlert ? `, alert=${scenario.expectAlert}` : ''})`,
  )
  if (ok) pass++
  else fail++
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail > 0 ? 1 : 0)
