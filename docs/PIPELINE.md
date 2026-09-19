# How a photo becomes a verdict

Every box below is a real step in the code. Every JSON snippet is real output from an actual test run — nothing here is invented. Follow the Retrax example if you want to see the "unique" active-ingredient match end to end.

Vision extraction (Gemini) → deterministic verification (plain JS, no AI) → explanation (OpenAI) → result screen.

## The full flow

```mermaid
flowchart TD
    A["📷 Upload<br/>front + back photos"] --> B["Resize client-side<br/>max 1280px, JPEG"]
    B --> C{{"Gemini — primary key<br/>10s timeout"}}
    C -->|success| E["Structured JSON extracted<br/>batch_no, active_ingredient, dates…"]
    C -->|fails / times out| D{{"Gemini — fallback key<br/>10s timeout"}}
    D -->|success| E
    D -->|fails / times out| ERR["⚠️ Error screen<br/>'Something went wrong, try again'"]
    E --> F{"is_drug?"}
    F -->|false| NOTDRUG["🚫 not_a_drug — STOP<br/>no verification, no AI call"]
    F -->|true| H{"confidence < 0.5, OR<br/>batch_no + reg_no both empty?"}
    H -->|yes| UNREAD["❓ unreadable — STOP<br/>screen lists exactly which<br/>fields couldn't be read"]
    H -->|no| J{{"findExactAlertMatch()<br/>plain JS vs alerts.json"}}
    J -->|"batch_no matches"| CONFIRMED["🔴 confirmed_alert"]
    J -->|"reg_no matches a<br/>known-fake number"| CONFIRMED
    J -->|"product name matches an<br/>unregistered-whole-stock alert"| CONFIRMED
    J -->|"active_ingredient matches<br/>an ingredient-wide recall"| CONFIRMED
    J -->|no match| L{{"collectFlags()<br/>plain JS"}}
    L -->|expiry date passed| FLAGGED["🟡 flagged"]
    L -->|reg_no missing| FLAGGED
    L -->|"brand name resembles a<br/>known one (fuzzy match)"| FLAGGED
    L -->|none of the above| NOFLAGS["⚪ no_flags_found"]
    CONFIRMED --> O{{"OpenAI<br/>generateExplanation()"}}
    FLAGGED --> O
    NOFLAGS --> O
    O -->|success| RESULT["✅ Result screen<br/>badge + disclaimer + AI explanation"]
    O -->|fails, no AI fallback| RESULT2["✅ Result screen<br/>badge + disclaimer + template<br/>explanation instead"]

    classDef confirmed fill:#fdecec,stroke:#e03e3e,stroke-width:2px,color:#7a1f1f
    classDef flagged fill:#fef4e2,stroke:#f59e0b,stroke-width:2px,color:#7a4e06
    classDef noflags fill:#eff3f6,stroke:#7d95a3,stroke-width:2px,color:#3a4a54
    classDef stopstyle fill:#eef4f5,stroke:#4a6373,stroke-width:2px,color:#0e2a3b
    classDef errstyle fill:#fdecec,stroke:#e03e3e,stroke-width:2px,color:#7a1f1f,stroke-dasharray: 4 3
    classDef aistyle fill:#e9f1fd,stroke:#1464d2,stroke-width:2px,color:#0b3f83
    classDef resultstyle fill:#e7f7f1,stroke:#10b981,stroke-width:2px,color:#0d5c43

    class CONFIRMED confirmed
    class FLAGGED flagged
    class NOFLAGS noflags
    class NOTDRUG,UNREAD stopstyle
    class ERR errstyle
    class C,D,O aistyle
    class RESULT,RESULT2 resultstyle
```

**Legend**: 🔴 confirmed alert · 🟡 flagged · ⚪/🚫/❓ no flags or early stop · 🔷 an AI call · 🟢 final result screen.

> If your Markdown viewer doesn't render Mermaid (GitHub, VS Code with the Mermaid extension, and most modern renderers do), the same diagram is published as an interactive artifact: https://claude.ai/artifact/KFPie9s5YfFNK65hWLn7yv

## Worked examples

Real extraction → real verification → real AI explanation, from actual test runs.

