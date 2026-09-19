import { ShieldIcon } from './icons.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import './BrandHeader.css'

function BrandHeader() {
  return (
    <div className="brand-header">
      <div className="brand-header__identity">
        <span className="brand-header__mark">
          <ShieldIcon />
        </span>
        <div>
          <div className="brand-header__wordmark">PharmaGuard</div>
          <div className="brand-header__tagline">Smarter checks. Safer health.</div>
        </div>
      </div>
      <ThemeToggle />
    </div>
  )
}

export default BrandHeader
