import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, OrnamentLine, DiamondRow, AccentCard, Card, BottomNav, SectionLabel, OrnIcon, AnimCounter } from '../components/Palace'

export default function HomeProveedor({ user }) {
  const navigate = useNavigate()
  const [disponible, setDisponible] = useState(user.disponible ?? true)
  const [activos, setActivos] = useState([])
  const [stats, setStats] = useState({ total: 0, completados: 0, pendientes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('avisos').select('*, vecinos(nombre,departamento)').eq('proveedor_id', user.id).order('created_at', { ascending: false })
      const todos = data || []
      setActivos(todos.filter(a => a.estado !== 'resuelto').slice(0, 5))
      setStats({ total: todos.length, completados: todos.filter(a => a.estado==='resuelto').length, pendientes: todos.filter(a => a.estado!=='resuelto').length })
      setLoading(false)
    }
    fetch()
  }, [user.id])

  const toggleDisponible = async () => {
    const next = !disponible
    setDisponible(next)
    await supabase.from('proveedores').update({ disponible: next }).eq('id', user.id)
  }

  return (
    <div className="page page-enter">
      <PalaceFrame />

      <div style={{ position: 'relative', padding: '52px 20px 24px', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(96,165,250,0.05) 0%, transparent 100%)', borderBottomLeftRadius: '50% 20px', borderBottomRightRadius: '50% 20px', pointerEvents: 'none' }} />
        <p className="font-cormorant animate-ornament" style={{ fontSize: 9, letterSpacing: '0.5em', color: '#E0B05E', marginBottom: 8 }}>✦ ✦ ✦</p>
        <h1 className="font-cormorant" style={{ fontSize: 26, fontWeight: 700, color: '#F2E0C9', lineHeight: 1.05 }}>{user.nombre}</h1>
        <p style={{ fontSize: 9.5, color: 'rgba(180,190,205,0.28)', letterSpacing: '0.1em', marginTop: 4 }}>{user.especialidad} · {user.edificio.nombre}</p>
        <div style={{ marginTop: 12 }}><OrnamentLine /></div>
      </div>

      {/* Toggle disponibilidad */}
      <div style={{ padding: '0 20px 18px' }}>
        <div onClick={toggleDisponible} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: disponible ? 'rgba(52,211,153,0.07)' : 'rgba(248,113,113,0.06)', border: `1px solid ${disponible ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.15)'}`, borderRadius: 16, padding: '14px 18px', cursor: 'pointer' }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: disponible ? '#34d399' : '#f87171' }}>{disponible ? 'Disponible' : 'No disponible'}</p>
            <p style={{ fontSize: 10, color: 'rgba(180,190,205,0.3)', marginTop: 2 }}>{disponible ? 'Recibiendo solicitudes' : 'No recibís solicitudes'}</p>
          </div>
          <div style={{ width: 46, height: 26, borderRadius: 999, background: disponible ? 'rgba(52,211,153,0.6)' : 'rgba(248,113,113,0.4)', position: 'relative', flexShrink: 0, transition: 'background 0.3s' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#F2E0C9', position: 'absolute', top: 3, left: disponible ? 23 : 3, transition: 'left 0.3s', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '0 20px 18px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9 }}>
        {[{label:'Total',value:stats.total,color:'rgba(242,224,201,0.75)'},{label:'Pendientes',value:stats.pendientes,color:'#fbbf24'},{label:'Completados',value:stats.completados,color:'#34d399'}].map(s => (
          <Card key={s.label} style={{ textAlign: 'center', padding: '13px 8px', borderRadius: 14 }}>
            <AnimCounter value={s.value} color={s.color} size={28} />
            <p style={{ fontSize: 8, color: 'rgba(180,190,205,0.28)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 5 }}>{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div style={{ padding: '0 20px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
        {[
          { label: 'Mi agenda', path: '/proveedor/agenda', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: '#E0B05E', bg: 'rgba(224,176,94,0.12)' },
          { label: 'Historial', path: '/proveedor/historial', d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
        ].map(item => (
          <div key={item.path} onClick={() => navigate(item.path)} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 16, padding: '14px 13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
            <OrnIcon path={item.d} color={item.color} bg={item.bg} size={16} />
            <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(242,224,201,0.8)' }}>{item.label}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 20px' }}><DiamondRow count={3} opacity={0.1} /></div>

      {/* Trabajos activos */}
      <div style={{ padding: '14px 20px 0' }}>
        <SectionLabel style={{ marginBottom: 10 }}>Trabajos activos</SectionLabel>
        {loading ? <p style={{ fontSize: 11, color: 'rgba(180,190,205,0.2)', textAlign: 'center', padding: '20px 0' }}>Cargando...</p>
          : activos.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '22px', borderRadius: 16 }}>
              <p style={{ fontSize: 12, color: 'rgba(180,190,205,0.3)' }}>Sin trabajos activos</p>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activos.map(a => (
                <AccentCard key={a.id} onClick={() => navigate(`/proveedor/chat/${a.id}`)}
                  accentColor={a.estado==='nuevo'?'#f87171':'#fbbf24'}>
                  <p style={{ fontSize: 13, color: 'rgba(242,224,201,0.88)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.titulo}</p>
                  <p style={{ fontSize: 9.5, color: 'rgba(180,190,205,0.3)', marginTop: 3 }}>{a.vecinos?.nombre} · Depto {a.vecinos?.departamento}</p>
                </AccentCard>
              ))}
            </div>
          )}
      </div>

      <BottomNav rol="proveedor" />
    </div>
  )
}
