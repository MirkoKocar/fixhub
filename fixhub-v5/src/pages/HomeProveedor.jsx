import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, OrnamentLine, DiamondRow, AccentCard, Card, BottomNav, SectionLabel, OrnIcon } from '../components/Palace'

export default function HomeProveedor({ user }) {
  const navigate = useNavigate()
  const [disponible, setDisponible] = useState(user.disponible ?? true)
  const [conversaciones, setConversaciones] = useState([])
  const [stats, setStats] = useState({ total: 0, pendientes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data: avisos } = await supabase.from('avisos').select('*, vecinos(nombre, departamento)')
        .eq('proveedor_id', user.id).order('created_at', { ascending: false })
      setConversaciones(avisos || [])
      setStats({
        total: avisos?.length || 0,
        pendientes: avisos?.filter(a => a.estado !== 'resuelto').length || 0
      })
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
    <div className="page">
      <PalaceFrame />

      <div style={{ padding: '52px 24px 20px', textAlign: 'center' }}>
        <p className="font-cormorant animate-ornament" style={{ fontSize: 9, letterSpacing: '0.5em', color: '#D9CBB0', marginBottom: 12 }}>✦ ✦ ✦</p>
        <h1 className="font-cormorant" style={{ fontSize: 28, fontWeight: 700, color: '#F2E0C9', lineHeight: 1.05 }}>{user.nombre}</h1>
        <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.28)', letterSpacing: '0.12em', marginTop: 4 }}>
          {user.especialidad} · {user.edificio.nombre}
        </p>
        <div style={{ marginTop: 14 }}><OrnamentLine /></div>
      </div>

      {/* Disponibilidad */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          border: `1px solid ${disponible ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.12)'}`,
          borderLeft: `2px solid ${disponible ? 'rgba(52,211,153,0.5)' : 'rgba(248,113,113,0.4)'}`,
          borderRadius: 4, padding: '14px 16px',
          background: disponible ? 'rgba(52,211,153,0.04)' : 'rgba(248,113,113,0.03)'
        }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: disponible ? 'rgba(52,211,153,0.9)' : 'rgba(248,113,113,0.8)' }}>
              {disponible ? 'Disponible' : 'No disponible'}
            </p>
            <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.3)', marginTop: 2 }}>
              {disponible ? 'Recibiendo solicitudes' : 'No recibís solicitudes'}
            </p>
          </div>
          <button onClick={toggleDisponible} style={{
            width: 44, height: 24, borderRadius: 12,
            background: disponible ? 'rgba(52,211,153,0.6)' : 'rgba(248,113,113,0.35)',
            border: 'none', position: 'relative', transition: 'background 0.3s', flexShrink: 0
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%', background: '#F2E0C9',
              position: 'absolute', top: 3, left: disponible ? 23 : 3, transition: 'left 0.3s'
            }} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '0 20px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Card style={{ textAlign: 'center', padding: '14px 10px' }}>
          <p className="font-cormorant" style={{ fontSize: 30, fontWeight: 700, color: 'rgba(242,224,201,0.8)', lineHeight: 1 }}>{stats.total}</p>
          <p style={{ fontSize: 8.5, color: 'rgba(160,174,192,0.28)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 5 }}>Trabajos totales</p>
        </Card>
        <Card style={{ textAlign: 'center', padding: '14px 10px' }}>
          <p className="font-cormorant" style={{ fontSize: 30, fontWeight: 700, color: '#fbbf24', lineHeight: 1 }}>{stats.pendientes}</p>
          <p style={{ fontSize: 8.5, color: 'rgba(160,174,192,0.28)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 5 }}>Pendientes</p>
        </Card>
      </div>

      <div style={{ padding: '0 20px' }}><DiamondRow count={3} opacity={0.1} /></div>

      {/* Acciones extra */}
      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Card onClick={() => navigate('/proveedor/agenda')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px' }}>
          <OrnIcon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" size={15} />
          <p style={{ fontSize: 12, color: 'rgba(242,224,201,0.7)', fontWeight: 500 }}>Mi agenda</p>
        </Card>
        <Card onClick={() => navigate('/proveedor/historial')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px' }}>
          <OrnIcon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" size={15} />
          <p style={{ fontSize: 12, color: 'rgba(242,224,201,0.7)', fontWeight: 500 }}>Historial</p>
        </Card>
      </div>

      {/* Trabajos activos */}
      <div style={{ padding: '0 20px' }}>
        <SectionLabel style={{ marginBottom: 12 }}>Trabajos activos</SectionLabel>
        {loading ? (
          <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.2)', textAlign: 'center', padding: '20px 0' }}>Cargando...</p>
        ) : conversaciones.filter(a => a.estado !== 'resuelto').length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '24px' }}>
            <p style={{ fontSize: 12, color: 'rgba(160,174,192,0.28)' }}>Sin trabajos activos</p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {conversaciones.filter(a => a.estado !== 'resuelto').map(a => (
              <AccentCard key={a.id} onClick={() => navigate(`/proveedor/chat/${a.id}`)}
                accentColor={a.estado === 'nuevo' ? 'rgba(248,113,113,0.4)' : 'rgba(251,191,36,0.4)'}>
                <p style={{ fontSize: 13, color: 'rgba(242,224,201,0.85)', fontWeight: 500 }}>{a.titulo}</p>
                <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.3)', marginTop: 2 }}>
                  {a.vecinos?.nombre} · Depto {a.vecinos?.departamento}
                </p>
              </AccentCard>
            ))}
          </div>
        )}
      </div>

      <BottomNav rol="proveedor" />
    </div>
  )
}
