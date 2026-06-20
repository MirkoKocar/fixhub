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

  useEffect(() => {
    const fetch = async () => {
      const [avRes, anRes, emRes, encRes] = await Promise.all([
        supabase.from('avisos').select('*').eq('vecino_id', user.id).order('created_at', { ascending: false }).limit(3),
        supabase.from('anuncios').select('*').eq('edificio_id', user.edificio.id).order('created_at', { ascending: false }).limit(2),
        supabase.from('emergencias').select('*').eq('edificio_id', user.edificio.id).limit(4),
        supabase.from('encuestas').select('*').eq('edificio_id', user.edificio.id).eq('activa', true).limit(1),
      ])
      setAvisos(avRes.data || [])
      setAnuncios(anRes.data || [])
      setEmergencias(emRes.data || [])
      if (encRes.data?.length > 0) setEncuesta(encRes.data[0])
      setLoading(false)
    }
    fetch()

    const channel = supabase.channel(`notif-${user.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'avisos', filter: `vecino_id=eq.${user.id}` },
        payload => {
          const labels = { en_curso: 'En curso', resuelto: 'Resuelto' }
          if (labels[payload.new.estado]) {
            setNotif(`Tu aviso pasó a "${labels[payload.new.estado]}"`)
            setTimeout(() => setNotif(null), 5000)
          }
          setAvisos(prev => prev.map(a => a.id === payload.new.id ? payload.new : a))
        })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [user.id])

  const acciones = [
    { label: 'Reportar', sub: 'Nuevo aviso', path: '/aviso', d: 'M12 4v16m8-8H4', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
    { label: 'Servicios', sub: 'Proveedores', path: '/proveedores', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
    { label: 'Mis avisos', sub: 'Historial', path: '/avisos', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: '#E0B05E', bg: 'rgba(224,176,94,0.12)' },
    { label: 'Reservas', sub: 'Espacios comunes', path: '/reservas', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  ]

  return (
    <div className="page page-enter">
      <PalaceFrame />
      {notif && <NotifBanner message={notif} onClose={() => setNotif(null)} />}

      {/* Hero header con fondo curvo */}
      <div style={{ position: 'relative', padding: '52px 20px 28px', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(224,176,94,0.06) 0%, transparent 100%)', borderBottomLeftRadius: '50% 20px', borderBottomRightRadius: '50% 20px', pointerEvents: 'none' }} />
        <p className="font-cormorant animate-ornament" style={{ fontSize: 9, letterSpacing: '0.5em', color: '#E0B05E', marginBottom: 8 }}>✦ ✦ ✦</p>
        <p style={{ fontSize: 10, color: 'rgba(180,190,205,0.35)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 4 }}>{getSaludo()}</p>
        <h1 className="font-cormorant" style={{ fontSize: 30, fontWeight: 700, color: '#F2E0C9', lineHeight: 1.05 }}>{user.nombre.split(' ')[0]}.</h1>
        <p style={{ fontSize: 9.5, color: 'rgba(180,190,205,0.28)', letterSpacing: '0.1em', marginTop: 4 }}>Depto {user.departamento} · {user.edificio.nombre}</p>
        <div style={{ marginTop: 14 }}><OrnamentLine /></div>
      </div>

      {/* Anuncios */}
      {anuncios.length > 0 && (
        <div style={{ padding: '0 20px 16px' }}>
          <SectionLabel style={{ marginBottom: 9 }}>Tablón</SectionLabel>
          {anuncios.map(a => (
            <AccentCard key={a.id} accentColor={a.prioridad === 'urgente' ? '#f87171' : '#E0B05E'} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 12, color: '#F2E0C9', fontWeight: 600 }}>{a.titulo}</p>
              <p style={{ fontSize: 11, color: 'rgba(180,190,205,0.45)', marginTop: 4, lineHeight: 1.5 }}>{a.contenido}</p>
            </AccentCard>
          ))}
        </div>
      )}

      {/* Encuesta activa */}
      {encuesta && (
        <div style={{ padding: '0 20px 16px' }}>
          <div onClick={() => navigate('/encuesta/' + encuesta.id)} style={{ background: 'linear-gradient(135deg, rgba(96,165,250,0.1) 0%, rgba(96,165,250,0.04) 100%)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 16, padding: '14px 16px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }}>
            <OrnIcon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" color="#60a5fa" bg="rgba(96,165,250,0.12)" />
            <div>
              <p style={{ fontSize: 12, color: '#F2E0C9', fontWeight: 600 }}>{encuesta.titulo}</p>
              <p style={{ fontSize: 10, color: 'rgba(96,165,250,0.7)', marginTop: 2 }}>Encuesta activa · Respondé ahora</p>
            </div>
          </div>
        </div>
      )}

      {/* Acceso rápido — grid 2x2 con iconos con color */}
      <div style={{ padding: '0 20px 20px' }}>
        <SectionLabel style={{ marginBottom: 10 }}>Acceso rápido</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {acciones.map(item => (
            <div key={item.path} onClick={() => navigate(item.path)} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 18, padding: '16px 14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <OrnIcon path={item.d} color={item.color} bg={item.bg} size={17} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(242,224,201,0.88)', lineHeight: 1.2 }}>{item.label}</p>
                <p style={{ fontSize: 10, color: 'rgba(180,190,205,0.3)', marginTop: 2 }}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergencias */}
      {emergencias.length > 0 && (
        <div style={{ padding: '0 20px 16px' }}>
          <SectionLabel style={{ marginBottom: 9 }}>Emergencias</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {emergencias.map(e => (
              <a key={e.id} href={`tel:${e.telefono}`} style={{ display: 'block', textDecoration: 'none', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 14, padding: '12px 14px' }}>
                <p style={{ fontSize: 11, color: 'rgba(242,224,201,0.8)', fontWeight: 600, marginBottom: 3 }}>{e.nombre}</p>
                <p style={{ fontSize: 13, color: '#f87171', fontFamily: "'Cormorant Garamond',serif", fontWeight: 700 }}>{e.telefono}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: '0 20px 4px' }}><DiamondRow count={3} opacity={0.12} /></div>

      {/* Últimos avisos */}
      <div style={{ padding: '12px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <SectionLabel>Últimos avisos</SectionLabel>
          <button onClick={() => navigate('/avisos')} style={{ fontSize: 9, color: '#E0B05E', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.7 }}>Ver todos →</button>
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><SkeletonCard /><SkeletonCard lines={1} /></div>
        ) : avisos.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '22px' }}>
            <p style={{ fontSize: 12, color: 'rgba(180,190,205,0.3)' }}>Sin avisos recientes</p>
            <button onClick={() => navigate('/aviso')} style={{ marginTop: 8, fontSize: 10, color: '#E0B05E', opacity: 0.7 }}>Crear aviso →</button>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {avisos.map(a => {
              const stateIdx = ['nuevo','en_curso','resuelto'].indexOf(a.estado)
              return (
                <AccentCard key={a.id} onClick={() => navigate(`/chat/${a.id}`)}
                  accentColor={a.estado==='nuevo'?'#f87171':a.estado==='en_curso'?'#fbbf24':'#34d399'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <p style={{ fontSize: 13, color: 'rgba(242,224,201,0.88)', fontWeight: 600, flex: 1, minWidth: 0, marginRight: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.titulo}</p>
                    <StatusBadge estado={a.estado} />
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {['nuevo','en_curso','resuelto'].map((e, i) => (
                      <div key={e} style={{ flex: 1, height: 3, borderRadius: 999, background: i <= stateIdx ? (e==='resuelto'?'rgba(52,211,153,0.7)':e==='en_curso'?'rgba(251,191,36,0.7)':'rgba(248,113,113,0.7)') : 'rgba(255,255,255,0.07)', transition: 'background 0.3s' }} />
                    ))}
                  </div>
                </AccentCard>
              )
            })}
          </div>
        )}
      </div>

      <div style={{ padding: '16px 20px 0', textAlign: 'center' }}>
        <button onClick={() => navigate('/guia')} style={{ fontSize: 9, color: 'rgba(180,190,205,0.22)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Ver guía de la app →</button>
      </div>

      <BottomNav rol="vecino" />
    </div>
  )
}
