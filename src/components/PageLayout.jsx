import BrandHeader from './BrandHeader.jsx'
import './PageLayout.css'

function PageLayout({ children, wide = false }) {
  return (
    <div className="page">
      <header className="site-header">
        <div className="page-container page-container--wide">
          <BrandHeader />
        </div>
      </header>
      <main
        className={`page-main screen-enter page-container ${wide ? 'page-container--wide' : ''}`}
      >
        {children}
      </main>
    </div>
  )
}

export default PageLayout
