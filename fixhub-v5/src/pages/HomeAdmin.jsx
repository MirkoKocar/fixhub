import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, OrnamentLine, DiamondRow, AccentCard, Card, StatusBadge, UrgenciaBadge, BottomNav, SectionLabel, OrnIcon } from '../components/Palace'

export default function HomeAdmin({ user }) {
  const navigate = useNavigate()
  const [avisos, setAvisos] = useState([])
  const [stats, setStats] = useState({ nuevo: 0, en_curso: 0, resuelto: 0 })
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data: av } = await supabase.from('avisos').select('*, vecinos(nombre,departamento)')
        .eq('edificio_id', user.edificio.id).order('created_at', { ascending: false })
      const { data: res } = await supabase.from('reservas').select('*')
        .eq('edificio_id', user.edificio.id).eq('estado', 'confirmada').order('fecha', { ascending: true }).limit(5)
      if (av) {
        setAvisos(av.slice(0, 4))
        setStats({
          nuevo: av.filter(a => a.estado === 'nuevo').length,
          en_curso: av.filter(a => a.estado === 'en_curso').length,
          resuelto: av.filter(a => a.estado === 'resuelto').length,
        })
      }
      setReservas(res || [])
      setLoading(false)
    }
    fetch()
  }, [user.edificio.id])

  const acciones = [
    { label: 'Todos los avisos', path: '/admin/avisos', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'Proveedores', path: '/admin/proveedores', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0' },
    { label: 'Estadísticas', path: '/admin/stats', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { label: 'Tablón', path: '/admin/tablon', d: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.952 9.168-5' },
    { label: 'Recordatorios', path: '/admin/recordatorios', d: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { label: 'Vecinos', path: '/admin/vecinos', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  ]

  return (
    <div className="page">
      <PalaceFrame />

      {/* Header */}
      <div style={{ padding: '52px 24px 20px', textAlign: 'center' }}>
        <p className="font-cormorant animate-ornament" style={{ fontSize: 9, letterSpacing: '0.5em', color: '#D9CBB0', marginBottom: 12 }}>✦ ✦ ✦</p>
        <h1 className="font-cormorant" style={{ fontSize: 26, fontWeight: 700, color: '#F2E0C9', lineHeight: 1.1 }}>Panel de Administración</h1>
        <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.28)', letterSpacing: '0.12em', marginTop: 4 }}>{user.edificio.nombre}</p>
        <div style={{ marginTop: 14 }}><OrnamentLine /></div>
      </div>

      {/* Stats */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {[
            { label: 'Nuevos', value: stats.nuevo, color: '#f87171' },
            { label: 'En curso', value: stats.en_curso, color: '#fbbf24' },
            { label: 'Resueltos', value: stats.resuelto, color: '#34d399' },
          ].map(s => (
            <div key={s.label} style={{ border: `1px solid ${s.color}18`, borderTop: `2px solid ${s.color}40`, borderRadius: 4, padding: '14px 10px', textAlign: 'center', background: `${s.color}04` }}>
              <p className="font-cormorant" style={{ fontSize: 32, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 8.5, color: 'rgba(160,174,192,0.3)', letterSpacing: '0.12em', marginTop: 5, textTransform: 'uppercase' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Acciones */}
      <div style={{ padding: '0 20px 20px' }}>
        <SectionLabel style={{ marginBottom: 12 }}>Gestión</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {acciones.map(item => (
            <Card key={item.path} onClick={() => navigate(item.path)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
              <OrnIcon path={item.d} size={16} />
              <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(242,224,201,0.75)', lineHeight: 1.3 }}>{item.label}</p>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px' }}><DiamondRow count={3} opacity={0.1} /></div>

      {/* Reservas próximas */}
      {reservas.length > 0 && (
        <div style={{ padding: '20px' }}>
          <SectionLabel style={{ marginBottom: 12 }}>Reservas próximas</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reservas.map(r => (
              <AccentCard key={r.id} accentColor="rgba(217,203,176,0.2)">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 12, color: 'rgba(242,224,201,0.8)', fontWeight: 500 }}>{r.espacio_nombre}</p>
                    <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.3)', marginTop: 2 }}>Depto {r.departamento} · {r.hora}</p>
                  </div>
                  <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.3)' }}>{new Date(r.fecha).toLocaleDateString('es-AR',{day:'2-digit',month:'short'})}</p>
                </div>
              </AccentCard>
            ))}
          </div>
        </div>
      )}

      {/* Avisos recientes */}
      <div style={{ padding: reservas.length > 0 ? '0 20px' : '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <SectionLabel>Avisos recientes</SectionLabel>
          <button onClick={() => navigate('/admin/avisos')} style={{ fontSize: 9, color: 'rgba(217,203,176,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Ver todos →</button>
        </div>
        {loading ? (
          <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.2)', textAlign: 'center', padding: '20px 0' }}>Cargando...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {avisos.map(a => (
              <AccentCard key={a.id} onClick={() => navigate(`/admin/aviso/${a.id}`)}
                accentColor={a.estado === 'nuevo' ? 'rgba(248,113,113,0.45)' : a.estado === 'en_curso' ? 'rgba(251,191,36,0.4)' : 'rgba(52,211,153,0.35)'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, marginRight: 10 }}>
                    <p style={{ fontSize: 13, color: 'rgba(242,224,201,0.85)', fontWeight: 500, lineHeight: 1.3 }}>{a.titulo}</p>
                    <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.3)', marginTop: 2 }}>
                      {a.vecinos?.nombre} · Depto {a.vecinos?.departamento}
                    </p>
                  </div>
                  <StatusBadge estado={a.estado} />
                </div>
              </AccentCard>
            ))}
          </div>
        )}
      </div>

      <BottomNav rol="admin" />
    </div>
  )
}
