# M10 — Demo Readiness Check

## 1. Timing (target: <20s end-to-end)

Measured via a **real browser** (headless Chrome driven over CDP — actual file inputs set, actual submit button clicked, actual rendered result), not a synthetic script:

| Scenario | Images | Result | Time |
|---|---|---|---|
| Retrax (Levamisole) | 2 real photos, ~1.7MB combined | `CONFIRMED ALERT` — 030/2026 | **12.1s** |

Before adding client-side image compression, the same 2-image scenario measured **16.4s** via direct API calls (Node script, no UI) — passing the target, but with uncomfortably little margin, and most of that time (10.3s) was the vision call alone processing two full-resolution, uncompressed photos.

**Fix applied**: `resizeImageForUpload` in `src/services/ai/imageUtils.js` downscales to a max 1280px edge and re-encodes as JPEG (quality 0.82) client-side before upload, wired into `visionService.js`. Bought back ~4.3s of margin, with no loss of read accuracy (label text is legible well below 1280px). No-ops outside a browser, so it doesn't affect the Node-based test scripts.

Single-image scenarios (most demo packs) measured 5.5–6s via direct API timing — comfortably fast; the 2-image real-photo case is the realistic worst case and is now well clear of the 20s target.

## 2. Disclaimer appears on every result variant

Confirmed via the same real-browser method (actual upload → actual click → actual rendered DOM), across all three result-screen states:

| Status | Verdict badge shown | Disclaimer text present |
|---|---|---|
| `confirmed_alert` | CONFIRMED ALERT | ✅ exact required wording |
| `flagged` | FLAGGED FOR REVIEW | ✅ exact required wording |
| `no_flags_found` | NO FLAGS FOUND | ✅ exact required wording |

(The `not_a_drug`/`unreadable` early-exit screens don't carry a verdict badge at all, so the disclaimer requirement — which is specifically about the verdict screen — doesn't apply there.)

## 3. Physical mock packs

| Prop | Status |
|---|---|
| **Retrax (Levamisole) — real physical pack** | ✅ Ready. Real photos on hand (`test-images/retrax-levamisole-confirmed-*.png`), triggers `confirmed_alert` via active-ingredient matching (030/2026) — arguably a *more* interesting demo than a plain batch match, since it shows the app catching an issue with no counterfeit batch involved at all. |
| **AC3N-labeled Augmentin pack** (spec's primary demo scenario) | ❌ Not ready. No physical prop exists — `test-images/augmentin-ac3n-confirmed.png` is a synthetic rendered-text image, sufficient to validate the pipeline but not something you can hold up to a camera live. |
| **Otrivin pack** (spec's backup demo scenario) | ❌ Not ready. Same situation — `test-images/otrivin-confirmed.png` is synthetic only. |

**Recommendation**: lead the live demo with the Retrax pack (real prop, real confirmed-alert result, and a technically distinctive match path) rather than AC3N/Otrivin, unless a physical AC3N or Otrivin pack gets made before demo time.

## Known risks going into the demo

- **Gemini free-tier quota (20 req/day)** was exhausted by this session's testing. It resets daily, but confirm it has quota again before the live run — if it doesn't, the app still works correctly (falls back to OpenAI for vision), just without exercising the primary path.
- Fallback behavior (Gemini→OpenAI for vision, OpenAI→Gemini for explanation) has been verified structurally and via genuine failures during testing, but do one fresh full-fallback check when both keys have quota, close to demo time.
