import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, PageHeader, AccentCard, OrnamentLine, BottomNav, SectionLabel } from '../components/Palace'

const ESPECIALIDADES = ['Todos','Plomería','Electricidad','Gas','Ascensor','Limpieza','Seguridad','Estructura','Internet']

function StarRating({ valor }) {
  const stars = Math.round((valor / 100) * 5)
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{
          width: 5, height: 5, transform: 'rotate(45deg)',
          background: i <= stars ? 'rgba(217,203,176,0.7)' : 'rgba(217,203,176,0.12)',
          border: `1px solid ${i <= stars ? 'rgba(217,203,176,0.4)' : 'rgba(217,203,176,0.08)'}`
        }} />
      ))}
    </div>
  )
}

export default function Proveedores({ user }) {
  const navigate = useNavigate()
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('Todos')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('proveedores').select('*')
        .eq('edificio_id', user.edificio.id).order('ranking', { ascending: false })
      setProveedores(data || [])
      setLoading(false)
    }
    fetch()
  }, [user.edificio.id])

  const filtrados = filtro === 'Todos' ? proveedores : proveedores.filter(p => p.especialidad === filtro)

  // Perfil de proveedor
  if (selected) return (
    <div className="page">
      <PalaceFrame />
      <PageHeader title={selected.nombre} subtitle={selected.especialidad} onBack={() => setSelected(null)} />
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Disponibilidad */}
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <span style={{
            fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '5px 16px', borderRadius: 2,
            background: selected.disponible ? 'rgba(52,211,153,0.07)' : 'rgba(248,113,113,0.06)',
            border: `1px solid ${selected.disponible ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.15)'}`,
            color: selected.disponible ? '#34d399' : '#f87171'
          }}>
            {selected.disponible ? 'Disponible ahora' : 'No disponible'}
          </span>
        </div>

        <OrnamentLine opacity={0.1} />

        {/* Info cards */}
        <AccentCard accentColor="rgba(217,203,176,0.2)">
          <SectionLabel style={{ marginBottom: 8 }}>Especialidad</SectionLabel>
          <p style={{ fontSize: 14, color: 'rgba(242,224,201,0.8)' }}>{selected.especialidad}</p>
        </AccentCard>

        {/* Valoración con diamantes */}
        <AccentCard accentColor="rgba(217,203,176,0.2)">
          <SectionLabel style={{ marginBottom: 10 }}>Valoración</SectionLabel>
          <StarRating valor={selected.ranking || 50} />
        </AccentCard>

        {selected.descripcion && (
          <AccentCard accentColor="rgba(217,203,176,0.2)">
            <SectionLabel style={{ marginBottom: 8 }}>Sobre el proveedor</SectionLabel>
            <p style={{ fontSize: 13, color: 'rgba(160,174,192,0.55)', lineHeight: 1.6 }}>{selected.descripcion}</p>
          </AccentCard>
        )}

        <OrnamentLine opacity={0.08} />

        {/* CTA — debe crear aviso primero */}
        {selected.disponible ? (
          <div>
            <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.3)', textAlign: 'center', letterSpacing: '0.08em', marginBottom: 12, lineHeight: 1.6 }}>
              Para contactar a {selected.nombre.split(' ')[0]}, primero completá un aviso. El mensaje se enviará desde ahí.
            </p>
            <button onClick={() => navigate('/aviso', { state: { proveedor_id: selected.id, proveedor_nombre: selected.nombre } })} style={{
              width: '100%', background: 'rgba(242,224,201,0.88)', border: 'none', borderRadius: 4,
              padding: '14px', fontFamily: "'Cormorant Garamond', serif",
              fontSize: 16, fontWeight: 700, color: '#071020',
              letterSpacing: '0.12em', textTransform: 'uppercase'
            }}>
              Crear aviso y contactar
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '14px', border: '1px solid rgba(248,113,113,0.1)', borderRadius: 4 }}>
            <p style={{ fontSize: 12, color: 'rgba(248,113,113,0.5)', letterSpacing: '0.08em' }}>Proveedor no disponible en este momento</p>
          </div>
        )}
      </div>
      <BottomNav rol="vecino" />
    </div>
  )

  return (
    <div className="page">
      <PalaceFrame />
      <PageHeader title="Servicios" subtitle="Proveedores del edificio" />

      {/* Filtros */}
      <div style={{ padding: '0 20px 20px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {ESPECIALIDADES.map(e => (
          <button key={e} onClick={() => setFiltro(e)} style={{
            padding: '5px 12px', borderRadius: 2, whiteSpace: 'nowrap', flexShrink: 0,
            background: filtro === e ? 'rgba(242,224,201,0.08)' : 'transparent',
            border: `1px solid ${filtro === e ? 'rgba(217,203,176,0.2)' : 'rgba(217,203,176,0.07)'}`,
            color: filtro === e ? 'rgba(242,224,201,0.8)' : 'rgba(160,174,192,0.28)',
            fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.2s'
          }}>{e}</button>
        ))}
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(160,174,192,0.2)', fontSize: 11, padding: '30px 0' }}>Cargando...</p>
        ) : filtrados.map(p => (
          <AccentCard key={p.id} onClick={() => setSelected(p)}
            accentColor={p.disponible ? 'rgba(52,211,153,0.3)' : 'rgba(217,203,176,0.1)'}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{
                width: 40, height: 40, flexShrink: 0, border: '1px solid rgba(217,203,176,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600,
                color: 'rgba(217,203,176,0.5)'
              }}>
                {p.nombre.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: 13, color: 'rgba(242,224,201,0.85)', fontWeight: 500 }}>{p.nombre}</p>
                  <span style={{
                    fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: p.disponible ? 'rgba(52,211,153,0.7)' : 'rgba(248,113,113,0.5)'
                  }}>{p.disponible ? 'Disponible' : 'Ocupado'}</span>
                </div>
                <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.3)', marginTop: 2 }}>{p.especialidad}</p>
                <div style={{ marginTop: 6 }}><StarRating valor={p.ranking || 50} /></div>
              </div>
            </div>
          </AccentCard>
        ))}
      </div>
      <BottomNav rol="vecino" />
    </div>
  )
}
