import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import BottomNav from '../components/BottomNav'

const estadoColor = { nuevo: 'var(--danger)', en_curso: 'var(--warning)', resuelto: 'var(--success)' }
const estadoLabel = { nuevo: 'Nuevo', en_curso: 'En curso', resuelto: 'Resuelto' }

const rubroIconPath = {
  Plomería: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z',
}

const WrenchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
  </svg>
)
const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
)
const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
)
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

export default function Home({ vecino, onLogout }) {
  const navigate = useNavigate()
  const [avisos, setAvisos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('avisos').select('*').eq('vecino_id', vecino.id).order('created_at', { ascending: false }).limit(4)
      setAvisos(data || [])
      setLoading(false)
    }
    fetch()
    const sub = supabase.channel('home').on('postgres_changes', { event: '*', schema: 'public', table: 'avisos', filter: `vecino_id=eq.${vecino.id}` }, fetch).subscribe()
    return () => supabase.removeChannel(sub)
  }, [vecino.id])

  const abiertos = avisos.filter(a => a.estado !== 'resuelto').length

  const card = (icon, title, sub, path, primary) => (
    <button onClick={() => navigate(path)} style={{
      background: primary ? 'var(--accent)' : 'var(--surface2)',
      border: `1px solid ${primary ? 'transparent' : 'var(--border)'}`,
      borderRadius: 'var(--radius)', padding: '18px 16px',
      textAlign: 'left', transition: 'transform 0.15s, opacity 0.15s',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}
    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
    onTouchStart={e => e.currentTarget.style.opacity = '0.85'}
    onTouchEnd={e => e.currentTarget.style.opacity = '1'}
    >
      <div style={{ width: 36, height: 36, borderRadius: 9, background: primary ? 'rgba(255,255,255,0.15)' : 'var(--surface3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: primary ? '#fff' : 'var(--accent)' }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: primary ? '#fff' : 'var(--text)', lineHeight: 1.3 }}>{title}</p>
        <p style={{ fontSize: 12, color: primary ? 'rgba(255,255,255,0.65)' : 'var(--text2)', marginTop: 3 }}>{sub}</p>
      </div>
    </button>
  )

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '56px 20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>Bienvenido,</p>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{vecino.nombre.split(' ')[0]}</h1>
        </div>
        <button onClick={onLogout} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <LogoutIcon /> Salir
        </button>
      </div>

      {/* Building card */}
      <div style={{ margin: '0 20px 28px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: 'radial-gradient(circle, var(--accent-dim) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Tu edificio</p>
            <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>{vecino.edificio.nombre}</p>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>{vecino.edificio.direccion}</p>
          </div>
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 9, padding: '6px 10px', textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Depto</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', fontFamily: 'DM Mono, monospace' }}>{vecino.departamento}</p>
          </div>
        </div>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
          {abiertos > 0
            ? <span style={{ background: 'var(--danger-dim)', border: '1px solid var(--danger-border)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: 'var(--danger)', fontWeight: 500 }}>{abiertos} aviso{abiertos > 1 ? 's' : ''} pendiente{abiertos > 1 ? 's' : ''}</span>
            : <span style={{ background: 'var(--success-dim)', border: '1px solid var(--success-border)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: 'var(--success)', fontWeight: 500 }}>Todo en orden</span>
          }
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '0 20px 28px' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Acciones</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {card(<WrenchIcon />, 'Reportar problema', 'Enviá un aviso', '/aviso', true)}
          {card(<GridIcon />, 'Proveedores', 'Contactos del edificio', '/proveedores', false)}
          {card(<BellIcon />, 'Tablón', 'Avisos del edificio', '/avisos', false)}
          {card(<SettingsIcon />, 'Administrador', 'Panel de gestión', '/admin', false)}
        </div>
      </div>

      {/* Recent */}
      <div style={{ padding: '0 20px' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Mis avisos recientes</p>
        {loading && <p style={{ color: 'var(--text3)', fontSize: 14, textAlign: 'center', padding: 20 }}>Cargando...</p>}
        {!loading && avisos.length === 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text3)', fontSize: 14 }}>Sin avisos. Todo tranquilo.</p>
          </div>
        )}
        {avisos.map(a => (
          <div key={a.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.descripcion}</p>
              <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3 }}>{a.rubro} · {new Date(a.created_at).toLocaleDateString('es-AR')}</p>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: `${estadoColor[a.estado]}15`, color: estadoColor[a.estado], flexShrink: 0, whiteSpace: 'nowrap' }}>
              {estadoLabel[a.estado]}
            </span>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
