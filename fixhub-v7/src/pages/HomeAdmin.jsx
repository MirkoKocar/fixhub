import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, OrnamentLine, DiamondRow, AccentCard, Card, StatusBadge, BottomNav, SectionLabel, OrnIcon, SkeletonCard, AnimCounter } from '../components/Palace'

export default function HomeAdmin({ user }) {
  const navigate = useNavigate()
  const [avisos, setAvisos] = useState([])
  const [stats, setStats] = useState({ nuevo: 0, en_curso: 0, resuelto: 0, promedioDias: 0 })
  const [reservas, setReservas] = useState([])
  const [recordatorios, setRecordatorios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const [avRes, resRes, recRes] = await Promise.all([
        supabase.from('avisos').select('*, vecinos(nombre,departamento)').eq('edificio_id', user.edificio.id).order('created_at', { ascending: false }),
        supabase.from('reservas').select('*').eq('edificio_id', user.edificio.id).eq('estado', 'confirmada').order('fecha', { ascending: true }).limit(3),
        supabase.from('recordatorios').select('*').eq('edificio_id', user.edificio.id).eq('completado', false).order('fecha', { ascending: true }).limit(3),
      ])
      const av = avRes.data || []
      const resueltos = av.filter(a => a.estado === 'resuelto')
      let promedioDias = 0
      if (resueltos.length > 0) {
        const total = resueltos.reduce((s, a) => s + (new Date(a.updated_at || a.created_at) - new Date(a.created_at)) / 86400000, 0)
        promedioDias = Math.round(total / resueltos.length * 10) / 10
      }
      setAvisos(av.slice(0, 4))
      setStats({ nuevo: av.filter(a => a.estado==='nuevo').length, en_curso: av.filter(a => a.estado==='en_curso').length, resuelto: av.filter(a => a.estado==='resuelto').length, promedioDias })
      setReservas(resRes.data || [])
      setRecordatorios(recRes.data || [])
      setLoading(false)
    }
    fetch()
  }, [user.edificio.id])

  const acciones = [
    { label: 'Avisos', path: '/admin/avisos', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
    { label: 'Proveedores', path: '/admin/proveedores', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
    { label: 'Métricas', path: '/admin/stats', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
    { label: 'Más opciones', path: '/admin/mas', d: 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z', color: '#E0B05E', bg: 'rgba(224,176,94,0.12)' },
  ]

  return (
    <div className="page page-enter">
      <PalaceFrame />

      {/* Hero header */}
      <div style={{ position: 'relative', padding: '52px 20px 24px', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(251,191,36,0.05) 0%, transparent 100%)', borderBottomLeftRadius: '50% 20px', borderBottomRightRadius: '50% 20px', pointerEvents: 'none' }} />
        <p className="font-cormorant animate-ornament" style={{ fontSize: 9, letterSpacing: '0.5em', color: '#E0B05E', marginBottom: 8 }}>✦ ✦ ✦</p>
        <h1 className="font-cormorant" style={{ fontSize: 24, fontWeight: 700, color: '#F2E0C9', lineHeight: 1.1 }}>Panel de Administración</h1>
        <p style={{ fontSize: 9.5, color: 'rgba(180,190,205,0.28)', letterSpacing: '0.1em', marginTop: 4 }}>{user.edificio.nombre}</p>
        <div style={{ marginTop: 12 }}><OrnamentLine /></div>
      </div>

      {/* Stats animados */}
      <div style={{ padding: '0 20px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9 }}>
          {[{label:'Nuevos',value:stats.nuevo,color:'#f87171'},{label:'En curso',value:stats.en_curso,color:'#fbbf24'},{label:'Resueltos',value:stats.resuelto,color:'#34d399'}].map(s => (
            <div key={s.label} style={{ background: `${s.color}08`, border: `1px solid ${s.color}20`, borderTop: `3px solid ${s.color}50`, borderRadius: 14, padding: '14px 8px', textAlign: 'center' }}>
              <AnimCounter value={s.value} color={s.color} size={30} />
              <p style={{ fontSize: 8, color: 'rgba(180,190,205,0.3)', letterSpacing: '0.1em', marginTop: 5, textTransform: 'uppercase' }}>{s.label}</p>
            </div>
          ))}
        </div>
        {stats.promedioDias > 0 && (
          <p style={{ fontSize: 10, color: 'rgba(180,190,205,0.28)', textAlign: 'center', marginTop: 8 }}>
            Resolución promedio: <span style={{ color: '#E0B05E', fontWeight: 600 }}>{stats.promedioDias} días</span>
          </p>
        )}
      </div>

      {/* Recordatorios urgentes */}
      {recordatorios.length > 0 && (
        <div style={{ padding: '0 20px 16px' }}>
          <SectionLabel style={{ marginBottom: 9 }}>Mantenimiento pendiente</SectionLabel>
          {recordatorios.map(r => {
            const dias = Math.ceil((new Date(r.fecha) - new Date()) / 86400000)
            const color = dias <= 7 ? '#f87171' : dias <= 30 ? '#fbbf24' : 'rgba(224,176,94,0.5)'
            return (
              <AccentCard key={r.id} accentColor={color} style={{ marginBottom: 7 }} onClick={() => navigate('/admin/recordatorios')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: 12, color: 'rgba(242,224,201,0.82)', fontWeight: 500 }}>{r.tipo}</p>
                  <span style={{ fontSize: 9, color, fontWeight: 700, letterSpacing: '0.06em' }}>{dias <= 0 ? 'VENCIDO' : `${dias}d`}</span>
                </div>
              </AccentCard>
            )
          })}
        </div>
      )}

      {/* Acciones grid */}
      <div style={{ padding: '0 20px 18px' }}>
        <SectionLabel style={{ marginBottom: 10 }}>Gestión</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          {acciones.map(item => (
            <div key={item.path} onClick={() => navigate(item.path)} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 16, padding: '14px 13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
              <OrnIcon path={item.d} color={item.color} bg={item.bg} size={16} />
              <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(242,224,201,0.8)', lineHeight: 1.2 }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px' }}><DiamondRow count={3} opacity={0.1} /></div>

      {/* Reservas */}
      {reservas.length > 0 && (
        <div style={{ padding: '14px 20px 0' }}>
          <SectionLabel style={{ marginBottom: 9 }}>Reservas próximas</SectionLabel>
          {reservas.map(r => (
            <AccentCard key={r.id} accentColor="rgba(224,176,94,0.35)" style={{ marginBottom: 7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 12, color: 'rgba(242,224,201,0.85)', fontWeight: 600 }}>{r.espacio_nombre}</p>
                  <p style={{ fontSize: 10, color: 'rgba(180,190,205,0.3)', marginTop: 2 }}>Depto {r.departamento} · {r.hora}</p>
                </div>
                <p style={{ fontSize: 10, color: 'rgba(180,190,205,0.35)' }}>{new Date(r.fecha).toLocaleDateString('es-AR',{day:'2-digit',month:'short'})}</p>
              </div>
            </AccentCard>
          ))}
        </div>
      )}

      {/* Avisos recientes */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <SectionLabel>Avisos recientes</SectionLabel>
          <button onClick={() => navigate('/admin/avisos')} style={{ fontSize: 9, color: '#E0B05E', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.7 }}>Ver todos →</button>
        </div>
        {loading ? <div style={{ display:'flex',flexDirection:'column',gap:8 }}><SkeletonCard /><SkeletonCard lines={1} /></div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {avisos.map(a => (
              <AccentCard key={a.id} onClick={() => navigate(`/admin/aviso/${a.id}`)}
                accentColor={a.estado==='nuevo'?'#f87171':a.estado==='en_curso'?'#fbbf24':'#34d399'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                    <p style={{ fontSize: 13, color: 'rgba(242,224,201,0.88)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.titulo}</p>
                    <p style={{ fontSize: 9.5, color: 'rgba(180,190,205,0.3)', marginTop: 2 }}>{a.vecinos?.nombre} · Depto {a.vecinos?.departamento}</p>
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
