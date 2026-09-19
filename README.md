# PharmaGuard

A web app that lets someone photograph a medicine pack and get an instant, honest check against NAFDAC's own published public alerts — built for a one-day AI hackathon (Social Impact / Health track).

## The problem

Nigeria has a serious counterfeit drug problem. The official verification system (scratch a panel, text a code, wait for an SMS reply) is unreliable in practice, so most people never verify what they buy — not because they don't care, but because the existing tool is slow and unreliable.

PharmaGuard's job is narrower and more honest: check a photographed pack's visible details (batch number, NAFDAC registration number, active ingredient, expiry date, brand name) against NAFDAC's real published alerts and a handful of deterministic packaging rules, and say plainly what was and wasn't found — never more than that.

## What this app will never do

These aren't aspirational — they're enforced in the prompts, the verification logic, and the UI copy:

- **Never claim a drug is "genuine," "safe," or "verified authentic."** A photo can't prove that. The badge states only whether a pack matches a *known problem* or not — the "no flags found" state is deliberately gray, never green.
- **Never invent a fact.** Every claim traces back to an entry in `src/data/alerts.json` or a plain deterministic rule (e.g. "expiry date has passed"). The AI extraction prompt explicitly forbids reporting a value that "looks plausible" but isn't actually legible in the photo.
- **The disclaimer is always shown**, worded identically, on every result screen: *"We cannot confirm from a photo alone whether a drug is genuine or fake. This result only reflects what we could check against NAFDAC's published alerts and basic packaging rules."*
- **Never guesses on a bad photo.** If the image isn't a medicine package, or key fields can't be read, the app says so and stops — it does not fall through to a false "no flags found."

## How it works