### Retrax Worm Syrup — the unique one

**Status: `confirmed_alert`** — matched by **active ingredient**, not batch number or brand name. The only alert in the dataset that works this way.

**1. Gemini extracts this from the photo:**

```json
{
  "is_drug": true,
  "confidence": 0.95,
  "product_name": "RETRAX Worm Syrup",
  "manufacturer": "REALS",
  "active_ingredient": "Levamisole 40mg/5ml",
  "batch_no": "RN 262",
  "nafdac_reg_no": "04-3940",
  "mfg_date": "2025-11",
  "expiry_date": "2028-10",
  "visible_issues": null
}
```

↓ plain JS checks this against `alerts.json` — no AI involved

**2. `verifyMedicine()` finds this alert entry:**

```json
{
  "alert_id": "030/2026",
  "type": "foreign_recall_neurological_risk",
  "product": "Levamisole-containing medicines",
  "active_ingredient": "Levamisole",
  "issue": "Withdrawal from the EU market endorsed by Italy's AIFA after an EU-wide review found the benefits no longer outweigh the risk of leukoencephalopathy…"
}
```

> **Why it matched:** `"levamisole 40mg/5ml".includes("levamisole")` → `true`. That's the entire check — a lowercase, trimmed substring comparison. `batch_no: "RN 262"` and `nafdac_reg_no: "04-3940"` match nothing in the dataset; they're irrelevant to this decision.

↓ result object passed to OpenAI — only this JSON, never the photo

**3. OpenAI writes the explanation:**

> "This result was reached because the active ingredient in Retrax Worm Syrup, Levamisole, matches the active ingredient specified in a recall alert. The alert involves levamisole-containing medicines that have been withdrawn from the EU market after a review found that the potential risk of developing a severe neurological condition called leukoencephalopathy outweighs the benefits."
>
> Source: nafdac.gov.ng, Public Alert 030/2026

---

### Augmentin, batch AC3N

**Status: `confirmed_alert`** — matched the ordinary way: exact batch number match.

**1. Extraction:**

```json
{ "batch_no": "AC3N", "nafdac_reg_no": "04-1234", "product_name": "Augmentin 625mg" }
```

↓ `normalize(batch_no) === normalize(alert.batch_no)` → match on alert `024/2026`

**2. Explanation:**

> "…the batch number 'AC3N' matches a real NAFDAC alert regarding counterfeit issues with this product… the batch number is genuine but has incorrect date labels, suggesting the product may be counterfeit."
>
> Source: nafdac.gov.ng, Public Alert 024/2026

---

### Augmentin, no alert match

**Status: `flagged`** — no exact match found, falls through to deterministic rule checks.

**1. Extraction:**

```json
{ "batch_no": "786627", "nafdac_reg_no": null, "expiry_date": "2019-08" }
```

↓ `collectFlags()`: expiry < today? yes. reg_no empty? yes.

**2. Flags produced (plain JS, no AI):**

```json
[
  { "type": "expired", "message": "…expiry date (2019-08) has already passed." },
  { "type": "missing_reg_no", "message": "No NAFDAC registration number is visible…" }
]
```

**3. Explanation:**

> "…flagged because the expiration date shown on the package has already passed, having expired in August 2019. Additionally, there is no visible NAFDAC registration number on the pack…"

---

### Non-drug photo & blurry photo

**Status: `not_a_drug` / `unreadable`** — both stop *before* verification and *before* any explanation call. No wasted API cost, no guessing.

```json
{ "is_drug": false, "confidence": 0, "product_name": null }
```
↓ `is_drug` is false → STOP, screen says "doesn't look like a medicine"

```json
{ "is_drug": true, "confidence": 0.3, "batch_no": null, "nafdac_reg_no": null, "visible_issues": "Blurry print" }
```
↓ confidence < 0.5 AND both key fields empty → STOP, screen lists: *Product name, Batch number, NAFDAC registration number, Expiry date*

---

Every value above came from real API calls against real (or realistic synthetic) test images in `test-images/`. Matching logic lives entirely in `src/logic/verifyMedicine.js` — no AI runs during that step.
