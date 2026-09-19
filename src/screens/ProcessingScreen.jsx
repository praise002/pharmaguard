import { useEffect, useState } from 'react'
import PageLayout from '../components/PageLayout.jsx'
import { CameraIcon, ShieldIcon } from '../components/icons.jsx'
import './ProcessingScreen.css'

function SearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M10 2a8 8 0 1 0 4.9 14.32l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0 0 10 2Zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" />
    </svg>
  )
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
    </svg>
  )
}

const STEPS = [
  {
    icon: CameraIcon,
    title: 'Checking if this is a medicine package...',
    subtitle: 'Confirming this is a drug package',
  },
  {
    icon: SearchIcon,
    title: 'Reading the label...',
    subtitle: 'Extracting batch, registration, and dates',
  },
  {
    icon: ShieldIcon,
    title: 'Checking against NAFDAC alerts...',
    subtitle: 'Matching against published alerts',
  },
]

function ProcessingScreen({ step, frontImage }) {
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    if (!frontImage) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(frontImage)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [frontImage])

  return (
    <PageLayout>
      <div className="processing-screen">
        <h2>Checking your medicine</h2>

        {previewUrl && (
          <div className="processing-screen__packshot">
            <img src={previewUrl} alt="Uploaded medicine pack" />
          </div>
        )}

        <ul className="processing-screen__steps">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const state = i < step ? 'done' : i === step ? 'live' : 'idle'
            return (
              <li key={s.title} className={`processing-step processing-step--${state}`}>
                <span className="processing-step__icon">
                  {state === 'done' ? <CheckIcon /> : <Icon />}
                </span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.subtitle}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </PageLayout>
  )
}

export default ProcessingScreen
