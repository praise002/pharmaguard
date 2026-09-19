import './TipCard.css'

function TipCard({ variant, icon, title, rows }) {
  return (
    <div className={`tip-card tip-card--${variant}`}>
      <div className="tip-card__head">
        <span className="tip-card__icon">{icon}</span>
        {title}
      </div>
      <ul className="tip-card__list">
        {rows.map((row, i) => (
          <li key={i}>{row}</li>
        ))}
      </ul>
    </div>
  )
}

export default TipCard
