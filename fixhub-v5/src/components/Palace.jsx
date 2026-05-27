import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export const PalaceFrame = () => (
  <div className="palace-frame">
    <div className="pf-corner tl" /><div className="pf-corner tr" />
    <div className="pf-corner bl" /><div className="pf-corner br" />
    <div className="pf-inner" />
  </div>
)

export const OrnamentLine = ({ opacity = 0.16 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity }}>
    <div style={{ height: 1, flex: 1, background: 'linear-gradient(to right, transparent, rgba(217,203,176,0.5))' }} />
    <span className="font-cormorant" style={{ fontSize: 8, color: '#D9CBB0', letterSpacing: '0.3em' }}>✦</span>
    <div style={{ height: 1, flex: 1, background: 'linear-gradient(to left, transparent, rgba(217,203,176,0.5))' }} />
  </div>
)

export const DiamondRow = ({ count = 3, opacity = 0.18 }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity, margin: '6px 0' }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ width: 5, height: 5, border: '1px solid rgba(217,203,176,0.7)', transform: 'rotate(45deg)' }} />
    ))}
  </div>
)

export const SectionLabel = ({ children, style = {} }) => (
  <p style={{ fontSize: 8.5, letterSpacing: '0.32em', color: 'rgba(160,174,192,0.28)', textTransform: 'uppercase', ...style }}>{children}</p>
)

// Refined card — less rounded, more architectural
export const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{
    background: 'rgba(242,224,201,0.025)',
    border: '1px solid rgba(217,203,176,0.09)',
    borderRadius: 6,
    padding: '14px 16px',
    cursor: onClick ? 'pointer' : 'default',
    position: 'relative',
    ...style
  }}>
    {children}
  </div>
)

// Card with subtle left accent line
export const AccentCard = ({ children, style = {}, onClick, accentColor = 'rgba(217,203,176,0.3)' }) => (
  <div onClick={onClick} style={{
    background: 'rgba(242,224,201,0.025)',
    border: '1px solid rgba(217,203,176,0.09)',
    borderLeft: `2px solid ${accentColor}`,
    borderRadius: 6,
    padding: '14px 16px',
    cursor: onClick ? 'pointer' : 'default',
    ...style
  }}>
    {children}
  </div>
)

export const PrimaryBtn = ({ children, onClick, disabled, style = {} }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: '100%',
    background: disabled ? 'rgba(242,224,201,0.25)' : 'rgba(242,224,201,0.9)',
    border: 'none', borderRadius: 6, padding: '15px',
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 17, fontWeight: 700, color: '#071020',
    letterSpacing: '0.1em', textTransform: 'uppercase',
    transition: 'opacity 0.2s', ...style
  }}>{children}</button>
)

export const GhostBtn = ({ children, onClick, style = {} }) => (
  <button onClick={onClick} style={{
    width: '100%', background: 'transparent',
    border: '1px solid rgba(217,203,176,0.12)', borderRadius: 6, padding: '12px',
    fontFamily: "'Cormorant Garamond', serif", fontSize: 14,
    color: 'rgba(242,224,201,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase',
    ...style
  }}>{children}</button>
)

export const StatusBadge = ({ estado }) => {
  const map = { nuevo: ['#f87171','Nuevo'], en_curso: ['#fbbf24','En curso'], resuelto: ['#34d399','Resuelto'] }
  const [c, label] = map[estado] || ['#A0AEC0', estado]
  return (
    <span style={{
      fontSize: 8.5, fontWeight: 600, padding: '3px 9px', borderRadius: 2,
      background: `${c}12`, color: c, whiteSpace: 'nowrap',
      letterSpacing: '0.08em', textTransform: 'uppercase',
      border: `1px solid ${c}22`
    }}>{label}</span>
  )
}

