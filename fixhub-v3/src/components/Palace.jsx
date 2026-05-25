import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export const OrnamentLine = ({ opacity = 0.2 }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity }}>
    <div style={{ height: 1, flex: 1, background: 'linear-gradient(to right, transparent, rgba(217,203,176,0.5))' }} />
    <span className="font-cormorant" style={{ fontSize: 9, color: '#D9CBB0', letterSpacing: '0.3em' }}>✦</span>
    <div style={{ height: 1, flex: 1, background: 'linear-gradient(to left, transparent, rgba(217,203,176,0.5))' }} />
  </div>
)

export const SectionTitle = ({ children }) => (
  <h2 className="font-cormorant" style={{ fontSize: 22, fontWeight: 600, color: '#F2E0C9', letterSpacing: '0.02em', marginBottom: 4 }}>{children}</h2>
)

export const Card = ({ children, style = {} }) => (
  <div style={{ background: 'rgba(242,224,201,0.04)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 14, padding: '14px 16px', ...style }}>
    {children}
  </div>
)

export const PrimaryBtn = ({ children, onClick, disabled, style = {} }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: '100%', background: 'rgba(242,224,201,0.92)', border: 'none',
    borderRadius: 10, padding: '14px', fontFamily: "'Cormorant Garamond', serif",
    fontSize: 18, fontWeight: 700, color: '#071424', letterSpacing: '0.06em',
    opacity: disabled ? 0.5 : 1, transition: 'opacity 0.2s', ...style
  }}>{children}</button>
)

export const GhostBtn = ({ children, onClick, style = {} }) => (
  <button onClick={onClick} style={{
    width: '100%', background: 'transparent',
    border: '1px solid rgba(217,203,176,0.15)', borderRadius: 10,
    padding: '13px', fontFamily: "'Cormorant Garamond', serif",
    fontSize: 16, color: 'rgba(242,224,201,0.6)', letterSpacing: '0.08em', ...style
  }}>{children}</button>
)

export const StatusBadge = ({ estado }) => {
  const colors = { nuevo: '#f87171', en_curso: '#fbbf24', resuelto: '#34d399' }
  const labels = { nuevo: 'Nuevo', en_curso: 'En curso', resuelto: 'Resuelto' }
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: `${colors[estado]}15`, color: colors[estado], whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
      {labels[estado]}
    </span>
  )
}

const navItems = {
  vecino: [
    { icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', label: 'Inicio', path: '/' },
    { icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', label: 'Avisos', path: '/avisos' },
    { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0', label: 'Proveedores', path: '/proveedores' },
  ]
}

export const BottomNav = ({ rol = 'vecino' }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const items = navItems[rol] || navItems.vecino

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: 'rgba(7,20,36,0.95)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(217,203,176,0.08)',
      display: 'flex', justifyContent: 'space-around',
      padding: '12px 0 28px', zIndex: 40
    }}>
      {items.map(item => {
        const active = location.pathname === item.path
        return (
          <button key={item.path} onClick={() => navigate(item.path)} style={{
            background: 'none', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 4,
            color: active ? '#F2E0C9' : 'rgba(160,174,192,0.35)',
            transition: 'color 0.2s', padding: '0 20px'
          }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d={item.icon} />
            </svg>
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
