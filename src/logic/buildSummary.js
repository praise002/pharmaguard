import { DISCLAIMER_TEXT, STATUS_LABELS } from '../constants.js'

export function buildSummaryText({ verification, extraction, explanationText }) {
  const lines = []

  lines.push('PharmaGuard — Medicine Check Summary')
  lines.push('='.repeat(40))
  lines.push('')
  lines.push(`Result: ${STATUS_LABELS[verification.status]}`)
  if (verification.status === 'confirmed_alert') {
    lines.push(`Matched NAFDAC alert: ${verification.matchedAlert.alert_id}`)
  }
  lines.push('')

  lines.push('What we extracted from your photo:')
  lines.push(`  Product: ${extraction.product_name ?? 'Not detected'}`)
  lines.push(`  Manufacturer: ${extraction.manufacturer ?? 'Not detected'}`)
  lines.push(`  Active ingredient: ${extraction.active_ingredient ?? 'Not detected'}`)
  lines.push(`  Batch number: ${extraction.batch_no ?? 'Not detected'}`)
  lines.push(`  NAFDAC reg. no.: ${extraction.nafdac_reg_no ?? 'Not detected'}`)
  lines.push(`  Manufacture date: ${extraction.mfg_date ?? 'Not detected'}`)
  lines.push(`  Expiry date: ${extraction.expiry_date ?? 'Not detected'}`)
  lines.push('')

  lines.push('Explanation:')
  lines.push(`  ${explanationText}`)
  lines.push('')

  lines.push('Disclaimer:')
  lines.push(`  ${DISCLAIMER_TEXT}`)

  return lines.join('\n')
}
