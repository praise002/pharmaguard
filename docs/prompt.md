You are building a working web app prototype called PharmaGuard for a 
one-day AI hackathon (Social Impact / Health track). This will be demoed 
live to judges, so it must actually work end-to-end, look polished, and 
never make a claim it can't support. Build the complete app now.

## THE PROBLEM WE'RE SOLVING

Nigeria has a serious counterfeit drug problem. The official verification 
system (scratch a code, text it, wait for an SMS reply) is unreliable in 
practice — independent testing has found it frequently fails to respond 
or returns wrong data. Most people never verify what they buy because the 
existing tool is slow and unreliable, not just because they don't care.

PharmaGuard's job: let someone photograph a drug pack and get an instant, 
honest answer — checked against NAFDAC's own real published alerts — 
instead of scratching a panel and waiting for a text that might never come.

## WHAT THIS APP MUST NEVER DO

- NEVER say or imply a drug is "genuine," "safe," or "verified authentic." 
  A photo cannot prove that. The app can only say whether it matches a 
  known problem or not.
- NEVER invent or hallucinate a NAFDAC alert, batch number, or fact. Every 
  claim the app makes must trace back to an entry in the reference dataset 
  below, or to a plain deterministic rule (e.g. "expiry date has passed").
- NEVER skip the disclaimer. It must appear on every single result screen, 
  worded exactly as specified below.
- NEVER guess when the photo isn't a drug at all, or is unreadable. Say so 
  plainly and stop, rather than returning a false "no flags found."

## TECH STACK

- Frontend: React (single page app, mobile-first responsive design)
- AI (primary): Google Gemini API (2.5 Flash or Flash-Lite — vision-capable, 
  free tier). Use it for: (1) checking whether the image is even a medicine 
  package, (2) reading the uploaded photo(s) into structured data, (3) 
  writing the final plain-English explanation with citations.
- AI (fallback): If the Gemini API call fails or times out (>10 seconds), 
  automatically retry the same request against OpenAI's GPT-4V/GPT-4o, 
  using the same prompt and expected JSON schema. Log which provider 
  actually served each request (console log is fine) so the team can 
  debug quickly if Gemini has issues during the live demo.
- Do NOT use AI for the matching/verification logic itself — that must 
  be plain, auditable JavaScript.
- "Backend": no database needed. The reference dataset below is a static 
  JSON file bundled with the app. All logic can run client-side, or via 
  one simple serverless function if you want to keep API keys off the 
  client (use this if time allows, otherwise client-side is fine for 
  the demo).
- No login, no accounts, no persistence between sessions.

## REFERENCE DATASET (embed this exactly as a JSON file, e.g. alerts.json)

