import { useEffect, useId, useRef, useState } from 'react'
import { CameraIcon } from './icons.jsx'
import './ImageUploadSlot.css'

function ImageUploadSlot({ label, required, file, onChange }) {
  const inputId = useId()
  const inputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] ?? null
    onChange(selected)
  }

  const handleRemove = () => {
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="upload-slot">
      {previewUrl ? (
        <div className="upload-slot__preview">
          <img src={previewUrl} alt={`${label} preview`} />
          <span className="upload-slot__preview-label">{label}</span>
          <button type="button" className="upload-slot__remove" onClick={handleRemove}>
            Remove
          </button>
        </div>
      ) : (
        <label htmlFor={inputId} className="upload-slot__dropzone">
          <CameraIcon className="upload-slot__icon" aria-hidden="true" />
          <p>{label}</p>
          <small>{required ? 'Required' : 'Optional'}</small>
        </label>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="upload-slot__input"
      />
    </div>
  )
}

export default ImageUploadSlot
