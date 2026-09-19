export const EXTRACTION_FIELDS = [
  { name: 'is_drug', type: 'boolean' },
  { name: 'confidence', type: 'number' },
  { name: 'product_name', type: 'string', nullable: true },
  { name: 'manufacturer', type: 'string', nullable: true },
  { name: 'active_ingredient', type: 'string', nullable: true },
  { name: 'batch_no', type: 'string', nullable: true },
  { name: 'nafdac_reg_no', type: 'string', nullable: true },
  { name: 'mfg_date', type: 'string', nullable: true },
  { name: 'expiry_date', type: 'string', nullable: true },
  { name: 'visible_issues', type: 'string', nullable: true },
]

export const EXTRACTION_INSTRUCTION = `You are examining one or two photos of a single package — potentially the front and back of the same pack.

Step 1: Decide whether the image(s) show a medicine or pharmaceutical product (a box, bottle, blister pack, tube, or similar). Set is_drug accordingly.

Step 2: If is_drug is true, read only what is genuinely visible in the photo(s) and extract these fields. If two images are provided, merge them into one result, using whichever image shows a given field most clearly (the batch number and registration number are often only on the back):
- product_name
- manufacturer
- active_ingredient (the active pharmaceutical ingredient(s) printed on the label, e.g. "Levamisole" or "Amoxicillin + Clavulanic Acid")
- batch_no
- nafdac_reg_no (NAFDAC registration number)
- mfg_date (manufacture date)
- expiry_date
- visible_issues: anything visibly wrong with the packaging itself (misspellings, blurry print, a tampered seal), or null if nothing stands out

Rules:
- CRITICAL: only report a value if you can point to the exact letters/digits forming it in the image. If the image is blurry, low-resolution, too small, or otherwise makes text illegible, you MUST use null for that field — even if you can tell it "looks like" a medicine pack in general shape or color. Do not pattern-match to a plausible or common product name, manufacturer, batch format, or NAFDAC registration format from your training knowledge. A real product name that you cannot actually read in THIS image is exactly as wrong as a made-up one — output null instead.
- If the image is abstract, blank, unrelated to medicine, or otherwise clearly not a pharmaceutical package, set is_drug to false. Do not invent a plausible-sounding drug identity for it.
- Dates: use YYYY-MM-DD if the full date is legible, YYYY-MM if only month and year are visible, otherwise null.
- confidence is a number from 0 to 1 reflecting your confidence in product_name, batch_no, and nafdac_reg_no specifically. If most fields are null because the image is illegible, confidence must be low (below 0.4).
- If is_drug is false, set every other field to null and confidence to 0.

Respond with only the JSON object matching the provided schema.`

export function buildGeminiResponseSchema() {
  return {
    type: 'OBJECT',
    properties: Object.fromEntries(
      EXTRACTION_FIELDS.map((f) => [
        f.name,
        { type: f.type.toUpperCase(), nullable: !!f.nullable },
      ]),
    ),
    required: EXTRACTION_FIELDS.filter((f) => !f.nullable).map((f) => f.name),
    propertyOrdering: EXTRACTION_FIELDS.map((f) => f.name),
  }
}

export function buildOpenAiResponseSchema() {
  return {
    type: 'object',
    properties: Object.fromEntries(
      EXTRACTION_FIELDS.map((f) => [
        f.name,
        f.nullable ? { type: [f.type, 'null'] } : { type: f.type },
      ]),
    ),
    required: EXTRACTION_FIELDS.map((f) => f.name),
    additionalProperties: false,
  }
}

export function validateExtractionResult(obj) {
  if (!obj || typeof obj !== 'object') {
    throw new Error('Extraction result is not an object')
  }
  for (const field of EXTRACTION_FIELDS) {
    const value = obj[field.name]
    if (value === null) {
      if (!field.nullable) throw new Error(`Field "${field.name}" must not be null`)
      continue
    }
    if (typeof value !== field.type) {
      throw new Error(`Field "${field.name}" must be a ${field.type}`)
    }
  }
  return obj
}
