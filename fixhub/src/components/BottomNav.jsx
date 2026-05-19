import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const navItems = [
  { icon: '🏠', label: 'Inicio', path: '/' },
  { icon: '🎫', label: 'Avisos', path: '/avisos' },
  { icon: '📋', label: 'Proveedores', path: '/proveedores' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      display: 'flex', justifyContent: 'space-around',
      padding: '12px 0 28px',
      zIndex: 100
    }}>
      {navItems.map(item => {
        const active = location.pathname === item.path
        return (
          <button key={item.path} onClick={() => navigate(item.path)} style={{
            background: 'none', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 4, opacity: active ? 1 : 0.4,
            transition: 'opacity 0.2s'
          }}>
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, fontFamily: 'Syne, sans-serif',
              color: active ? 'var(--accent)' : 'var(--muted)'
            }}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
