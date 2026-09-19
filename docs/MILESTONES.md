# PharmaGuard — Build Milestones

Scoped to a 4–5 hour hackathon build budget. Order matches dependency order — each milestone unblocks the next.

## M0 — Project setup (15–20 min)
- Scaffold React app (Vite recommended: `npm create vite@latest pharmaguard -- --template react`)
- Init git repo, `.env` for API keys (Gemini + OpenAI), add `.env` to `.gitignore`
- Decide client-side-only vs. one serverless function for API calls (client-side is fine if time-pressed)
- Install any deps: nothing exotic needed (no state library required, maybe a fetch wrapper)

## M1 — Static data & reference content (15 min)
- Create `src/data/alerts.json` with the exact dataset from the spec
- Build the static "NAFDAC's own tips for spotting fake drugs" reference card content (no AI needed)

## M2 — Screen 1: Upload UI (30–40 min)
- Headline + instructions + tips card (all static, testable with no API calls)
- Front/back upload slots with thumbnail previews
- Submit button disabled until at least front image present

## M3 — AI integration layer (45–60 min)
- Gemini client: image(s) → structured JSON per the schema (`is_drug` check + extraction, combined or two calls)
- OpenAI fallback: same prompt/schema, triggered on Gemini failure or >10s timeout
- Console log which provider served each request
- Test this in isolation (e.g. a temp script or button) before wiring to UI — this is the riskiest/slowest part, verify it works standalone first

## M4 — Screen 2: Processing UI (15 min)
- Sequential status messages tied to actual call stages (checking → reading → matching), not fake timers if avoidable

## M5 — Verification logic (plain JS, testable) (45 min)
- Exact match against `alerts.json` (batch_no / nafdac_reg_no, case-insensitive/trim)
- Deterministic rule checks: expired date, missing reg no
- Fuzzy brand-name match (Levenshtein) against known fakes (Coglaet/Colgate, Ulmicort/Pulmicort)
- Pure functions — write a few quick manual test cases (confirmed/flagged/no_flags) before touching UI

## M6 — Screen 3a: Not-a-drug / unreadable (15 min)
- Two distinct messages, "try again" button back to Screen 1
- Wire this as an early-exit path so nothing downstream runs

## M7 — Screen 3b: Result screen (45–60 min)
- Status badge (3 states, correct colors — no green "safe" language)
- Hardcoded disclaimer text (verbatim, always visible)
- AI-generated cited explanation (feed it ONLY the structured result + matched alert, never the raw photo)
- Collapsible "what we extracted" section
- "What should I do?" line per status
- Download/print summary (`window.print()` or plain-text blob)

## M8 — Styling pass (30 min)
- Mobile-first layout, legible at projector distance, no lorem ipsum
- Do this last so you're polishing working screens, not fighting CSS mid-logic-build

## M9 — End-to-end testing against demo scenarios (30 min)
- Mocked Augmentin pack, batch "AC3N" → `confirmed_alert` citing 024/2026
- Otrivin pack (any batch) → `confirmed_alert` citing 019/2026
- Non-drug photo (phone, random object) → `not_a_drug`
- Blurry photo → `unreadable`
- Verify Gemini failure path actually falls back to OpenAI (temporarily break the Gemini key to force it)

## M10 — Demo readiness check
- Time the full flow (target <20s)
- Confirm disclaimer appears on every result variant
- Have the two physical mock packs (or good photos of them) ready

## M11 — Deploy to Vercel (15–20 min)
- Push the repo to GitHub (Vercel deploys from a git repo, or via `vercel` CLI directly from the folder)
- Import the project in Vercel (auto-detects Vite: build command `npm run build`, output dir `dist`) or run `vercel` / `vercel --prod` from the CLI
- Add `VITE_GEMINI_API_KEY` and `VITE_OPENAI_API_KEY` as Environment Variables in the Vercel project settings (Settings → Environment Variables) — do not commit `.env`
- Redeploy after adding env vars (Vercel only injects them into new builds)
- Open the deployed URL and re-run the M9 demo scenarios against production, not just localhost — confirms the env vars actually took and CORS/API calls work from the live domain
- This gives a shareable link for judges instead of relying on localhost during the live demo

## M12 — Dockerize (optional, time-permitting) (20–30 min)
- Multi-stage `Dockerfile`: build stage (`node` image, `npm ci && npm run build`) → serve stage (lightweight static server, e.g. `nginx:alpine` or `serve`, copying `dist/`)
- Pass API keys as runtime env vars, not baked into the image — remember they're client-side only if not using the serverless proxy, so this is about portability, not secrecy
- `docker-compose.yml` if useful for one-command local run
- Verify `docker build` + `docker run` serves the app identically to `npm run dev`/`npm run build && npm run preview`
- Treat as a stretch goal — do not let this eat into time needed for M3–M9; a working demo without Docker beats a broken one with it
