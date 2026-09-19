export function buildExplanationPrompt(verification, extraction) {
  const context = {
    status: verification.status,
    extracted: {
      product_name: extraction.product_name,
      manufacturer: extraction.manufacturer,
      active_ingredient: extraction.active_ingredient,
      batch_no: extraction.batch_no,
      nafdac_reg_no: extraction.nafdac_reg_no,
      mfg_date: extraction.mfg_date,
      expiry_date: extraction.expiry_date,
    },
    matched_alert: verification.matchedAlert ?? null,
    flags: verification.flags ?? [],
  }

  return `You are writing the result explanation for a medicine-checking app called PharmaGuard. Base your answer ONLY on the JSON data below — do not use any outside knowledge about this product, and do not invent, assume, or add any fact that isn't present in this data.

Data:
${JSON.stringify(context, null, 2)}

Write a short, plain-language explanation (2-4 sentences) for a general audience explaining why this result was reached.
- If status is "confirmed_alert": first work out WHICH extracted field actually connects this pack to matched_alert — compare "extracted" against matched_alert's own fields (it could be batch_no, nafdac_reg_no, product_name matching a whole-stock-unregistered alert, or active_ingredient matching an ingredient-wide recall — don't assume it's always batch or registration number). State that specific connection accurately, then summarize the matched_alert's "issue" field in plain language.
- If status is "flagged": explain each entry in "flags" in plain language (don't just repeat the flag type verbatim).
- If status is "no_flags_found": state plainly that nothing in the dataset or packaging rules caught an issue, without implying the product is genuine or safe.

Never claim the drug is "genuine," "safe," or "verified authentic" — you can only describe what was or wasn't found.
${
  verification.matchedAlert
    ? `End with exactly this line: "Source: nafdac.gov.ng, Public Alert ${verification.matchedAlert.alert_id}".`
    : 'matched_alert is null for this result. Do NOT write the word "Source" anywhere in your response — there is no confirmed alert to cite.'
}

Respond with only the explanation text — no preamble, no markdown formatting, no headings.`
}
