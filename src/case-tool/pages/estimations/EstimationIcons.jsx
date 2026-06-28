export function HeaderIconShell({ children, accent }) {
  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 12,
        background: accent + '14',
        border: `1px solid ${accent}2e`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  )
}

export function IconFuzzy({ color = 'currentColor', size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="24" r="12" stroke={color} strokeWidth="2.5" fill={color} fillOpacity="0.12" />
      <circle cx="30" cy="24" r="12" stroke={color} strokeWidth="2.5" fill={color} fillOpacity="0.12" />
      <line x1="24" y1="13" x2="24" y2="35" stroke={color} strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  )
}

export function IconAnalogy({ color = 'currentColor', size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="10" width="14" height="10" rx="2" stroke={color} strokeWidth="2.5" />
      <rect x="28" y="28" width="14" height="10" rx="2" stroke={color} strokeWidth="2.5" />
      <path d="M20 15 Q36 15 36 28" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      <polyline points="32,24 36,28 40,24" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconExpert({ color = 'currentColor', size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="12" height="9" rx="2" stroke={color} strokeWidth="2.5" />
      <rect x="28" y="8" width="12" height="9" rx="2" stroke={color} strokeWidth="2.5" />
      <rect x="18" y="31" width="12" height="9" rx="2" stroke={color} strokeWidth="2.5" />
      <line x1="14" y1="17" x2="24" y2="31" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="34" y1="17" x2="24" y2="31" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconDecomposition({ color = 'currentColor', size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="6" width="12" height="8" rx="2" stroke={color} strokeWidth="2.5" />
      <rect x="4" y="34" width="10" height="8" rx="2" stroke={color} strokeWidth="2.5" />
      <rect x="19" y="34" width="10" height="8" rx="2" stroke={color} strokeWidth="2.5" />
      <rect x="34" y="34" width="10" height="8" rx="2" stroke={color} strokeWidth="2.5" />
      <line x1="24" y1="14" x2="24" y2="24" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="24" x2="9" y2="34" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="24" x2="24" y2="34" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="24" x2="39" y2="34" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconStoryPoints({ color = 'currentColor', size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="8" y1="8" x2="8" y2="40" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="8" y1="40" x2="42" y2="40" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <polyline points="8,36 16,26 24,30 32,16 42,10" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="26" r="2.5" fill={color} />
      <circle cx="24" cy="30" r="2.5" fill={color} />
      <circle cx="32" cy="16" r="2.5" fill={color} />
    </svg>
  )
}

export function IconComparison({ color = 'currentColor', size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="9" y1="39" x2="39" y2="39" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="11" y="23" width="6" height="12" rx="2" fill={color} fillOpacity="0.4" />
      <rect x="21" y="15" width="6" height="20" rx="2" fill={color} fillOpacity="0.7" />
      <rect x="31" y="9" width="6" height="26" rx="2" fill={color} />
    </svg>
  )
}

export function IconInfo({ color = 'currentColor', size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <line x1="12" y1="10" x2="12" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="7" r="1.2" fill={color} />
    </svg>
  )
}

export function IconCheck({ color = 'currentColor', size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 10.5 8 14.5 16 6.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
