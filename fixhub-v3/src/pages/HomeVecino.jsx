import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { OrnamentLine, SectionTitle, Card, BottomNav, StatusBadge } from '../components/Palace'

const actions = [
  { icon: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z', label: 'Reportar', sub: 'Nuevo aviso', path: '/aviso', primary: true },
  { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0', label: 'Proveedores', sub: 'Ver contactos', path: '/proveedores' },
  { icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', label: 'Mis avisos', sub: 'Historial', path: '/avisos' },
]

export default function HomeVecino({ user, onLogout }) {
  const navigate = useNavigate()
  const [avisos, setAvisos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('avisos').select('*').eq('vecino_id', user.id).order('created_at', { ascending: false }).limit(3)
      setAvisos(data || [])
      setLoading(false)
    }
    fetch()
    const sub = supabase.channel('home_vecino').on('postgres_changes', { event: '*', schema: 'public', table: 'avisos', filter: `vecino_id=eq.${user.id}` }, fetch).subscribe()
    return () => supabase.removeChannel(sub)
  }, [user.id])

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '52px 24px 24px', textAlign: 'center' }}>
        <p className="font-cormorant animate-ornament" style={{ color: '#D9CBB0', fontSize: 11, letterSpacing: '0.5em', marginBottom: 14 }}>✦ ✦ ✦</p>
        <h1 className="font-cormorant" style={{ fontSize: 32, fontWeight: 700, color: '#F2E0C9', letterSpacing: '0.01em', lineHeight: 1.1, marginBottom: 6 }}>
          Bienvenido,<br />{user.nombre.split(' ')[0]}.
        </h1>
        <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.5)', letterSpacing: '0.06em' }}>{user.edificio.nombre} · Depto {user.departamento}</p>
        <div style={{ marginTop: 16 }}><OrnamentLine /></div>
      </div>

      {/* Actions */}
      <div style={{ padding: '0 20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {actions.map(a => (
            <button key={a.path} onClick={() => navigate(a.path)} style={{
              background: a.primary ? 'rgba(242,224,201,0.08)' : 'rgba(242,224,201,0.03)',
              border: `1px solid ${a.primary ? 'rgba(217,203,176,0.25)' : 'rgba(217,203,176,0.1)'}`,
              borderRadius: 14, padding: '18px 14px', textAlign: 'left',
              gridColumn: a.primary ? 'span 2' : 'span 1', display: 'flex',
              alignItems: a.primary ? 'center' : 'flex-start',
              gap: a.primary ? 14 : 0, flexDirection: a.primary ? 'row' : 'column',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(217,203,176,0.08)', border: '1px solid rgba(217,203,176,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" fill="none" stroke="rgba(242,224,201,0.7)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={a.icon} /></svg>
              </div>
              <div>
                <p className="font-cormorant" style={{ fontSize: 17, fontWeight: 600, color: '#F2E0C9', letterSpacing: '0.02em' }}>{a.label}</p>
                <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.5)', marginTop: 2 }}>{a.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent avisos */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ marginBottom: 14 }}><OrnamentLine opacity={0.12} /></div>
        <SectionTitle>Avisos recientes</SectionTitle>
        <div style={{ height: 12 }} />
        {loading && <p style={{ color: 'rgba(160,174,192,0.4)', fontSize: 13, textAlign: 'center', padding: 20 }}>Cargando...</p>}
        {!loading && avisos.length === 0 && (
          <Card><p style={{ color: 'rgba(160,174,192,0.4)', fontSize: 13, textAlign: 'center', padding: 8 }}>Sin avisos todavía.</p></Card>
        )}
        {avisos.map(a => (
          <Card key={a.id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="font-cormorant" style={{ fontSize: 15, color: '#F2E0C9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.descripcion}</p>
              <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.4)', marginTop: 2 }}>{a.rubro} · {new Date(a.created_at).toLocaleDateString('es-AR')}</p>
            </div>
            <StatusBadge estado={a.estado} />
          </Card>
        ))}
      </div>

      {/* Logout */}
      <div style={{ padding: '24px 20px 0', textAlign: 'center' }}>
        <button onClick={onLogout} style={{ background: 'none', color: 'rgba(160,174,192,0.25)', fontSize: 11, letterSpacing: '0.1em' }}>Cerrar sesión</button>
      </div>

      <BottomNav rol="vecino" />
    </div>
  )
}
