import PageLayout from '../components/PageLayout.jsx'
import { CameraIcon, DocumentIcon, WarningIcon, AlertCircleIcon } from '../components/icons.jsx'
import './EarlyExitScreen.css'

const VARIANTS = {
  not_a_drug: {
    icon: WarningIcon,
    heading: "This doesn't look like a medicine",
    message:
      "This doesn't look like a medicine package. Please upload a clear photo of a drug box, bottle, or blister pack.",
  },
  unreadable: {
    icon: DocumentIcon,
    heading: "We couldn't read this clearly",
    message: "We couldn't read this clearly. Please try again with better lighting or a closer photo.",
  },
  error: {
    icon: AlertCircleIcon,
    heading: 'Something went wrong',
    message:
      "We couldn't check this photo right now — this is usually a temporary connection or service issue. Please try again in a moment.",
  },
}

function EarlyExitScreen({ variant, missingFields = [], onRetry }) {
  const { icon: Icon, heading, message } = VARIANTS[variant]

  return (
    <PageLayout>
      <div className="early-exit-screen">
        <span className="early-exit-screen__icon">
          <Icon />
        </span>
        <h2>{heading}</h2>
        <p>{message}</p>
        {variant === 'unreadable' && missingFields.length > 0 && (
          <div className="early-exit-screen__missing">
            <p className="early-exit-screen__missing-label">We couldn't clearly read:</p>
            <ul>
              {missingFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </div>
        )}
        <button type="button" className="btn-primary early-exit-screen__retry" onClick={onRetry}>
          <CameraIcon />
          Try again
        </button>
      </div>
    </PageLayout>
  )
}

export default EarlyExitScreen
