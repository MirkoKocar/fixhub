import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, OrnamentLine, DiamondRow, Card, AccentCard, StatusBadge, BottomNav, SectionLabel, OrnIcon } from '../components/Palace'

function getSaludo() {
  const h = new Date().getHours()
  if (h >= 6 && h < 13) return 'Buenos días'
  if (h >= 13 && h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function HomeVecino({ user }) {
  const navigate = useNavigate()
  const [avisos, setAvisos] = useState([])
  const [anuncios, setAnuncios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data: av } = await supabase.from('avisos').select('*')
        .eq('vecino_id', user.id).order('created_at', { ascending: false }).limit(3)
      const { data: an } = await supabase.from('anuncios').select('*')
        .eq('edificio_id', user.edificio.id).order('created_at', { ascending: false }).limit(2)
      setAvisos(av || [])
      setAnuncios(an || [])
      setLoading(false)
    }
    fetch()
  }, [user.id])

  const acciones = [
    { label: 'Reportar problema', sub: 'Nuevo aviso', path: '/aviso', d: 'M12 4v16m8-8H4' },
    { label: 'Servicios', sub: 'Ver proveedores', path: '/proveedores', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0' },
    { label: 'Mis avisos', sub: 'Historial', path: '/avisos', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'Reservas', sub: 'Espacios comunes', path: '/reservas', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ]

  return (
    <div className="page">
      <PalaceFrame />

      {/* Header */}
      <div style={{ padding: '52px 24px 20px', textAlign: 'center' }}>
        <p className="font-cormorant animate-ornament" style={{ fontSize: 9, letterSpacing: '0.5em', color: '#D9CBB0', marginBottom: 12 }}>✦ ✦ ✦</p>
        <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>{getSaludo()}</p>
        <h1 className="font-cormorant" style={{ fontSize: 32, fontWeight: 700, color: '#F2E0C9', lineHeight: 1.05 }}>
          {user.nombre.split(' ')[0]}.
        </h1>
        <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.28)', letterSpacing: '0.12em', marginTop: 4 }}>
          Depto {user.departamento} · {user.edificio.nombre}
        </p>
        <div style={{ marginTop: 14 }}><OrnamentLine /></div>
      </div>

      {/* Anuncios del edificio */}
      {anuncios.length > 0 && (
        <div style={{ padding: '0 20px 20px' }}>
          <SectionLabel style={{ marginBottom: 10 }}>Tablón de anuncios</SectionLabel>
          {anuncios.map(a => (
            <AccentCard key={a.id} accentColor="rgba(217,203,176,0.25)" style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 12, color: '#F2E0C9', fontWeight: 500 }}>{a.titulo}</p>
              <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.4)', marginTop: 3, lineHeight: 1.4 }}>{a.contenido}</p>
            </AccentCard>
          ))}
          <div style={{ marginTop: 14 }}><OrnamentLine opacity={0.08} /></div>
        </div>
      )}

      {/* Acceso rápido */}
      <div style={{ padding: '0 20px 20px' }}>
        <SectionLabel style={{ marginBottom: 12 }}>Acceso rápido</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {acciones.map(item => (
            <Card key={item.path} onClick={() => navigate(item.path)} style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 14px' }}>
              <OrnIcon path={item.d} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(242,224,201,0.85)', lineHeight: 1.2 }}>{item.label}</p>
                <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.28)', marginTop: 2 }}>{item.sub}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px' }}><DiamondRow count={3} opacity={0.12} /></div>

      {/* Últimos avisos */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <SectionLabel>Últimos avisos</SectionLabel>
          <button onClick={() => navigate('/avisos')} style={{ fontSize: 9, color: 'rgba(217,203,176,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Ver todos →</button>
        </div>
        {loading ? (
          <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.2)', textAlign: 'center', padding: '20px 0' }}>Cargando...</p>
        ) : avisos.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '24px 16px' }}>
            <p style={{ fontSize: 12, color: 'rgba(160,174,192,0.3)' }}>Sin avisos recientes</p>
            <button onClick={() => navigate('/aviso')} style={{ marginTop: 10, fontSize: 10, color: 'rgba(217,203,176,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Crear aviso →
            </button>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {avisos.map(a => (
              <AccentCard key={a.id} onClick={() => navigate(`/chat/${a.id}`)}
                accentColor={a.estado === 'nuevo' ? 'rgba(248,113,113,0.5)' : a.estado === 'en_curso' ? 'rgba(251,191,36,0.5)' : 'rgba(52,211,153,0.4)'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                    <p style={{ fontSize: 13, color: 'rgba(242,224,201,0.85)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.titulo}</p>
                    <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.3)', marginTop: 2 }}>{a.categoria}</p>
                  </div>
                  <StatusBadge estado={a.estado} />
                </div>
              </AccentCard>
            ))}
          </div>
        )}
      </div>

      <BottomNav rol="vecino" />
    </div>
  )
}