1. **Upload** — front (required) + back (optional) photos of a pack, alongside NAFDAC's own tips for spotting fakes (static content, no AI involved).
2. **Vision extraction** — the photo(s) are sent to a vision model with instructions to (a) confirm it's actually a medicine package, and (b) extract structured fields: product name, manufacturer, active ingredient, batch number, NAFDAC reg. no., manufacture/expiry dates. Images are downscaled client-side first (max 1280px edge, JPEG) to keep this fast.
3. **Verification** — plain, deterministic JavaScript (no AI) checks the extracted fields against `alerts.json`:
   - Exact batch number or registration number match → `confirmed_alert`
   - Whole-product-line alerts (e.g. a manufacturer confirmed as not importing a product at all) or active-ingredient-wide recalls (e.g. a Levamisole recall applying to any brand) → also `confirmed_alert`, matched by product name or ingredient instead of batch
   - Expired date, missing registration number, or a brand name that fuzzy-matches a known lookalike (Damerau-Levenshtein distance) → `flagged`
   - Nothing matched or flagged → `no_flags_found`
   - Confidence too low, or both batch/reg number missing → `unreadable` (stops here, no further processing, and tells the user exactly which fields it couldn't read)
   - Not a medicine package at all → `not_a_drug` (stops here)
4. **Explanation** — only for the three verdict states, a second AI call generates a short, plain-language explanation. It's given *only* the structured verification result and the matched alert (never the raw photo), and is required to correctly identify which field actually caused a match rather than assuming it was always the batch number.
5. **Result** — status badge, the fixed disclaimer, the cited explanation with a link to the real NAFDAC source, a collapsible "what we extracted from your photo" table, a concrete next step, and a downloadable plain-text summary.

### AI provider strategy

Two independent AI use cases, each with a primary/fallback pair running in *opposite* directions:

| Use case | Primary | Fallback | Why |
|---|---|---|---|
| Vision (image → structured data) | Gemini (`gemini-2.5-flash`) | OpenAI (`gpt-4o`) | |
| Explanation (structured data → prose) | OpenAI (`gpt-4o`) | Gemini (`gemini-2.5-flash`) | |

Both extraction calls run at `temperature: 0` — this matters more than it sounds: an earlier version without it caused a model to fabricate a complete fake product (name, manufacturer, batch number, NAFDAC reg. no.) for an image that had no readable text at all. Fixed by pinning temperature and hardening the prompt; see `test-images/README.md` for the full writeup.

## Project structure

```
src/
  screens/            UploadScreen, ProcessingScreen, ResultScreen, EarlyExitScreen
  components/          PageLayout, BrandHeader, ThemeToggle, TipCard, ImageUploadSlot, icons
  services/ai/         geminiClient, openaiClient, visionService, explanationService,
                        explanationPrompt, schema (shared extraction schema/prompt), imageUtils
  logic/               verifyMedicine (pure JS verification), stringSimilarity, buildSummary
  data/alerts.json      the NAFDAC alert dataset (bundled, static — no database)
  constants.js          disclaimer text, status labels/advice (single source of truth)
test-images/            fixtures for manual + scripted end-to-end testing, with a README
  README.md             what each fixture covers and its last verified outcome
scripts/test-e2e.mjs    runs the real extraction → verification pipeline against test-images/
MILESTONES.md           the build plan this project was executed against
TODO.md                 running progress log — what's done, what's left, and why
DEMO_READINESS.md       timing/disclaimer/prop-readiness check before a live demo
```

## Tech stack

- **Frontend**: React 19 + Vite, plain CSS (no framework), mobile-first responsive design
- **AI**: Google Gemini API (vision-capable, free tier) and OpenAI GPT-4o, used as described above
- **Verification logic**: plain, auditable JavaScript — deliberately *not* AI, so every "flagged" or "confirmed" reason is traceable and testable
- **Data**: a static bundled JSON file (`alerts.json`) — no backend, no database, no accounts, nothing persists between sessions
- **Deployment target**: static site (Vercel or any static host / the included Docker setup)

## Getting started

### Prerequisites

- Node.js 20+ (developed against Node 24)
- A [Google Gemini API key](https://aistudio.google.com/apikey) (free tier is fine)
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Setup

```bash
npm install
```

Create a `.env` file in the project root:

```
VITE_GEMINI_API_KEY=your-gemini-key
VITE_OPENAI_API_KEY=your-openai-key
```

> The `VITE_` prefix is required — Vite only exposes prefixed variables to client-side code. Keys are bundled into the client-side JavaScript at build time (this app has no backend), which is an accepted tradeoff for a hackathon demo — see `TODO.md` for the reasoning. Do not commit `.env`.

```bash
npm run dev
```

Open the printed local URL. Uploading a photo requires real API keys with quota available — see `test-images/` for fixtures if you want to test without a physical pack.

### Other scripts

```bash
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run lint      # oxlint
```

## Testing

There's no traditional test runner wired into `npm test` — verification was done with real API calls throughout the build (see `TODO.md` for the full history), plus two reusable pieces:

```bash
# Full extraction -> verification pipeline against the fixtures in test-images/,
# using real Gemini/OpenAI calls
node --env-file=.env scripts/test-e2e.mjs
```

See `test-images/README.md` for what each fixture covers, its expected outcome, and notes on a couple of things that were genuinely tricky to test correctly (an active-ingredient-wide recall that isn't a batch or brand match; a real-photo case that's legitimately ambiguous).

## Running with Docker

```bash
docker compose up --build
```

Reads `VITE_GEMINI_API_KEY`/`VITE_OPENAI_API_KEY` from your local `.env` and passes them as build args (Vite inlines them into the client bundle at build time — the same as any static host's build step — so they can't be supplied as plain container-runtime env vars). Serves on `http://localhost:8080`.

## Known limitations

- **No physical mock packs yet** for the spec's suggested demo drugs (a pack printed with batch `AC3N`, and an Otrivin pack) — `test-images/` has synthetic (rendered-text) versions that validate the pipeline but aren't a substitute for a real prop in a live demo. A real Levamisole-containing product (Retrax Worm Syrup) is available as a photographed fixture and triggers a `confirmed_alert` via active-ingredient matching.
- **Gemini's free tier caps at 20 requests/day.** The app transparently falls back to OpenAI when this is hit, but expect to see `[vision] gemini failed, falling back to openai` in the console during heavy testing.
- **No backend.** API keys are visible in the shipped client bundle. Fine for a demo with free-tier keys; not appropriate for a deployment with real usage limits or billing exposure without adding a serverless proxy.
- **Not deployed yet.** `MILESTONES.md` has the planned Vercel deployment steps.

## Explicitly out of scope

No multi-language translation, no dosage/instruction rewriting, no drug interaction checking, no user accounts or persistence, no chat interface, and no claim of chemical/physical drug authentication — a photo can never prove that, so the app doesn't pretend otherwise.
