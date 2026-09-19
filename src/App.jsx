import { useState } from 'react'
import UploadScreen from './screens/UploadScreen.jsx'
import ProcessingScreen from './screens/ProcessingScreen.jsx'
import EarlyExitScreen from './screens/EarlyExitScreen.jsx'
import ResultScreen from './screens/ResultScreen.jsx'
import { analyzeMedicineImages } from './services/ai/visionService.js'
import { verifyMedicine } from './logic/verifyMedicine.js'
import alerts from './data/alerts.json'

const MIN_STEP_DISPLAY_MS = 600

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function App() {
  const [screen, setScreen] = useState('upload')
  const [frontImage, setFrontImage] = useState(null)
  const [step, setStep] = useState(0)
  const [exitVariant, setExitVariant] = useState(null)
  const [missingFields, setMissingFields] = useState([])
  const [result, setResult] = useState(null)

  const handleSubmit = async ({ front, back }) => {
    setFrontImage(front)
    setStep(0)
    setScreen('processing')

    try {
      const extraction = await analyzeMedicineImages([front, back].filter(Boolean))

      setStep(1)
      await wait(MIN_STEP_DISPLAY_MS)

      setStep(2)
      await wait(MIN_STEP_DISPLAY_MS)

      const verification = verifyMedicine(extraction, alerts)

      if (verification.status === 'not_a_drug' || verification.status === 'unreadable') {
        setExitVariant(verification.status)
        setMissingFields(verification.missingFields ?? [])
        setScreen('early_exit')
        return
      }

      setResult({ verification, extraction })
      setScreen('result')
    } catch (err) {
      console.error('Analysis failed:', err)
      setExitVariant('error')
      setMissingFields([])
      setScreen('early_exit')
    }
  }

  const resetToUpload = () => {
    setExitVariant(null)
    setMissingFields([])
    setResult(null)
    setFrontImage(null)
    setScreen('upload')
  }

  if (screen === 'processing') {
    return <ProcessingScreen step={step} frontImage={frontImage} />
  }

  if (screen === 'early_exit') {
    return <EarlyExitScreen variant={exitVariant} missingFields={missingFields} onRetry={resetToUpload} />
  }

  if (screen === 'result') {
    return (
      <ResultScreen
        verification={result.verification}
        extraction={result.extraction}
        onCheckAnother={resetToUpload}
      />
    )
  }

  return <UploadScreen onSubmit={handleSubmit} />
}

export default App
