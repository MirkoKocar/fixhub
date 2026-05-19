import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const TicketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 010-6h20a3 3 0 010 6"/><path d="M2 15a3 3 0 000 6h20a3 3 0 000-6"/><line x1="12" y1="3" x2="12" y2="21"/>
  </svg>
)
const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
)

const navItems = [
  { icon: HomeIcon, label: 'Inicio', path: '/' },
  { icon: TicketIcon, label: 'Avisos', path: '/avisos' },
  { icon: ListIcon, label: 'Proveedores', path: '/proveedores' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: 'rgba(8,10,15,0.92)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)',
      display: 'flex', justifyContent: 'space-around',
      padding: '14px 0 30px',
      zIndex: 100
    }}>
      {navItems.map(item => {
        const active = location.pathname === item.path
        const Icon = item.icon
        return (
          <button key={item.path} onClick={() => navigate(item.path)} style={{
            background: 'none', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 5,
            color: active ? 'var(--accent)' : 'var(--text3)',
            transition: 'color 0.2s',
            padding: '0 24px'
          }}>
            <Icon />
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.04em' }}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
