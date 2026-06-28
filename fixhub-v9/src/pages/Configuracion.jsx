import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PalaceFrame, PageHeader, Card, AccentCard, OrnamentLine, SectionLabel } from '../components/Palace'

const SESSION_KEY = 'fixhub_session_v9'

export default function Configuracion({ user, onLogout }) {
  const navigate = useNavigate()
  const [lightMode, setLightMode] = useState(() => localStorage.getItem('fixhub_lightmode') === 'true')
  const [brightness, setBrightness] = useState(() => parseInt(localStorage.getItem('fixhub_brightness') || '100'))
  const [notifOn, setNotifOn] = useState(() => localStorage.getItem('fixhub_notif') !== 'false')

  useEffect(() => {
    document.body.classList.toggle('light-mode', lightMode)
    localStorage.setItem('fixhub_lightmode', lightMode)
  }, [lightMode])

  useEffect(() => {
    document.body.style.filter = `brightness(${brightness}%)`
    localStorage.setItem('fixhub_brightness', brightness)
  }, [brightness])

  useEffect(() => {
    localStorage.setItem('fixhub_notif', notifOn)
  }, [notifOn])

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY)
    document.body.classList.remove('light-mode')
    document.body.style.filter = ''
    onLogout()
  }

  const rolLabel = { vecino: 'Vecino', admin: 'Administrador', proveedor: 'Proveedor' }[user.rol]

  return (
    <div className="page page-enter">
      <PalaceFrame />
      <PageHeader title="Configuración" subtitle="Ajustes de la app" />

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Perfil */}
        <Card style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,rgba(224,176,94,0.2),rgba(224,176,94,0.06))', border: '1px solid rgba(224,176,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span className="font-serif" style={{ fontSize: 22, color: '#E0B05E' }}>{user.nombre?.charAt(0) || '?'}</span>
          </div>
          <div>
            <p style={{ fontSize: 14, color: '#F2E0C9', fontWeight: 700 }}>{user.nombre}</p>
            <p style={{ fontSize: 10, color: 'rgba(180,190,205,0.35)', marginTop: 2, fontWeight: 500 }}>
              {rolLabel} · {user.edificio?.nombre}
              {user.departamento ? ` · Depto ${user.departamento}` : ''}
            </p>
          </div>
        </Card>

        <OrnamentLine opacity={0.08}/>
        <SectionLabel style={{ marginBottom: 4 }}>Apariencia</SectionLabel>

        {/* Modo claro/oscuro */}
        <AccentCard accentColor={lightMode ? 'rgba(251,191,36,0.5)' : 'rgba(96,165,250,0.4)'}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 13, color: 'rgba(242,224,201,0.88)', fontWeight: 700 }}>Modo {lightMode ? 'claro' : 'oscuro'}</p>
              <p style={{ fontSize: 10, color: 'rgba(180,190,205,0.32)', marginTop: 2, fontWeight: 500 }}>Cambiar entre tema claro y oscuro</p>
            </div>
            <button onClick={() => setLightMode(!lightMode)} style={{ width: 46, height: 26, borderRadius: 999, background: lightMode ? 'rgba(251,191,36,0.6)' : 'rgba(96,165,250,0.4)', border: 'none', position: 'relative', transition: 'background 0.3s', flexShrink: 0 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#F2E0C9', position: 'absolute', top: 3, left: lightMode ? 23 : 3, transition: 'left 0.3s', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}/>
            </button>
          </div>
        </AccentCard>

        {/* Brillo */}
        <Card>
          <p style={{ fontSize: 13, color: 'rgba(242,224,201,0.88)', fontWeight: 700, marginBottom: 12 }}>Brillo</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, color: 'rgba(180,190,205,0.4)', fontWeight: 600 }}>50%</span>
            <input type="range" min="50" max="120" value={brightness} onChange={e => setBrightness(e.target.value)}
              style={{ flex: 1, accentColor: '#E0B05E', height: 4, cursor: 'pointer' }}/>
            <span style={{ fontSize: 11, color: 'rgba(180,190,205,0.4)', fontWeight: 600 }}>120%</span>
          </div>
          <p style={{ fontSize: 10, color: 'rgba(180,190,205,0.25)', marginTop: 8, textAlign: 'center' }}>Actual: {brightness}%</p>
        </Card>

        <OrnamentLine opacity={0.08}/>
        <SectionLabel style={{ marginBottom: 4 }}>Notificaciones</SectionLabel>

        <AccentCard accentColor={notifOn ? 'rgba(52,211,153,0.4)' : 'rgba(217,203,176,0.15)'}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 13, color: 'rgba(242,224,201,0.88)', fontWeight: 700 }}>Notificaciones in-app</p>
              <p style={{ fontSize: 10, color: 'rgba(180,190,205,0.32)', marginTop: 2, fontWeight: 500 }}>Alertas de cambios de estado</p>
            </div>
            <button onClick={() => setNotifOn(!notifOn)} style={{ width: 46, height: 26, borderRadius: 999, background: notifOn ? 'rgba(52,211,153,0.6)' : 'rgba(248,113,113,0.4)', border: 'none', position: 'relative', transition: 'background 0.3s', flexShrink: 0 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#F2E0C9', position: 'absolute', top: 3, left: notifOn ? 23 : 3, transition: 'left 0.3s', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}/>
            </button>
          </div>
        </AccentCard>

        <OrnamentLine opacity={0.08}/>
        <SectionLabel style={{ marginBottom: 4 }}>Información</SectionLabel>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['Versión', 'FixHub v9.0'],['Edificio', user.edificio?.nombre],['Código', user.edificio?.codigo_acceso]].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 12, color: 'rgba(180,190,205,0.35)', fontWeight: 500 }}>{label}</p>
                <p style={{ fontSize: 12, color: 'rgba(242,224,201,0.65)', fontWeight: 600 }}>{val}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Cerrar sesión */}
        <button onClick={handleLogout} style={{
          width: '100%', background: 'rgba(248,113,113,0.07)',
          border: '1px solid rgba(248,113,113,0.2)', borderRadius: 999, padding: '14px',
          fontSize: 14, fontWeight: 700, color: '#f87171', letterSpacing: '0.02em', marginTop: 8
        }}>
          Cerrar sesión
        </button>

        <p style={{ textAlign: 'center', fontSize: 9, color: 'rgba(180,190,205,0.15)', letterSpacing: '0.3em', textTransform: 'uppercase', paddingBottom: 8 }}>— FixHub · 2026 —</p>
      </div>
    </div>
  )
}
