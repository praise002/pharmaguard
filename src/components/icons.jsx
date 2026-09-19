export function ShieldIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M12 2 4 5v6.5c0 4.6 3.2 8.9 8 10.5 4.8-1.6 8-5.9 8-10.5V5l-8-3Zm1 13h-2v-2H9v-2h2V9h2v2h2v2h-2v2Z" />
    </svg>
  )
}

export function CameraIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M9 3 7.2 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3H9Zm3 5.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z" />
    </svg>
  )
}

export function WarningIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M12 2 1 21h22L12 2Zm1 14h-2v2h2v-2Zm0-7h-2v5h2V9Z" />
    </svg>
  )
}

export function DocumentIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm-1 15h-2v-2h2v2Zm0-4h-2V9h2v4Z" />
    </svg>
  )
}

export function MinusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M19 13H5v-2h14v2Z" />
    </svg>
  )
}

export function AlertCircleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z" />
    </svg>
  )
}

export function InfoCircleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z" />
    </svg>
  )
}

export function ChevronDownIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M7.4 8.6 12 13.2l4.6-4.6L18 10l-6 6-6-6 1.4-1.4Z" />
    </svg>
  )
}

export function ExternalLinkIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M14 3v2h3.6l-9.8 9.8 1.4 1.4L19 6.4V10h2V3h-7ZM5 5h5V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5h-2v5H5V5Z" />
    </svg>
  )
}

export function DownloadIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M12 16 6 10l1.4-1.4L11 12.2V3h2v9.2l3.6-3.6L18 10l-6 6Zm-7 3h14v2H5v-2Z" />
    </svg>
  )
}

export function RefreshIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M17.6 6.4A8 8 0 1 0 19.7 14h-2.1a6 6 0 1 1-1.4-6.2L13 11h7V4l-2.4 2.4Z" />
    </svg>
  )
}

export function SunIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="4.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <rect key={deg} x="11" y="1" width="2" height="4" rx="1" transform={`rotate(${deg} 12 12)`} />
      ))}
    </svg>
  )
}

export function MoonIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  )
}