export const UrgenciaBadge = ({ urgencia }) => {
  const map = { baja: ['#34d399','Baja'], media: ['#fbbf24','Media'], alta: ['#f87171','Alta'] }
  const [c, label] = map[urgencia] || ['#A0AEC0', urgencia]
  return (
    <span style={{
      fontSize: 8.5, fontWeight: 600, padding: '3px 9px', borderRadius: 2,
      background: `${c}10`, color: c, letterSpacing: '0.08em', textTransform: 'uppercase'
    }}>{label}</span>
  )
}

// Ornamental icon container — replaces colorful icon boxes
export const OrnIcon = ({ path, size = 18, color = 'rgba(217,203,176,0.55)', bg = 'rgba(217,203,176,0.05)', style = {} }) => (
  <div style={{
    width: 38, height: 38, flexShrink: 0,
    border: '1px solid rgba(217,203,176,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: bg, ...style
  }}>
    <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.2"
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d={path} />
    </svg>
  </div>
)

export const PageHeader = ({ title, subtitle, onBack, extra }) => (
  <div style={{ padding: '48px 24px 18px', textAlign: 'center', position: 'relative' }}>
    {onBack && (
      <button onClick={onBack} style={{
        position: 'absolute', left: 20, top: 52,
        color: 'rgba(160,174,192,0.3)', fontSize: 11,
        letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 5,
        textTransform: 'uppercase'
      }}>
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>
    )}
    <p className="font-cormorant animate-ornament" style={{ color: '#D9CBB0', fontSize: 9, letterSpacing: '0.5em', marginBottom: 10 }}>✦ ✦ ✦</p>
    <h1 className="font-cormorant" style={{ fontSize: 26, fontWeight: 700, color: '#F2E0C9', letterSpacing: '0.01em', lineHeight: 1.1, marginBottom: subtitle ? 4 : 0 }}>
      {title}
    </h1>
    {subtitle && <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.35)', letterSpacing: '0.1em' }}>{subtitle}</p>}
    {extra && <div style={{ marginTop: 10 }}>{extra}</div>}
    <div style={{ marginTop: 12 }}><OrnamentLine /></div>
  </div>
)

// Nav configs
const navConfigs = {
  vecino: [
    { path: '/', label: 'Inicio', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/aviso', label: 'Reportar', d: 'M12 4v16m8-8H4' },
    { path: '/avisos', label: 'Avisos', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { path: '/proveedores', label: 'Servicios', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0' },
    { path: '/reservas', label: 'Reservas', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ],
  admin: [
    { path: '/', label: 'Panel', d: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { path: '/admin/avisos', label: 'Avisos', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { path: '/admin/proveedores', label: 'Servicios', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0' },
    { path: '/admin/stats', label: 'Métricas', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { path: '/admin/tablon', label: 'Tablón', d: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.952 9.168-5' },
  ],
  proveedor: [
    { path: '/', label: 'Inicio', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/proveedor/mensajes', label: 'Mensajes', d: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { path: '/proveedor/historial', label: 'Historial', d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path: '/proveedor/agenda', label: 'Agenda', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ]
}

export const BottomNav = ({ rol = 'vecino' }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const items = navConfigs[rol] || navConfigs.vecino

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: 'rgba(7,16,32,0.97)', backdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(217,203,176,0.07)',
      display: 'flex', justifyContent: 'space-around',
      padding: '10px 0 28px', zIndex: 40
    }}>
      {items.map(item => {
        const active = location.pathname === item.path
        return (
          <button key={item.path} onClick={() => navigate(item.path)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: active ? '#F2E0C9' : 'rgba(160,174,192,0.25)',
            transition: 'color 0.2s', padding: '0 10px', minWidth: 48
          }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.3"
              strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d={item.d} />
            </svg>
            <span style={{ fontSize: 8, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {item.label}
            </span>
            {active && (
              <div style={{ width: 3, height: 3, background: '#D9CBB0', transform: 'rotate(45deg)', marginTop: -2 }} />
            )}
          </button>
        )
      })}
    </nav>
  )
}
