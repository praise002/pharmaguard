import { useState } from 'react'
import PageLayout from '../components/PageLayout.jsx'
import TipCard from '../components/TipCard.jsx'
import ImageUploadSlot from '../components/ImageUploadSlot.jsx'
import { CameraIcon, WarningIcon } from '../components/icons.jsx'
import './UploadScreen.css'

const PHOTO_TIPS = [
  'Good light, no glare on the label',
  'Photograph both the front and back of the pack',
  'Keep the whole label in frame and in focus',
]

const NAFDAC_TIPS = [
  <>
    <b>Place</b> — buy from licensed pharmacies
  </>,
  <>
    <b>Price</b> — be wary of suspiciously cheap prices
  </>,
  <>
    <b>Packaging</b> — check for misspellings, blurry print, tampered seals
  </>,
  <>
    <b>Product</b> — notice any unusual smell, color, or texture
  </>,
]

function UploadScreen({ onSubmit }) {
  const [frontFile, setFrontFile] = useState(null)
  const [backFile, setBackFile] = useState(null)

  const canSubmit = frontFile !== null

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({ front: frontFile, back: backFile })
  }

  return (
    <PageLayout wide>
      <div className="upload-grid">
        <div className="upload-grid__heading">
          <h1>Check a medicine before you take it.</h1>
          <p className="upload-screen__lede">
            Photograph a medicine pack and get an instant check against NAFDAC's published
            alerts.
          </p>
        </div>

        <div className="upload-grid__tips">
          <TipCard
            variant="blue"
            icon={<CameraIcon />}
            title="Photo tips"
            rows={PHOTO_TIPS}
          />
          <TipCard
            variant="amber"
            icon={<WarningIcon />}
            title="NAFDAC's own tips for spotting fake drugs"
            rows={NAFDAC_TIPS}
          />
        </div>

        <div className="upload-grid__form">
          <div className="upload-screen__slots">
            <ImageUploadSlot label="Front" required file={frontFile} onChange={setFrontFile} />
            <ImageUploadSlot label="Back" file={backFile} onChange={setBackFile} />
          </div>

          <button
            type="button"
            className="btn-primary upload-screen__submit"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            <CameraIcon />
            Check this medicine
          </button>
        </div>
      </div>
    </PageLayout>
  )
}

export default UploadScreen
