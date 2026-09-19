export async function fileToBase64(file) {
  const bytes = new Uint8Array(await file.arrayBuffer())
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64')
  }
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

const MAX_DIMENSION = 1280
const JPEG_QUALITY = 0.82

/**
 * Downscales + re-encodes a photo as JPEG before it's sent to a vision API.
 * Phone camera photos can be several MB at full resolution, which measurably
 * slows down vision calls (a 2-image, ~1.7MB real-photo pair took over 10s to
 * process uncompressed in testing) without improving read accuracy — the
 * label text is legible at far lower resolution. Browser-only (uses Canvas);
 * no-ops outside a browser so Node-based test scripts are unaffected.
 */
export async function resizeImageForUpload(file) {
  if (typeof document === 'undefined' || typeof createImageBitmap !== 'function') {
    return file
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  if (scale === 1) return file

  const targetWidth = Math.round(bitmap.width * scale)
  const targetHeight = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  canvas.getContext('2d').drawImage(bitmap, 0, 0, targetWidth, targetHeight)
  bitmap.close()

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY))
  if (!blob) return file

  return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' })
}
