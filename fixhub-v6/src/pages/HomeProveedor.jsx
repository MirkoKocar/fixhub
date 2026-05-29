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
      const { data } = await supabase.from('avisos').select('*, vecinos(nombre,departamento)')
        .eq('proveedor_id', user.id).order('created_at', { ascending: false })
      const todos = data || []
      setActivos(todos.filter(a => a.estado !== 'resuelto').slice(0, 5))
      setStats({ total: todos.length, completados: todos.filter(a => a.estado === 'resuelto').length, pendientes: todos.filter(a => a.estado !== 'resuelto').length })
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

      <div style={{ padding: '48px 20px 14px', textAlign: 'center' }}>
        <p className="font-cormorant animate-ornament" style={{ fontSize: 9, letterSpacing: '0.5em', color: '#D9CBB0', marginBottom: 10 }}>✦ ✦ ✦</p>
        <h1 className="font-cormorant" style={{ fontSize: 26, fontWeight: 700, color: '#F2E0C9', lineHeight: 1.05 }}>{user.nombre}</h1>
        <p style={{ fontSize: 9, color: 'rgba(160,174,192,0.25)', letterSpacing: '0.1em', marginTop: 3 }}>{user.especialidad} · {user.edificio.nombre}</p>
        <div style={{ marginTop: 10 }}><OrnamentLine /></div>
      </div>

      {/* Toggle disponibilidad */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${disponible ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.12)'}`, borderLeft: `2px solid ${disponible ? 'rgba(52,211,153,0.5)' : 'rgba(248,113,113,0.4)'}`, borderRadius: 5, padding: '12px 15px', background: disponible ? 'rgba(52,211,153,0.03)' : 'rgba(248,113,113,0.03)' }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: disponible ? 'rgba(52,211,153,0.85)' : 'rgba(248,113,113,0.75)' }}>{disponible ? 'Disponible' : 'No disponible'}</p>
            <p style={{ fontSize: 9, color: 'rgba(160,174,192,0.28)', marginTop: 2 }}>{disponible ? 'Recibiendo solicitudes' : 'No recibís solicitudes'}</p>
          </div>
          <button onClick={toggleDisponible} style={{ width: 42, height: 22, borderRadius: 11, background: disponible ? 'rgba(52,211,153,0.55)' : 'rgba(248,113,113,0.35)', border: 'none', position: 'relative', transition: 'background 0.3s', flexShrink: 0 }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#F2E0C9', position: 'absolute', top: 3, left: disponible ? 23 : 3, transition: 'left 0.3s' }} />
          </button>
        </div>
      </div>

      {/* Stats animados */}
      <div style={{ padding: '0 20px 16px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        {[{ label: 'Total', value: stats.total, color: 'rgba(242,224,201,0.7)' }, { label: 'Pendientes', value: stats.pendientes, color: '#fbbf24' }, { label: 'Completados', value: stats.completados, color: '#34d399' }].map(s => (
          <Card key={s.label} style={{ textAlign: 'center', padding: '12px 8px' }}>
            <AnimCounter value={s.value} color={s.color} size={26} />
            <p style={{ fontSize: 8, color: 'rgba(160,174,192,0.28)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div style={{ padding: '0 20px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Card onClick={() => navigate('/proveedor/agenda')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 13px' }}>
          <OrnIcon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" size={15} />
          <p style={{ fontSize: 12, color: 'rgba(242,224,201,0.72)', fontWeight: 500 }}>Mi agenda</p>
        </Card>
        <Card onClick={() => navigate('/proveedor/historial')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 13px' }}>
          <OrnIcon path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" size={15} />
          <p style={{ fontSize: 12, color: 'rgba(242,224,201,0.72)', fontWeight: 500 }}>Historial</p>
        </Card>
      </div>

      <div style={{ padding: '0 20px' }}><DiamondRow count={3} opacity={0.09} /></div>

      {/* Trabajos activos */}
      <div style={{ padding: '14px 20px 0' }}>
        <SectionLabel style={{ marginBottom: 10 }}>Trabajos activos</SectionLabel>
        {loading ? (
          <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.2)', textAlign: 'center', padding: '20px 0' }}>Cargando...</p>
        ) : activos.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '22px' }}>
            <p style={{ fontSize: 12, color: 'rgba(160,174,192,0.28)' }}>Sin trabajos activos</p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {activos.map(a => (
              <AccentCard key={a.id} onClick={() => navigate(`/proveedor/chat/${a.id}`)}
                accentColor={a.estado === 'nuevo' ? 'rgba(248,113,113,0.4)' : 'rgba(251,191,36,0.4)'}>
                <p style={{ fontSize: 13, color: 'rgba(242,224,201,0.85)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.titulo}</p>
                <p style={{ fontSize: 9, color: 'rgba(160,174,192,0.28)', marginTop: 3 }}>{a.vecinos?.nombre} · Depto {a.vecinos?.departamento}</p>
              </AccentCard>
            ))}
          </div>
        )}
      </div>

      <BottomNav rol="proveedor" />
    </div>
  )
}
