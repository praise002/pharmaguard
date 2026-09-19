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

- **Vision is Gemini-only now** (primary key → a second Gemini key as fallback; OpenAI is no longer involved in vision at all). **Explanation is OpenAI-only, no AI fallback** (falls back to a deterministic non-AI explanation if it fails). See `docs/TODO.md` for why this changed twice.
- **Gemini free-tier quota (20 req/day per key)** was exhausted by this session's testing on both keys at different points. It resets daily — confirm both keys have quota before the live run.
- **`gemini-2.5-flash` was retired by Google mid-build.** The app now uses `gemini-3.6-flash`, which has shown intermittent `503 UNAVAILABLE` ("high demand") responses on both keys simultaneously during testing. This is external and outside the app's control — do a live smoke test with both keys shortly before demoing, since a double-503 means vision fails outright (there's no third fallback by design).
- Fallback behavior (Gemini primary key → Gemini fallback key) has been verified with genuine failures during testing.
