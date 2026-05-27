import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, OrnamentLine, DiamondDivider, Card, StatusBadge, UrgenciaBadge, BottomNav, SectionTitle } from '../components/Palace'

export default function HomeAdmin({ user }) {
  const navigate = useNavigate()
  const [avisos, setAvisos] = useState([])
  const [stats, setStats] = useState({ nuevo: 0, en_curso: 0, resuelto: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('avisos').select('*')
        .eq('edificio_id', user.edificio.id)
        .order('created_at', { ascending: false })
      if (data) {
        setAvisos(data.slice(0, 5))
        setStats({
          nuevo: data.filter(a => a.estado === 'nuevo').length,
          en_curso: data.filter(a => a.estado === 'en_curso').length,
          resuelto: data.filter(a => a.estado === 'resuelto').length,
          total: data.length
        })
      }
      setLoading(false)
    }
    fetch()
  }, [user.edificio.id])

  return (
    <div className="page">
      <PalaceFrame />

      {/* Header */}
      <div style={{ padding: '52px 24px 20px', textAlign: 'center' }}>
        <p className="animate-ornament" style={{ fontSize: 9, letterSpacing: '0.5em', color: '#fbbf24', marginBottom: 14 }}>✦ ✦ ✦</p>
        <h1 className="font-cormorant" style={{ fontSize: 28, fontWeight: 700, color: '#F2E0C9', lineHeight: 1.1 }}>
          Panel de Control
        </h1>
        <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.35)', letterSpacing: '0.1em', marginTop: 4 }}>
          {user.edificio.nombre}
        </p>
        <div style={{ marginTop: 14 }}><OrnamentLine opacity={0.14} /></div>
      </div>

      {/* Stats grid */}
      <div style={{ padding: '0 20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { label: 'Nuevos', value: stats.nuevo, color: '#f87171' },
            { label: 'En curso', value: stats.en_curso, color: '#fbbf24' },
            { label: 'Resueltos', value: stats.resuelto, color: '#34d399' },
          ].map(s => (
            <div key={s.label} style={{
              background: `${s.color}06`, border: `1px solid ${s.color}18`,
              borderRadius: 12, padding: '14px 10px', textAlign: 'center'
            }}>
              <p className="font-cormorant" style={{ fontSize: 30, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 9, color: 'rgba(160,174,192,0.4)', letterSpacing: '0.1em', marginTop: 4, textTransform: 'uppercase' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Todos los avisos', path: '/admin/avisos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: '#fbbf24' },
            { label: 'Proveedores', path: '/admin/proveedores', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0', color: '#60a5fa' },
            { label: 'Estadísticas', path: '/admin/stats', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: '#34d399' },
            { label: 'Tablón admin', path: '/admin/tablon', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.952 9.168-5', color: '#a78bfa' },
          ].map(item => (
            <Card key={item.path} onClick={() => navigate(item.path)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `${item.color}12`, border: `1px solid ${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" fill="none" stroke={item.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d={item.icon} />
                </svg>
              </div>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#F2E0C9', lineHeight: 1.3 }}>{item.label}</p>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px' }}><DiamondDivider /></div>

      {/* Avisos recientes */}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <p style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(160,174,192,0.3)', textTransform: 'uppercase' }}>Avisos recientes</p>
          <button onClick={() => navigate('/admin/avisos')} style={{ fontSize: 10, color: 'rgba(217,203,176,0.4)', letterSpacing: '0.06em' }}>Ver todos →</button>
        </div>

        {loading ? (
          <p style={{ fontSize: 12, color: 'rgba(160,174,192,0.25)', textAlign: 'center', padding: '20px 0' }}>Cargando...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {avisos.map(a => (
              <Card key={a.id} onClick={() => navigate(`/admin/aviso/${a.id}`)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                  <p style={{ fontSize: 13, color: '#F2E0C9', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.titulo}</p>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
                    <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.35)' }}>{a.categoria}</p>
                    {a.urgencia && <><span style={{ color: 'rgba(160,174,192,0.2)' }}>·</span><UrgenciaBadge urgencia={a.urgencia} /></>}
                  </div>
                </div>
                <StatusBadge estado={a.estado} />
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav rol="admin" />
    </div>
  )
}
