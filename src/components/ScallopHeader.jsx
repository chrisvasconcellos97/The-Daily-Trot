import C from '../colors'

export default function ScallopHeader({ title, subtitle, onBack }) {
  return (
    <div className="scallop-header" style={{ position: 'relative' }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: 52,
            left: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: C.white,
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
            borderRadius: 8,
          }}
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      <div style={{ paddingLeft: onBack ? 40 : 0 }}>
        <div className="scallop-header__title">{title}</div>
        {subtitle && <div className="scallop-header__subtitle">{subtitle}</div>}
      </div>
      <svg
        viewBox="0 0 430 20"
        style={{ position: 'absolute', bottom: -19, left: 0, width: '100%', display: 'block' }}
        aria-hidden="true"
      >
        <path
          d="M0,0 Q10.75,20 21.5,0 Q32.25,20 43,0 Q53.75,20 64.5,0 Q75.25,20 86,0 Q96.75,20 107.5,0 Q118.25,20 129,0 Q139.75,20 150.5,0 Q161.25,20 172,0 Q182.75,20 193.5,0 Q204.25,20 215,0 Q225.75,20 236.5,0 Q247.25,20 258,0 Q268.75,20 279.5,0 Q290.25,20 301,0 Q311.75,20 322.5,0 Q333.25,20 344,0 Q354.75,20 365.5,0 Q376.25,20 387,0 Q397.75,20 408.5,0 Q419.25,20 430,0 Z"
          fill="#F5EEE0"
        />
      </svg>
    </div>
  )
}
