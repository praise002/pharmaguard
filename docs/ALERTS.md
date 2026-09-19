# Alerts dataset — what's in it, and does the trigger actually work

`src/data/alerts.json` has 13 entries. This doc summarizes each one **and** states, for each, whether photographing that exact product would actually produce `confirmed_alert` (or at least `flagged`) in the current code — verified by running each alert's own real data through `verifyMedicine()` directly, not by inspection. See `docs/PIPELINE.md` for how the matching logic itself works.

**Legend**: ✅ confirmed_alert works · 🟡 only reaches flagged (fuzzy name match) · ❌ produces no_flags_found even on a perfect photo of the exact recalled product — the trigger doesn't exist yet.

> **Update**: this was originally 15 entries with 6 fully non-functional. Two (028/2026 Children's Ibuprofen, 08/2026 Aptamil) had no data to match on at all and were removed. The other four (11/2025, 020/2026, 025/2026, 038/2026) have been fixed — see "What changed" below.

## ✅ Will produce `confirmed_alert`

| Alert | Product | What happened | Matched by |
|---|---|---|---|
| 024/2026 | Augmentin 625mg (GSK), batch **AC3N** | Genuine batch number reused with falsified manufacture/expiry dates | exact `batch_no` |
| 016/2026 | Mabthera 500mg/50ml (Roche), batch **N2110A09** | Confirmed counterfeit batch, sold suspiciously cheap | exact `batch_no` |
| 033/2026 | Sporidex Suspension, batch **DFG4606A** | Voluntary recall — quality concern, not confirmed counterfeit | exact `batch_no` |
| 042/2026 | Artemether/Lumefantrine (brand BPPL), batch **BP5203**, reg. no. **02-3457** | Registration number confirmed fake — doesn't exist in NAFDAC's database | exact `batch_no` **or** exact fake `nafdac_reg_no` (either alone triggers it) |
| 025/2026 | Citro-Soda Regular Antacid, batches starting **"C"** | South Africa recall, expiry on/before Nov 2027 | `batch_no` prefix match *(fixed — see below)* |
| 019/2026 | Otrivin Nasal Drops (all strengths) | GSK confirmed it isn't importing *any* Otrivin — every unit in Nigeria is unregistered | product name, via `whole_stock_alert` flag |
| 020/2026 | ViroActive+ | Unregistered drug falsely purported to cure HIV | product name, via `whole_stock_alert` flag *(fixed — see below)* |
| 030/2026 | Any **Levamisole**-containing medicine (e.g. Retrax) | EU withdrawal — risk of a serious neurological condition | active ingredient |
| 11/2025 | Chlorpromazine HCl 10mg (Zydus) | US recall — nitrosamine impurity above safety limits | active ingredient *(fixed — see below)* |

**024/2026** (synthetic) and **030/2026** (real Retrax photo) have been tested against a photo end-to-end. The rest have a verified-working mechanism (confirmed via direct code testing, not just inspection) but no test image yet — see `test-images/README.md`.

## 🟡 Will only produce `flagged`, and only if the fake name is spelled close enough

These have no batch number, registration number, or active ingredient to match on — the only path to catching them is the fuzzy brand-name check, which compares the *first word* of the photographed name against the first word of the real product name (Damerau-Levenshtein similarity ≥ 0.65). Verified: photographing the documented fake name produces `flagged`; photographing the genuine name (correctly) produces `no_flags_found`.

| Alert | Real brand | Fake name that would get caught |
|---|---|---|
| 037/2026 | Pulmicort (Budesonide), AstraZeneca | "Ulmicort" |
| 022/2026 | Colgate Toothpaste | "Coglaet ActivGel" / "Coglaet Herbal" |
| 036/2026 | Forxiga (Dapagliflozin), AstraZeneca | any close misspelling (no documented fake name in the dataset) |
| 038/2026 | Nitras, Kadin 2, Acefyl, Loratadine 24 (4 products, one alert) | any close misspelling of **any** of the 4 names *(fixed — see below)* |

Note: the dataset actually stores fake names for two of these (`fake_brand_name` / `fake_brand_names` fields), but the matching code never reads them directly — it re-derives similarity generically instead. It happens to work here because the real fuzzy match is good enough, but it's not using the data we already have.

## What changed (this pass)

Two alerts had no batch number, registration number, or active ingredient to match on at all, and no realistic path to one — **028/2026** (Children's Ibuprofen) and **08/2026** (Aptamil/Cow & Gate) were removed from the dataset rather than kept as dead weight.

The other four non-functional alerts were fixed, each verified by direct testing (not just code review) before and after:

- **11/2025 (Chlorpromazine)** — added `"active_ingredient": "Chlorpromazine"`. Same mechanism as Levamisole (030/2026); zero code changes needed.
- **020/2026 (ViroActive+)** — added a `"whole_stock_alert": true` flag (also added to 019/2026 Otrivin). The matcher previously keyed this behavior off `type === "unregistered_all_stock"`, which only matched Otrivin's specific type string. Deliberately used a separate flag rather than just renaming ViroActive+'s type: `type` is a *descriptive category* for humans reading the dataset, while "does the whole product line count as bad regardless of batch" is a *matching behavior* — the two alerts are structurally similar but bad for different real-world reasons (a legitimate manufacturer halting imports vs. a drug that was never approved at all), so a dedicated flag scales to a third case later without hijacking `type` again.
- **025/2026 (Citro-Soda)** — added prefix matching to `findExactAlertMatch`: `alert.batch_prefix` (already present in the data, never read) is now checked against the start of the extracted batch number. Verified a batch genuinely starting with "C" now confirms.
- **038/2026 (Nitras/Kadin/Acefyl/Loratadine)** — `findBrandLookalike` previously only ever compared against the *first* product name in a comma-separated `product` field. Now splits on commas and checks every name. Verified: near-miss spellings of all 4 names (previously only the first was reachable) now correctly flag.

All 20 existing unit tests plus the full real-API end-to-end suite (`scripts/test-e2e.mjs`) still pass after these changes — see `docs/TODO.md`.
