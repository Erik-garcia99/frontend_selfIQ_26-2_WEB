export function Logo({ size = 34, color = 'currentColor', showText = true }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color, fontWeight: 700, fontSize: size * .65 }}>
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#7BBDE8" /><circle cx="16" cy="16" r="7" fill="none" stroke="#001D39" strokeWidth="3" /><circle cx="16" cy="16" r="2.5" fill="#001D39" />
    </svg>
    {showText ? 'SelfIQ' : <span className="sr-only">SelfIQ</span>}
  </span>;
}
