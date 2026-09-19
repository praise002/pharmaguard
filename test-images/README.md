# Test images

Fixtures used for manual and scripted end-to-end testing (M9). Each one exercises a specific path through `analyzeMedicineImages` → `verifyMedicine` → `generateExplanation`. Verified outcomes below are from real API calls (OpenAI primary / Gemini fallback for vision), not mocked.

| File | Type | Expected result | Verified outcome |
|---|---|---|---|
| `augmentin-ac3n-confirmed.png` | synthetic (generated) | `confirmed_alert` → 024/2026 | ✅ Matches — this is the spec's primary demo scenario (batch `AC3N`). Neither real photo on hand actually carries this batch, so this fixture exists specifically to cover it. |
| `otrivin-confirmed.png` | synthetic (generated) | `confirmed_alert` → 019/2026 | ✅ Matches — spec's backup demo scenario, matched by product name alone (no batch needed), per the `unregistered_all_stock` special case. |
| `retrax-levamisole-confirmed-front.png` + `-back.png` | real photo (user-provided) | `confirmed_alert` → 030/2026 | ✅ Matches, via **active-ingredient** matching (Levamisole) — a different match path than batch/reg number. Use both files together (front + back) as the app expects. |
| `augmentin-expired-flagged.png` | real photo (user-provided) | `flagged` | ✅ Matches — batch `786627` (no dataset match), expired 08/2019, no reg. no. visible. |
| `augmentin-partial-read.png` | real photo (user-provided) | `flagged` **or** `no_flags_found` | ⚠️ Genuinely variable — this is a composite of 4 sub-photos (foil, blister, box front/back) at different legibility. Which fields read cleanly varies by run. The only outcomes that would be a real bug here are `confirmed_alert` (false positive) or fabricated field values — neither has occurred. |
| `not-a-drug.png` | synthetic (generated) | `not_a_drug` | ✅ Matches. |
| `blurry-unreadable.png` | synthetic (heavy Gaussian blur of `augmentin-expired-flagged.png`) | `unreadable` | ✅ Matches. |

## Important finding from building this set

Before a prompt/config fix, `not-a-drug.png` and `blurry-unreadable.png` caused OpenAI (gpt-4o) to **fabricate a complete, plausible-looking fake product** — invented product name, manufacturer, batch number, and NAFDAC registration number — instead of returning `is_drug: false` or `null` fields. This directly violated the app's core rule ("never invent a batch number or fact").

Root cause: no `temperature` was set on the OpenAI call (defaults to 1.0, encouraging creative completion), and the anti-hallucination instruction wasn't forceful enough for that provider's default behavior.

Fix (in `src/services/ai/openaiClient.js` and `src/services/ai/geminiClient.js`): `temperature: 0` on both providers' extraction calls, plus a much more explicit instruction in `src/services/ai/schema.js` telling the model that "looks like a plausible product" is never sufficient — only report a value if the exact characters are legible in the image. Re-tested after the fix: both scenarios now correctly return `is_drug: false` / all-null-with-low-confidence respectively.

## Known gaps

- No physical mock-up pack showing `AC3N` or a real Otrivin pack exists yet — `augmentin-ac3n-confirmed.png` and `otrivin-confirmed.png` are synthetic (rendered text on a plain background), sufficient to validate the extraction → matching → explanation pipeline, but **not** a substitute for rehearsing the live demo with an actual printed/physical prop.
- Gemini's free tier caps at 20 requests/day; this session exhausted it during testing. The OpenAI→Gemini fallback trigger was confirmed working structurally (OpenAI failure correctly attempts Gemini), but a full successful fallback response couldn't be re-verified today. Worth a fresh check with quota available before the live demo.