[
  {
    "alert_id": "024/2026",
    "type": "counterfeit",
    "product": "Augmentin 625mg Tablets",
    "manufacturer": "GlaxoSmithKline (GSK)",
    "batch_no": "AC3N",
    "issue": "Genuine batch number reused with falsified manufacture/expiry dates",
    "source": "https://nafdac.gov.ng/public-alert-no-024-2026-alert-on-counterfeit-augmentin-625mg-tablets-batch-no-ac3n-in-nigeria/"
  },
  {
    "alert_id": "016/2026",
    "type": "counterfeit",
    "product": "Mabthera 500mg/50ml",
    "manufacturer": "Roche",
    "batch_no": "N2110A09",
    "issue": "Confirmed counterfeit batch, sold suspiciously below normal price",
    "source": "https://nafdac.gov.ng/public-alert-no-016-2026-alert-on-confirmed-counterfeit-of-mabthera-500mg-50ml-in-nigeria/"
  },
  {
    "alert_id": "019/2026",
    "type": "unregistered_all_stock",
    "product": "Otrivin Nasal Drops (0.05% children's, 0.1% adult)",
    "issue": "Marketing Authorization Holder (GSK) confirmed it is not currently importing any Otrivin products — all circulating stock is unregistered/counterfeit",
    "source": "https://nafdac.gov.ng/public-alert-no-019-2026-alert-on-mop-up-of-all-otrivin-nasal-drops-0-05-and-0-1/"
  },
  {
    "alert_id": "036/2026",
    "type": "counterfeit_lookalike",
    "product": "Forxiga (Dapagliflozin)",
    "manufacturer": "AstraZeneca",
    "issue": "Counterfeit products mimicking brand name and logo",
    "source": "https://nafdac.gov.ng/public-alert-no-036-2026-alert-on-suspected-counterfeit-products-mimicking-forxiga-dapagliflozin/"
  },
  {
    "alert_id": "037/2026",
    "type": "counterfeit_lookalike",
    "product": "Pulmicort (Budesonide) Inhalation Suspension",
    "manufacturer": "AstraZeneca",
    "fake_brand_name": "Ulmicort",
    "issue": "Counterfeit product using a name closely mimicking the real brand",
    "source": "https://nafdac.gov.ng/public-alert-no-037-2026-alert-on-suspected-counterfeit-pulmicort-budesonide-inhalation-suspension/"
  },
  {
    "alert_id": "033/2026",
    "type": "voluntary_recall",
    "product": "Sporidex Suspension 125mg/5ml",
    "batch_no": "DFG4606A",
    "issue": "Voluntary recall — quality/safety concern (not confirmed counterfeit)",
    "source": "https://nafdac.gov.ng/public-alert-no-033-2026-alert-on-the-voluntary-recall-of-sporidex-suspension-125-mg-5-ml-batch-no-dfg4606a/"
  },
  {
    "alert_id": "042/2026",
    "type": "counterfeit_antimalarial",
    "product": "Artemether/Lumefantrine 80mg/480mg (brand: BPPL)",
    "fake_reg_no": "02-3457",
    "batch_no": "BP5203",
    "issue": "Registration number confirmed fake — does not exist in NAFDAC database; no manufacturer info on label",
    "source": "https://nafdac.gov.ng/public-alert-no-042-2026-alert-on-the-seizure-of-suspected-substandard-and-falsified-bppl-artemether-lumefantrine-80mg-480mg/"
  },
  {
    "alert_id": "022/2026",
    "type": "counterfeit_lookalike",
    "product": "Colgate Toothpaste",
    "fake_brand_names": ["Coglaet ActivGel 100g", "Coglaet Herbal 100g"],
    "issue": "Unregistered counterfeit products found in Kaduna State",
    "source": "https://nafdac.gov.ng/public-alert-no-022-2026-alert-on-the-distribution-of-unregistered-and-suspected-counterfeit-colgate-toothpaste/"
  },
  {
    "alert_id": "038/2026",
    "type": "foreign_recall",
    "product": "Nitras, Kadin 2, Acefyl, Loratadine 24",
    "issue": "Recalled by Drug Regulatory Authority of Pakistan (DRAP) for quality defects/contamination",
    "source": "https://nafdac.gov.ng/public-alert-no-038-2026-alert-on-adulterated-and-substandard-medicines-nitras-kadin-2-acefyl-and-loratadine-24-recalled-by-the-drug-regulatory-authority-of-pakistan-drap/"
  },
  {
    "alert_id": "028/2026",
    "type": "foreign_recall",
    "product": "Children's Ibuprofen Oral Suspension",
    "issue": "US recall — potential contamination with foreign material",
    "source": "https://nafdac.gov.ng/public-alert-no-028-2026-recall-of-childrens-ibuprofen-oral-suspension-in-the-united-states-due-to-potential-contamination-with-foreign-material/"
  },
  {
    "alert_id": "025/2026",
    "type": "foreign_recall",
    "product": "Citro-Soda Regular Antacid",
    "batch_prefix": "C",
    "issue": "South Africa recall — batches starting with 'C', expiry on/before Nov 2027",
    "source": "https://nafdac.gov.ng/public-alert-no-025-2026-alert-on-the-recall-specific-batches-of-antacid-citro-soda-regular-in-south-africa/"
  },
  {
    "alert_id": "08/2026",
    "type": "foreign_recall_infant_formula",
    "product": "Aptamil / Cow & Gate Infant & Follow-on Milk Formula",
    "manufacturer": "Danone Nutricia",
    "issue": "Precautionary recall — potential cereulide toxin contamination (Nigeria-market product NOT affected)",
    "source": "https://nafdac.gov.ng/public-alert-no-08-2026-danone-nutricia-recalls-several-batches-of-aptamil-and-cow-and-gate-first-infant-milk-and-follow-on-milk-formula-products-due-to-potential-contamination-with-cereulide-toxin/"
  },
  {
    "alert_id": "020/2026",
    "type": "unregistered_fraudulent_claim",
    "product": "ViroActive+",
    "issue": "Unregistered drug falsely purported to cure HIV",
    "source": "https://nafdac.gov.ng/public-alert-no-020-2026-alert-on-unregistered-viroactive-drug-purported-to-cure-hiv/"
  },
  {
    "alert_id": "11/2025",
    "type": "foreign_recall_impurity",
    "product": "Chlorpromazine Hydrochloride Tablets USP 10mg",
    "manufacturer": "Zydus Pharmaceuticals",
    "issue": "US recall — nitrosamine impurity exceeding safety limits",
    "source": "https://nafdac.gov.ng/public-alert-no-11-2025-recall-of-various-products-by-sun-pharma-glenmark-and-zydus-pharmaceuticals-over-manufacturing-issues/"
  }
]

