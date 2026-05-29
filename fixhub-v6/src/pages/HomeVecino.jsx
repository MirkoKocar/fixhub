import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, OrnamentLine, DiamondRow, Card, AccentCard, StatusBadge, BottomNav, SectionLabel, OrnIcon, SkeletonCard, NotifBanner } from '../components/Palace'

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
  const [emergencias, setEmergencias] = useState([])
  const [encuesta, setEncuesta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notif, setNotif] = useState(null)
  const [showGuia, setShowGuia] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const [avRes, anRes, emRes, encRes] = await Promise.all([
        supabase.from('avisos').select('*').eq('vecino_id', user.id).order('created_at', { ascending: false }).limit(3),
        supabase.from('anuncios').select('*').eq('edificio_id', user.edificio.id).order('created_at', { ascending: false }).limit(2),
        supabase.from('emergencias').select('*').eq('edificio_id', user.edificio.id).limit(5),
        supabase.from('encuestas').select('*').eq('edificio_id', user.edificio.id).eq('activa', true).limit(1),
      ])
      setAvisos(avRes.data || [])
      setAnuncios(anRes.data || [])
      setEmergencias(emRes.data || [])
      if (encRes.data?.length > 0) setEncuesta(encRes.data[0])
      setLoading(false)
    }
    fetch()

    // Realtime para notificaciones de cambio de estado
    const channel = supabase.channel(`notif-vecino-${user.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'avisos', filter: `vecino_id=eq.${user.id}` },
        payload => {
          const estadoLabels = { en_curso: 'En curso', resuelto: 'Resuelto' }
          if (estadoLabels[payload.new.estado]) {
            setNotif(`Tu aviso pasó a "${estadoLabels[payload.new.estado]}"`)
            setTimeout(() => setNotif(null), 5000)
          }
          setAvisos(prev => prev.map(a => a.id === payload.new.id ? payload.new : a))
        })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [user.id])

  const acciones = [
    { label: 'Reportar', sub: 'Nuevo aviso', path: '/aviso', d: 'M12 4v16m8-8H4' },
    { label: 'Servicios', sub: 'Proveedores', path: '/proveedores', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0' },
    { label: 'Mis avisos', sub: 'Historial', path: '/avisos', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'Reservas', sub: 'Espacios comunes', path: '/reservas', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ]

  return (
    <div className="page page-enter">
      <PalaceFrame />
      {notif && <NotifBanner message={notif} onClose={() => setNotif(null)} />}

      {/* Header */}
      <div style={{ padding: '48px 20px 16px', textAlign: 'center' }}>
        <p className="font-cormorant animate-ornament" style={{ fontSize: 9, letterSpacing: '0.5em', color: '#D9CBB0', marginBottom: 10 }}>✦ ✦ ✦</p>
        <p style={{ fontSize: 9, color: 'rgba(160,174,192,0.28)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>{getSaludo()}</p>
        <h1 className="font-cormorant" style={{ fontSize: 28, fontWeight: 700, color: '#F2E0C9', lineHeight: 1.05 }}>{user.nombre.split(' ')[0]}.</h1>
        <p style={{ fontSize: 9, color: 'rgba(160,174,192,0.25)', letterSpacing: '0.1em', marginTop: 3 }}>Depto {user.departamento} · {user.edificio.nombre}</p>
        <div style={{ marginTop: 12 }}><OrnamentLine /></div>
      </div>

      {/* Anuncios */}
      {anuncios.length > 0 && (
        <div style={{ padding: '0 20px 16px' }}>
          <SectionLabel style={{ marginBottom: 8 }}>Tablón</SectionLabel>
          {anuncios.map(a => (
            <AccentCard key={a.id} accentColor={a.prioridad === 'urgente' ? 'rgba(248,113,113,0.5)' : 'rgba(217,203,176,0.2)'} style={{ marginBottom: 7 }}>
              <p style={{ fontSize: 12, color: '#F2E0C9', fontWeight: 500 }}>{a.titulo}</p>
              <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.38)', marginTop: 3, lineHeight: 1.4 }}>{a.contenido}</p>
            </AccentCard>
          ))}
        </div>
      )}

      {/* Encuesta activa */}
      {encuesta && (
        <div style={{ padding: '0 20px 16px' }}>
          <AccentCard accentColor="rgba(96,165,250,0.4)" onClick={() => navigate('/encuesta/' + encuesta.id)} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <OrnIcon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" color="rgba(96,165,250,0.6)" />
              <div>
                <p style={{ fontSize: 12, color: '#F2E0C9', fontWeight: 500 }}>{encuesta.titulo}</p>
                <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.35)', marginTop: 2 }}>Encuesta activa · Tocá para responder</p>
              </div>
            </div>
          </AccentCard>
        </div>
      )}

      {/* Acciones */}
      <div style={{ padding: '0 20px 16px' }}>
        <SectionLabel style={{ marginBottom: 10 }}>Acceso rápido</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {acciones.map(item => (
            <Card key={item.path} onClick={() => navigate(item.path)} style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: '13px 13px' }}>
              <OrnIcon path={item.d} size={15} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(242,224,201,0.82)', lineHeight: 1.2 }}>{item.label}</p>
                <p style={{ fontSize: 9, color: 'rgba(160,174,192,0.26)', marginTop: 2 }}>{item.sub}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Emergencias */}
      {emergencias.length > 0 && (
        <div style={{ padding: '0 20px 16px' }}>
          <SectionLabel style={{ marginBottom: 8 }}>Contactos de emergencia</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {emergencias.map(e => (
              <AccentCard key={e.id} accentColor="rgba(248,113,113,0.3)">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 12, color: 'rgba(242,224,201,0.8)', fontWeight: 500 }}>{e.nombre}</p>
                    <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.3)', marginTop: 1 }}>{e.descripcion}</p>
                  </div>
                  <a href={`tel:${e.telefono}`} style={{ fontSize: 13, color: 'rgba(248,113,113,0.7)', fontFamily: "'Cormorant Garamond',serif", fontWeight: 600, letterSpacing: '0.04em' }}>{e.telefono}</a>
                </div>
              </AccentCard>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: '0 20px' }}><DiamondRow count={3} opacity={0.1} /></div>

      {/* Últimos avisos */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <SectionLabel>Últimos avisos</SectionLabel>
          <button onClick={() => navigate('/avisos')} style={{ fontSize: 9, color: 'rgba(217,203,176,0.28)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Ver todos →</button>
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkeletonCard /><SkeletonCard lines={1} />
          </div>
        ) : avisos.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ fontSize: 12, color: 'rgba(160,174,192,0.28)' }}>Sin avisos recientes</p>
            <button onClick={() => navigate('/aviso')} style={{ marginTop: 8, fontSize: 9, color: 'rgba(217,203,176,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Crear aviso →</button>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {avisos.map(a => (
              <AccentCard key={a.id} onClick={() => navigate(`/chat/${a.id}`)}
                accentColor={a.estado === 'nuevo' ? 'rgba(248,113,113,0.45)' : a.estado === 'en_curso' ? 'rgba(251,191,36,0.45)' : 'rgba(52,211,153,0.35)'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                    <p style={{ fontSize: 13, color: 'rgba(242,224,201,0.85)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.titulo}</p>
                    {/* Progress bar */}
                    <div style={{ display: 'flex', gap: 4, marginTop: 6, alignItems: 'center' }}>
                      {['nuevo','en_curso','resuelto'].map((e, i) => {
                        const idx = ['nuevo','en_curso','resuelto'].indexOf(a.estado)
                        const active = i <= idx
                        return <div key={e} style={{ flex: 1, height: 2, borderRadius: 1, background: active ? (e === 'resuelto' ? 'rgba(52,211,153,0.6)' : e === 'en_curso' ? 'rgba(251,191,36,0.6)' : 'rgba(248,113,113,0.6)') : 'rgba(217,203,176,0.08)', transition: 'background 0.3s' }} />
                      })}
                    </div>
                  </div>
                  <StatusBadge estado={a.estado} />
                </div>
              </AccentCard>
            ))}
          </div>
        )}
      </div>

      {/* Guía */}
      <div style={{ padding: '16px 20px 0', textAlign: 'center' }}>
        <button onClick={() => navigate('/guia')} style={{ fontSize: 9, color: 'rgba(160,174,192,0.2)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Ver guía de la app →</button>
      </div>

      <BottomNav rol="vecino" />
    </div>
  )
}
