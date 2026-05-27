import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, OrnamentLine, Card, BottomNav } from '../components/Palace'

export default function HomeProveedor({ user }) {
  const navigate = useNavigate()
  const [disponible, setDisponible] = useState(user.disponible ?? true)
  const [mensajes, setMensajes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('mensajes').select('*, avisos(titulo, vecino_id)')
        .eq('proveedor_id', user.id).order('created_at', { ascending: false }).limit(10)
      setMensajes(data || [])
      setLoading(false)
    }
    fetch()
  }, [user.id])

  const toggleDisponible = async () => {
    const next = !disponible
    setDisponible(next)
    await supabase.from('proveedores').update({ disponible: next }).eq('id', user.id)
  }

  // Group mensajes by aviso
  const conversaciones = mensajes.reduce((acc, m) => {
    if (!acc[m.aviso_id]) acc[m.aviso_id] = { aviso: m.avisos, msgs: [], ultimoMsg: m }
    acc[m.aviso_id].msgs.push(m)
    return acc
  }, {})

  return (
    <div className="page">
      <PalaceFrame />

      {/* Header */}
      <div style={{ padding: '52px 24px 20px', textAlign: 'center' }}>
        <p className="animate-ornament" style={{ fontSize: 9, letterSpacing: '0.5em', color: '#60a5fa', marginBottom: 14 }}>✦ ✦ ✦</p>
        <h1 className="font-cormorant" style={{ fontSize: 28, fontWeight: 700, color: '#F2E0C9', lineHeight: 1.1 }}>
          {user.nombre}
        </h1>
        <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.35)', letterSpacing: '0.1em', marginTop: 4 }}>
          {user.especialidad || 'Proveedor'} · {user.edificio.nombre}
        </p>
        <div style={{ marginTop: 14 }}><OrnamentLine opacity={0.14} /></div>
      </div>

      {/* Disponibilidad toggle */}
      <div style={{ padding: '0 20px 24px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: disponible ? 'rgba(52,211,153,0.05)' : 'rgba(248,113,113,0.04)',
          border: `1px solid ${disponible ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.12)'}`,
          borderRadius: 14, padding: '14px 18px'
        }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#F2E0C9' }}>
              {disponible ? 'Disponible' : 'No disponible'}
            </p>
            <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.35)', marginTop: 2 }}>
              {disponible ? 'Recibiendo nuevos trabajos' : 'No recibís nuevos trabajos'}
            </p>
          </div>
          <button onClick={toggleDisponible} style={{
            width: 48, height: 26, borderRadius: 13,
            background: disponible ? 'rgba(52,211,153,0.7)' : 'rgba(248,113,113,0.4)',
            border: 'none', position: 'relative', transition: 'background 0.3s'
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', background: '#F2E0C9',
              position: 'absolute', top: 3, left: disponible ? 24 : 4, transition: 'left 0.3s'
            }} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '0 20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Card style={{ textAlign: 'center', padding: '14px 10px' }}>
          <p className="font-cormorant" style={{ fontSize: 28, fontWeight: 700, color: '#60a5fa', lineHeight: 1 }}>
            {Object.keys(conversaciones).length}
          </p>
          <p style={{ fontSize: 9, color: 'rgba(160,174,192,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>
            Conversaciones
          </p>
        </Card>
        <Card style={{ textAlign: 'center', padding: '14px 10px' }}>
          <p className="font-cormorant" style={{ fontSize: 28, fontWeight: 700, color: '#34d399', lineHeight: 1 }}>
            {mensajes.length}
          </p>
          <p style={{ fontSize: 9, color: 'rgba(160,174,192,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>
            Mensajes
          </p>
        </Card>
      </div>

      {/* Conversaciones recientes */}
      <div style={{ padding: '0 20px' }}>
        <p style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(160,174,192,0.3)', textTransform: 'uppercase', marginBottom: 14 }}>
          Conversaciones activas
        </p>
        {loading ? (
          <p style={{ fontSize: 12, color: 'rgba(160,174,192,0.25)', textAlign: 'center', padding: '20px 0' }}>Cargando...</p>
        ) : Object.keys(conversaciones).length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '28px 16px' }}>
            <p style={{ fontSize: 13, color: 'rgba(160,174,192,0.35)' }}>Sin conversaciones aún</p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(conversaciones).map(([avisoId, conv]) => (
              <Card key={avisoId} onClick={() => navigate(`/proveedor/chat/${avisoId}`)} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: '#F2E0C9', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conv.aviso?.titulo || 'Aviso'}
                  </p>
                  <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.35)', marginTop: 2 }}>
                    {conv.msgs.length} mensaje{conv.msgs.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <svg width="14" height="14" fill="none" stroke="rgba(160,174,192,0.25)" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav rol="proveedor" />
    </div>
  )
}
