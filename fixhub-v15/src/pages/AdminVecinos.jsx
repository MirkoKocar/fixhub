import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { PalaceFrame, PageHeader, AccentCard, Card, OrnamentLine, BottomNav, SectionLabel } from '../components/Palace'

export default function AdminVecinos({ user }) {
  const [vecinos, setVecinos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('vecinos').select('*')
        .eq('edificio_id', user.edificio.id).order('departamento', { ascending: true })
      setVecinos(data || [])
      setLoading(false)
    }
    fetch()
  }, [user.edificio.id])

  const filtrados = vecinos.filter(v =>
    v.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    v.departamento?.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="page">
      <PalaceFrame />
      <PageHeader title="Vecinos" subtitle={`${vecinos.length} registrados`} />

      <div style={{ padding: '0 20px 20px' }}>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre o depto..."
          style={{ width: '100%', background: 'rgba(242,224,201,0.04)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 4, padding: '11px 15px', color: '#F2E0C9', fontSize: 13 }} />
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(160,174,192,0.2)', fontSize: 11, padding: '30px 0' }}>Cargando...</p>
        ) : filtrados.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '24px' }}>
            <p style={{ fontSize: 12, color: 'rgba(160,174,192,0.28)' }}>Sin vecinos registrados</p>
          </Card>
        ) : (
          filtrados.map(v => (
            <AccentCard key={v.id} accentColor="rgba(217,203,176,0.15)">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 13, color: 'rgba(242,224,201,0.85)', fontWeight: 500 }}>{v.nombre}</p>
                  {v.email && <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.3)', marginTop: 2 }}>{v.email}</p>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 11, color: 'rgba(217,203,176,0.5)', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>Depto {v.departamento}</span>
                </div>
              </div>
            </AccentCard>
          ))
        )}
      </div>
    </div>
  )
}
