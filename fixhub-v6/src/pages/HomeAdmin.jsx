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

  // Multi-edificio: si el admin tiene edificios_ids, puede switchear
  const [edificioActual, setEdificioActual] = useState(user.edificio)

  useEffect(() => {
    const fetch = async () => {
      const [avRes, resRes, recRes] = await Promise.all([
        supabase.from('avisos').select('*, vecinos(nombre,departamento)').eq('edificio_id', edificioActual.id).order('created_at', { ascending: false }),
        supabase.from('reservas').select('*').eq('edificio_id', edificioActual.id).eq('estado', 'confirmada').order('fecha', { ascending: true }).limit(4),
        supabase.from('recordatorios').select('*').eq('edificio_id', edificioActual.id).eq('completado', false).order('fecha', { ascending: true }).limit(3),
      ])
      const av = avRes.data || []
      const resueltos = av.filter(a => a.estado === 'resuelto')
      let promedioDias = 0
      if (resueltos.length > 0) {
        const totalDias = resueltos.reduce((sum, a) => {
          const diff = (new Date(a.updated_at || a.created_at) - new Date(a.created_at)) / (1000 * 60 * 60 * 24)
          return sum + diff
        }, 0)
        promedioDias = Math.round(totalDias / resueltos.length * 10) / 10
      }
      setAvisos(av.slice(0, 4))
      setStats({ nuevo: av.filter(a => a.estado === 'nuevo').length, en_curso: av.filter(a => a.estado === 'en_curso').length, resuelto: av.filter(a => a.estado === 'resuelto').length, promedioDias })
      setReservas(resRes.data || [])
      setRecordatorios(recRes.data || [])
      setLoading(false)
    }
    fetch()
  }, [edificioActual.id])

  const acciones = [
    { label: 'Avisos', path: '/admin/avisos', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'Proveedores', path: '/admin/proveedores', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0' },
    { label: 'Tablón', path: '/admin/tablon', d: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.952 9.168-5' },
    { label: 'Votaciones', path: '/admin/votaciones', d: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
    { label: 'Encuestas', path: '/admin/encuestas', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { label: 'Vecinos', path: '/admin/vecinos', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  ]

  return (
    <div className="page page-enter">
      <PalaceFrame />

      <div style={{ padding: '48px 20px 14px', textAlign: 'center' }}>
        <p className="font-cormorant animate-ornament" style={{ fontSize: 9, letterSpacing: '0.5em', color: '#D9CBB0', marginBottom: 10 }}>✦ ✦ ✦</p>
        <h1 className="font-cormorant" style={{ fontSize: 24, fontWeight: 700, color: '#F2E0C9', lineHeight: 1.05 }}>Panel de Administración</h1>
        <p style={{ fontSize: 9, color: 'rgba(160,174,192,0.25)', letterSpacing: '0.1em', marginTop: 3 }}>{edificioActual.nombre}</p>
        <div style={{ marginTop: 10 }}><OrnamentLine /></div>
      </div>

      {/* Stats con animación */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {[{label:'Nuevos',value:stats.nuevo,color:'#f87171'},{label:'En curso',value:stats.en_curso,color:'#fbbf24'},{label:'Resueltos',value:stats.resuelto,color:'#34d399'}].map(s => (
            <div key={s.label} style={{ border:`1px solid ${s.color}15`, borderTop:`2px solid ${s.color}35`, borderRadius:4, padding:'12px 8px', textAlign:'center', background:`${s.color}03` }}>
              <AnimCounter value={s.value} color={s.color} size={28} />
              <p style={{ fontSize:8, color:'rgba(160,174,192,0.28)', letterSpacing:'0.1em', marginTop:5, textTransform:'uppercase' }}>{s.label}</p>
            </div>
          ))}
        </div>
        {stats.promedioDias > 0 && (
          <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.28)', textAlign: 'center', marginTop: 8, letterSpacing: '0.06em' }}>
            Promedio de resolución: <span style={{ color: 'rgba(242,224,201,0.5)' }}>{stats.promedioDias} días</span>
          </p>
        )}
      </div>

      {/* Recordatorios urgentes */}
      {recordatorios.length > 0 && (
        <div style={{ padding: '0 20px 14px' }}>
          <SectionLabel style={{ marginBottom: 8 }}>Mantenimiento pendiente</SectionLabel>
          {recordatorios.map(r => {
            const dias = Math.ceil((new Date(r.fecha) - new Date()) / (1000*60*60*24))
            const color = dias <= 7 ? '#f87171' : dias <= 30 ? '#fbbf24' : 'rgba(217,203,176,0.4)'
            return (
              <AccentCard key={r.id} accentColor={color + '60'} style={{ marginBottom: 6 }} onClick={() => navigate('/admin/recordatorios')}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: 12, color: 'rgba(242,224,201,0.8)' }}>{r.tipo}</p>
                  <p style={{ fontSize: 9, color, letterSpacing: '0.06em' }}>{dias <= 0 ? 'Vencido' : `${dias}d`}</p>
                </div>
              </AccentCard>
            )
          })}
        </div>
      )}

      {/* Acciones */}
      <div style={{ padding: '0 20px 14px' }}>
        <SectionLabel style={{ marginBottom: 10 }}>Gestión</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
          {acciones.map(item => (
            <Card key={item.path} onClick={() => navigate(item.path)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 13px' }}>
              <OrnIcon path={item.d} size={15} />
              <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(242,224,201,0.72)', lineHeight: 1.2 }}>{item.label}</p>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px' }}><DiamondRow count={3} opacity={0.09} /></div>

      {/* Reservas próximas */}
      {reservas.length > 0 && (
        <div style={{ padding: '14px 20px 0' }}>
          <SectionLabel style={{ marginBottom: 8 }}>Reservas hoy / próximas</SectionLabel>
          {reservas.map(r => (
            <AccentCard key={r.id} accentColor="rgba(217,203,176,0.18)" style={{ marginBottom: 6 }}>
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
      )}

      {/* Avisos recientes */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <SectionLabel>Avisos recientes</SectionLabel>
          <button onClick={() => navigate('/admin/avisos')} style={{ fontSize: 9, color: 'rgba(217,203,176,0.26)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Ver todos →</button>
        </div>
        {loading ? <div style={{ display:'flex',flexDirection:'column',gap:7 }}><SkeletonCard /><SkeletonCard lines={1} /></div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {avisos.map(a => (
              <AccentCard key={a.id} onClick={() => navigate(`/admin/aviso/${a.id}`)}
                accentColor={a.estado==='nuevo'?'rgba(248,113,113,0.4)':a.estado==='en_curso'?'rgba(251,191,36,0.4)':'rgba(52,211,153,0.35)'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                    <p style={{ fontSize: 13, color: 'rgba(242,224,201,0.85)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.titulo}</p>
                    <p style={{ fontSize: 9, color: 'rgba(160,174,192,0.28)', marginTop: 2 }}>{a.vecinos?.nombre} · Depto {a.vecinos?.departamento}</p>
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
