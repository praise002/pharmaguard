import { useEffect, useState } from 'react'
import PageLayout from '../components/PageLayout.jsx'
import {
  WarningIcon,
  MinusIcon,
  AlertCircleIcon,
  InfoCircleIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  DownloadIcon,
  RefreshIcon,
} from '../components/icons.jsx'
import { generateExplanation, buildFallbackExplanation } from '../services/ai/explanationService.js'
import { buildSummaryText } from '../logic/buildSummary.js'
import { DISCLAIMER_TEXT, STATUS_LABELS, STATUS_ADVICE } from '../constants.js'
import './ResultScreen.css'

const STATUS_META = {
  confirmed_alert: { tone: 'red', icon: WarningIcon, adviceIcon: AlertCircleIcon },
  flagged: { tone: 'amber', icon: WarningIcon, adviceIcon: InfoCircleIcon },
  no_flags_found: { tone: 'grey', icon: MinusIcon, adviceIcon: InfoCircleIcon },
}

function verdictSubtitle(verification) {
  if (verification.status === 'confirmed_alert') {
    return `Matches NAFDAC Public Alert ${verification.matchedAlert.alert_id}`
  }
  if (verification.status === 'flagged') {
    const count = verification.flags.length
    return `${count} issue${count === 1 ? '' : 's'} found on review`
  }
  return 'This is not a confirmation of authenticity'
}

function sourceLinksFor(verification) {
  const links = []
  if (verification.matchedAlert) {
    links.push(verification.matchedAlert)
  }
  for (const flag of verification.flags) {
    if (flag.relatedAlert) links.push(flag.relatedAlert)
  }
  return links
}

function ResultScreen({ verification, extraction, onCheckAnother }) {
  const meta = STATUS_META[verification.status]
  const Icon = meta.icon
  const AdviceIcon = meta.adviceIcon

  const [explanation, setExplanation] = useState(null)
  const [usedFallback, setUsedFallback] = useState(false)

  useEffect(() => {
    let cancelled = false
    setExplanation(null)
    setUsedFallback(false)

    generateExplanation(verification, extraction)
      .then((result) => {
        if (!cancelled) setExplanation(result.text)
      })
      .catch((err) => {
        console.error('Explanation generation failed, using fallback:', err.message)
        if (!cancelled) {
          setExplanation(buildFallbackExplanation(verification))
          setUsedFallback(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [verification, extraction])

  const handleDownload = () => {
    const summary = buildSummaryText({
      verification,
      extraction,
      explanationText: explanation ?? '',
    })
    const blob = new Blob([summary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'pharmaguard-summary.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  const sourceLinks = sourceLinksFor(verification)

  return (
    <PageLayout>
      <div className="result-screen">
        <div className={`verdict-badge verdict-badge--${meta.tone}`}>
          <span className="verdict-badge__icon">
            <Icon />
          </span>
          <div>
            <h2>{STATUS_LABELS[verification.status].toUpperCase()}</h2>
            <p>{verdictSubtitle(verification)}</p>
          </div>
        </div>

        <div className="disclaimer-box">
          <p>{DISCLAIMER_TEXT}</p>
        </div>

        <div className="result-block">
          <h3>Why this result</h3>
          {explanation ? (
            <p>{explanation}</p>
          ) : (
            <div className="result-block__skeleton" aria-label="Writing explanation…">
              <div className="result-block__skeleton-line" />
              <div className="result-block__skeleton-line" />
              <div className="result-block__skeleton-line" />
            </div>
          )}
          {usedFallback && (
            <p className="result-block__fallback-note">
              AI explanation unavailable right now — showing a data-only summary instead.
            </p>
          )}
          {sourceLinks.map((alert) => (
            <a
              key={alert.alert_id}
              className="result-source-link"
              href={alert.source}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLinkIcon />
              NAFDAC Public Alert {alert.alert_id}
            </a>
          ))}
        </div>

        <details className="extracted-details">
          <summary>
            What we extracted from your photo
            <ChevronDownIcon className="extracted-details__chevron" />
          </summary>
          <table>
            <tbody>
              <tr>
                <td>Product</td>
                <td>{extraction.product_name ?? '—'}</td>
              </tr>
              <tr>
                <td>Manufacturer</td>
                <td>{extraction.manufacturer ?? '—'}</td>
              </tr>
              <tr>
                <td>Active ingredient</td>
                <td>{extraction.active_ingredient ?? '—'}</td>
              </tr>
              <tr>
                <td>Batch number</td>
                <td>{extraction.batch_no ?? '—'}</td>
              </tr>
              <tr>
                <td>NAFDAC reg. no.</td>
                <td>{extraction.nafdac_reg_no ?? '—'}</td>
              </tr>
              <tr>
                <td>Manufacture date</td>
                <td>{extraction.mfg_date ?? '—'}</td>
              </tr>
              <tr>
                <td>Expiry date</td>
                <td>{extraction.expiry_date ?? '—'}</td>
              </tr>
            </tbody>
          </table>
        </details>

        <div className={`advice-box advice-box--${meta.tone}`}>
          <span className="advice-box__icon">
            <AdviceIcon />
          </span>
          <div>
            <h4>What should I do?</h4>
            <p>{STATUS_ADVICE[verification.status]}</p>
          </div>
        </div>

        <div className="result-screen__actions">
          <button type="button" className="btn-ghost" onClick={handleDownload}>
            <DownloadIcon />
            Save summary
          </button>
          <button type="button" className="btn-ghost" onClick={onCheckAnother}>
            <RefreshIcon />
            Check another
          </button>
        </div>
      </div>
    </PageLayout>
  )
}

export default ResultScreen