## APP FLOW (build all screens)

### Screen 1: Upload
- Headline: something like "Check a medicine before you take it."
- Clear instructions before the upload button:
  - Take a photo in good light, avoid glare
  - Photograph BOTH the front and back of the pack if possible 
    (back usually has batch number, NAFDAC reg. number, and dates)
  - Keep the whole label in frame and in focus
- Below the instructions, show a short reference card titled "NAFDAC's 
  own tips for spotting fake drugs": bullet list covering Place (buy 
  from licensed pharmacies), Price (be wary of suspiciously cheap 
  prices), Packaging (check for misspellings, blurry print, tampered 
  seals), Product (unusual smell/color/texture). This should be visible 
  BEFORE any AI is involved — it's static reference content.
- An upload/camera control that accepts up to 2 images (front and back). 
  Use <input type="file" accept="image/*" capture="environment" multiple> 
  or two separate upload slots clearly labeled "Front" and "Back" (back 
  optional but encouraged). Show small thumbnail previews of whatever 
  was uploaded before the user submits.

### Screen 2: Processing
- Loading state while image(s) are sent to the AI. Target under 20 
  seconds end to end. Show sequential progress messages, not a bare 
  spinner:
  1. "Checking if this is a medicine package..."
  2. "Reading the label..."
  3. "Checking against NAFDAC alerts..."

### Screen 3a: Not a drug / unreadable (early exit)
If the AI determines the image isn't a medicine package, or extraction 
confidence is too low / key fields are missing, show a distinct, simple 
screen instead of a verdict:
- "Not a drug" case: "This doesn't look like a medicine package. Please 
  upload a clear photo of a drug box, bottle, or blister pack."
- "Unreadable" case: "We couldn't read this clearly. Please try again 
  with better lighting or a closer photo."
- A button to try again, returning to Screen 1.
- Do NOT proceed to any matching logic in either case.

### Screen 3b: Result (main verdict screen)
Structure it exactly like this:

1. A status badge at the top — one of exactly three states, each with 
   distinct color and icon:
   - CONFIRMED ALERT (red) — this exact batch/registration number matches 
     a real NAFDAC alert
   - FLAGGED FOR REVIEW (amber) — something looks inconsistent 
     (mismatched dates, missing registration number, name resembles a 
     known brand) but doesn't match a confirmed alert
   - NO FLAGS FOUND (gray/neutral — NOT green, NOT labeled "safe") — 
     nothing in our current dataset or rules caught an issue

2. Directly under the badge, in every single case, this exact fixed text 
   (not AI-generated, hardcoded in the UI):
   "We cannot confirm from a photo alone whether a drug is genuine or 
   fake. This result only reflects what we could check against NAFDAC's 
   published alerts and basic packaging rules."

3. Below that: the plain-language explanation (AI-generated, via a 
   Gemini/OpenAI call). It must state its reasoning and explicitly cite 
   which alert ID or rule it's based on. Example desired output: 
   "This batch number (AC3N) matches a batch NAFDAC confirmed as 
   counterfeit in Public Alert No. 024/2026. The real manufacturer, GSK, 
   found that although this batch number was genuine, the manufacturing 
   and expiry dates printed on this pack don't match their real records. 
   Source: nafdac.gov.ng, Public Alert 024/2026."

4. A collapsible "What we extracted from your photo" section showing the 
   raw structured data (product name, manufacturer, batch no., reg. no., 
   dates) so a technical judge can see the extraction worked correctly.

