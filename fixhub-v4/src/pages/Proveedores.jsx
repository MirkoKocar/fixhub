import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, PageHeader, Card, BottomNav } from '../components/Palace'

const ESPECIALIDADES = ['Todos', 'Plomería', 'Electricidad', 'Gas', 'Ascensor', 'Limpieza', 'Seguridad', 'Estructura', 'Internet']

function StarRating({ valor }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill={i <= valor ? '#fbbf24' : 'rgba(251,191,36,0.15)'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

export default function Proveedores({ user }) {
  const navigate = useNavigate()
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('Todos')

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('proveedores').select('*')
        .eq('edificio_id', user.edificio.id)
        .order('ranking', { ascending: false })
      setProveedores(data || [])
      setLoading(false)
    }
    fetch()
  }, [user.edificio.id])

  const filtrados = filtro === 'Todos' ? proveedores : proveedores.filter(p => p.especialidad === filtro)

  return (
    <div className="page">
      <PalaceFrame />
      <PageHeader title="Proveedores" subtitle="Servicios del edificio" />

      {/* Filtros */}
      <div style={{ padding: '0 20px 20px', display: 'flex', gap: 7, overflowX: 'auto' }}>
        {ESPECIALIDADES.map(e => (
          <button key={e} onClick={() => setFiltro(e)} style={{
            padding: '6px 14px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0,
            background: filtro === e ? 'rgba(242,224,201,0.1)' : 'transparent',
            border: `1px solid ${filtro === e ? 'rgba(217,203,176,0.25)' : 'rgba(217,203,176,0.08)'}`,
            color: filtro === e ? '#F2E0C9' : 'rgba(160,174,192,0.35)',
            fontSize: 10, letterSpacing: '0.05em', transition: 'all 0.2s'
          }}>{e}</button>
        ))}
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(160,174,192,0.25)', fontSize: 12, padding: '30px 0' }}>Cargando...</p>
        ) : filtrados.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '32px 16px' }}>
            <p style={{ fontSize: 13, color: 'rgba(160,174,192,0.35)' }}>Sin proveedores en esta categoría</p>
          </Card>
        ) : (
          filtrados.map((p, i) => (
            <Card key={p.id} onClick={() => navigate(`/chat/proveedor/${p.id}`)} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              {/* Ranking visual — solo muestra estrellas (no número) */}
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: p.disponible ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.06)',
                border: `1px solid ${p.disponible ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.15)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700,
                color: p.disponible ? 'rgba(52,211,153,0.8)' : 'rgba(248,113,113,0.6)'
              }}>
                {p.nombre.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ fontSize: 14, color: '#F2E0C9', fontWeight: 500 }}>{p.nombre}</p>
                  <span style={{
                    fontSize: 9, padding: '2px 8px', borderRadius: 10,
                    background: p.disponible ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.08)',
                    color: p.disponible ? '#34d399' : '#f87171',
                    border: `1px solid ${p.disponible ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.15)'}`,
                    letterSpacing: '0.06em', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 8
                  }}>
                    {p.disponible ? 'Disponible' : 'Ocupado'}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.35)', marginTop: 2 }}>{p.especialidad}</p>
                {p.ranking > 0 && (
                  <div style={{ marginTop: 5 }}>
                    <StarRating valor={Math.round((p.ranking / 20) * 5)} />
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      <BottomNav rol="vecino" />
    </div>
  )
}
