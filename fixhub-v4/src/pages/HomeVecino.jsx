import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, OrnamentLine, DiamondDivider, Card, StatusBadge, BottomNav } from '../components/Palace'

export default function HomeVecino({ user }) {
  const navigate = useNavigate()
  const [avisos, setAvisos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('avisos').select('*')
        .eq('vecino_id', user.id).order('created_at', { ascending: false }).limit(3)
      setAvisos(data || [])
      setLoading(false)
    }
    fetch()
  }, [user.id])

  const hora = new Date().getHours()
  const saludo = hora < 13 ? 'Buenos días' : hora < 20 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="page">
      <PalaceFrame />

      {/* Header */}
      <div style={{ padding: '52px 24px 20px', textAlign: 'center' }}>
        <p className="animate-ornament" style={{ fontSize: 9, letterSpacing: '0.5em', color: '#D9CBB0', marginBottom: 14 }}>✦ ✦ ✦</p>
        <h1 className="font-cormorant" style={{ fontSize: 30, fontWeight: 700, color: '#F2E0C9', lineHeight: 1.1 }}>
          {saludo},<br />
          <em style={{ fontWeight: 400, fontSize: 26 }}>{user.nombre.split(' ')[0]}.</em>
        </h1>
        <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.35)', letterSpacing: '0.1em', marginTop: 4 }}>
          Depto {user.departamento} · {user.edificio.nombre}
        </p>
        <div style={{ marginTop: 14 }}><OrnamentLine /></div>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '0 20px 24px' }}>
        <p style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(160,174,192,0.3)', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
          Acceso rápido
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Reportar problema', sub: 'Nuevo aviso', path: '/aviso', icon: 'M12 4v16m8-8H4', color: '#f87171' },
            { label: 'Proveedores', sub: 'Ver listado', path: '/proveedores', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0', color: '#60a5fa' },
            { label: 'Mis avisos', sub: 'Historial', path: '/avisos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: '#fbbf24' },
            { label: 'Tablón', sub: 'Anuncios', path: '/tablon', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.952 9.168-5', color: '#34d399' },
          ].map(item => (
            <Card key={item.path} onClick={() => navigate(item.path)} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '14px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}12`, border: `1px solid ${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="17" height="17" fill="none" stroke={item.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d={item.icon} />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#F2E0C9', lineHeight: 1.2 }}>{item.label}</p>
                <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.35)', marginTop: 1 }}>{item.sub}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px' }}><DiamondDivider /></div>

      {/* Últimos avisos */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <p style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(160,174,192,0.3)', textTransform: 'uppercase' }}>Últimos avisos</p>
          <button onClick={() => navigate('/avisos')} style={{ fontSize: 10, color: 'rgba(217,203,176,0.4)', letterSpacing: '0.06em' }}>Ver todos →</button>
        </div>

        {loading ? (
          <p style={{ fontSize: 12, color: 'rgba(160,174,192,0.25)', textAlign: 'center', padding: '20px 0' }}>Cargando...</p>
        ) : avisos.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '24px 16px' }}>
            <p style={{ fontSize: 13, color: 'rgba(160,174,192,0.35)' }}>Sin avisos recientes</p>
            <button onClick={() => navigate('/aviso')} style={{ marginTop: 10, fontSize: 11, color: '#D9CBB0', letterSpacing: '0.06em' }}>
              Crear tu primer aviso →
            </button>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {avisos.map(a => (
              <Card key={a.id} onClick={() => navigate(`/chat/${a.id}`)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                  <p style={{ fontSize: 13, color: '#F2E0C9', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.titulo}</p>
                  <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.35)', marginTop: 2 }}>{a.categoria}</p>
                </div>
                <StatusBadge estado={a.estado} />
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav rol="vecino" />
    </div>
  )
}