5. A "What should I do?" line with a concrete next step depending on 
   status (e.g. confirmed alert → "Do not use this. Return it to point 
   of purchase or report to NAFDAC." / flagged → "We couldn't confirm 
   this — consider asking your pharmacist or checking NAFDAC's 
   Greenbook." / no flags → "No issues found in our data — this does 
   not confirm the product is genuine.")

6. A "Download / print summary" button. On click, generate a clean, 
   plain-text (or simple printable HTML view via window.print()) summary 
   containing: the extracted fields, the verdict status, the cited 
   explanation, and the fixed disclaimer. No new backend needed — this 
   just formats data already in memory. Purpose: let the user save or 
   show this to a pharmacist.

## VERIFICATION LOGIC (build this as plain, testable functions)

1. Accept 1-2 uploaded images (front and/or back of pack).
2. Send image(s) to the vision model with an instruction to FIRST answer: 
   "is this an image of a medicine package/pharmaceutical product?"
   - If NO → status = not_a_drug. Stop here (Screen 3a). Do not run any 
     further checks.
   - If YES → proceed to extraction.
3. Extract structured JSON from the image(s), merging front+back into one 
   object (batch number is often only visible on the back — use whichever 
   image shows each field most clearly):
   {product_name, manufacturer, batch_no, nafdac_reg_no, mfg_date, 
   expiry_date, visible_issues, confidence}
4. If confidence is low or key fields (batch_no, nafdac_reg_no) are both 
   missing → status = unreadable. Stop here (Screen 3a).
5. Check extracted batch_no and nafdac_reg_no against every entry in 
   alerts.json using exact string match (case-insensitive, trim 
   whitespace). A match → status = confirmed_alert, attach that entry.
6. If no exact match, run these deterministic checks:
   - Is expiry_date in the past? → flag
   - Is nafdac_reg_no missing or empty? → flag
   - Fuzzy-match product_name against known brand names in the dataset 
     (e.g. "Coglaet" vs "Colgate", "Ulmicort" vs "Pulmicort") using a 
     simple string similarity function (Levenshtein distance or similar) 
     — if similarity is high but not exact, flag as a possible lookalike
7. If any flags from step 6 → status = flagged, attach the specific 
   reasons.
8. If nothing matched or flagged → status = no_flags_found.
9. Pass this structured result object to the AI (Gemini, falling back to 
   OpenAI on failure/timeout) for the final plain-language, cited 
   explanation. Give it ONLY the structured result and the matched alert 
   entry/entries as context — do not let it access the raw photo or 
   invent additional information.
10. Render the "Download / print summary" from this same structured 
    result plus the AI explanation — no separate data source.

## DEMO-READY REQUIREMENTS

- Must work end-to-end with a real photo of a mocked-up pack showing 
  batch number "AC3N" (Augmentin 625mg — this is the primary demo drug) 
  — this should trigger a confirmed_alert result citing NAFDAC Public 
  Alert 024/2026. Otrivin (no specific batch number needed — any pack 
  labeled Otrivin should trigger the "all stock unregistered" alert 
  019/2026) is the backup demo drug.
- Must correctly handle a non-drug photo (e.g. a phone, a random object) 
  by returning the not_a_drug state, not a false verdict.
- Must gracefully handle a blurry/unreadable photo with the unreadable 
  state rather than guessing.
- Must look clean and professional — mobile-first, clear typography, 
  no placeholder lorem ipsum, no broken layouts. This will be shown on 
  a projector to judges, so text must be readable at a distance.
- Time budget: this needs to be buildable and debuggable within about 
  4-5 hours by a small team. Prioritize the upload → not-a-drug check → 
  extract → match → result flow working reliably over any extra polish.

## WHAT NOT TO BUILD (explicitly out of scope — do not add these)

- No multi-language translation
- No drug dosage/instruction rewriting
- No drug interaction checking (this would require collecting health 
  data like age and medical conditions, which is out of scope)
- No user accounts, no data persistence, no chat interface
- No claim of chemical/physical drug authentication

Build this now as a complete, working React app. Start with the file 
structure, then the alerts.json dataset, then the upload screen (with 
front/back image support), then the Gemini integration with OpenAI 
fallback for the not-a-drug check and extraction, then the verification 
logic, then the result screen with the cited explanation and the 
download/print summary button, then styling. Test the full flow with 
both a real drug photo AND a non-drug photo before considering it done.