import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export const PalaceFrame = () => (
  <div className="palace-frame">
    <div className="pf-corner tl" />
    <div className="pf-corner tr" />
    <div className="pf-corner bl" />
    <div className="pf-corner br" />
    <div className="pf-inner" />
  </div>
)

export const OrnamentLine = ({ opacity = 0.18 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity }}>
    <div style={{ height: 1, flex: 1, background: 'linear-gradient(to right, transparent, rgba(217,203,176,0.6))' }} />
    <span className="font-cormorant" style={{ fontSize: 9, color: '#D9CBB0', letterSpacing: '0.3em' }}>✦</span>
    <div style={{ height: 1, flex: 1, background: 'linear-gradient(to left, transparent, rgba(217,203,176,0.6))' }} />
  </div>
)

export const DiamondDivider = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: 0.2, margin: '4px 0' }}>
    <div style={{ width: 24, height: 1, background: 'rgba(217,203,176,0.5)' }} />
    <div style={{ width: 5, height: 5, border: '1px solid rgba(217,203,176,0.8)', transform: 'rotate(45deg)' }} />
    <div style={{ width: 24, height: 1, background: 'rgba(217,203,176,0.5)' }} />
  </div>
)

export const SectionTitle = ({ children, style = {} }) => (
  <h2 className="font-cormorant" style={{ fontSize: 20, fontWeight: 600, color: '#F2E0C9', letterSpacing: '0.02em', ...style }}>
    {children}
  </h2>
)

export const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{
    background: 'rgba(242,224,201,0.03)',
    border: '1px solid rgba(217,203,176,0.1)',
    borderRadius: 14,
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
    background: disabled ? 'rgba(242,224,201,0.3)' : 'rgba(242,224,201,0.92)',
    border: 'none',
    borderRadius: 10,
    padding: '14px',
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 18,
    fontWeight: 700,
    color: '#071020',
    letterSpacing: '0.06em',
    transition: 'opacity 0.2s',
    ...style
  }}>{children}</button>
)

export const GhostBtn = ({ children, onClick, style = {} }) => (
  <button onClick={onClick} style={{
    width: '100%',
    background: 'transparent',
    border: '1px solid rgba(217,203,176,0.15)',
    borderRadius: 10,
    padding: '13px',
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 16,
    color: 'rgba(242,224,201,0.6)',
    letterSpacing: '0.08em',
    ...style
  }}>{children}</button>
)

export const StatusBadge = ({ estado }) => {
  const colors = { nuevo: '#f87171', en_curso: '#fbbf24', resuelto: '#34d399' }
  const labels = { nuevo: 'Nuevo', en_curso: 'En curso', resuelto: 'Resuelto' }
  const c = colors[estado] || '#A0AEC0'
  return (
    <span style={{
      fontSize: 9, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
      background: `${c}15`, color: c, whiteSpace: 'nowrap',
      letterSpacing: '0.06em', textTransform: 'uppercase', border: `1px solid ${c}25`
    }}>
      {labels[estado] || estado}
    </span>
  )
}

export const UrgenciaBadge = ({ urgencia }) => {
  const colors = { baja: '#34d399', media: '#fbbf24', alta: '#f87171' }
  const labels = { baja: 'Baja', media: 'Media', alta: 'Alta' }
  const c = colors[urgencia] || '#A0AEC0'
  return (
    <span style={{
      fontSize: 9, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
      background: `${c}12`, color: c, whiteSpace: 'nowrap',
      letterSpacing: '0.06em', textTransform: 'uppercase'
    }}>
      {labels[urgencia] || urgencia}
    </span>
  )
}

export const PageHeader = ({ title, subtitle, onBack, extra }) => (
  <div style={{ padding: '48px 24px 20px', textAlign: 'center', position: 'relative' }}>
    {onBack && (
      <button onClick={onBack} style={{
        position: 'absolute', left: 20, top: 52,
        color: 'rgba(160,174,192,0.45)', fontSize: 12,
        letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6
      }}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>
    )}
    <p className="font-cormorant animate-ornament" style={{ color: '#D9CBB0', fontSize: 10, letterSpacing: '0.5em', marginBottom: 12 }}>✦ ✦ ✦</p>
    <h1 className="font-cormorant" style={{ fontSize: 28, fontWeight: 700, color: '#F2E0C9', lineHeight: 1.1, marginBottom: subtitle ? 4 : 0 }}>
      {title}
    </h1>
    {subtitle && <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.45)', letterSpacing: '0.06em' }}>{subtitle}</p>}
    {extra}
    <div style={{ marginTop: 14 }}><OrnamentLine /></div>
  </div>
)

// Bottom nav configs per role
const navConfigs = {
  vecino: [
    { path: '/', label: 'Inicio', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/aviso', label: 'Reportar', icon: 'M12 4v16m8-8H4' },
    { path: '/avisos', label: 'Mis avisos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { path: '/proveedores', label: 'Proveedores', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0' },
  ],
  admin: [
    { path: '/', label: 'Panel', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { path: '/admin/avisos', label: 'Avisos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { path: '/admin/proveedores', label: 'Proveedores', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0' },
    { path: '/admin/stats', label: 'Estadísticas', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ],
  proveedor: [
    { path: '/', label: 'Inicio', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/proveedor/mensajes', label: 'Mensajes', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { path: '/proveedor/historial', label: 'Historial', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
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
      background: 'rgba(7,16,32,0.96)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(217,203,176,0.08)',
      display: 'flex', justifyContent: 'space-around',
      padding: '10px 0 26px', zIndex: 40
    }}>
      {items.map(item => {
        const active = location.pathname === item.path
        return (
          <button key={item.path} onClick={() => navigate(item.path)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: active ? '#F2E0C9' : 'rgba(160,174,192,0.3)',
            transition: 'color 0.2s', padding: '0 14px'
          }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d={item.icon} />
            </svg>
            <span style={{ fontSize: 8.5, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              {item.label}
            </span>
            {active && (
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#D9CBB0', marginTop: -2 }} />
            )}
          </button>
        )
      })}
    </nav>
  )
}
