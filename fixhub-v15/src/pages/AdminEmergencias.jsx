import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { PalaceFrame, PageHeader, AccentCard, Card, PrimaryBtn, BottomNav, SectionLabel } from '../components/Palace'

export default function AdminEmergencias({ user }) {
  const [items, setItems] = useState([])
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('emergencias').select('*').eq('edificio_id', user.edificio.id).order('created_at', { ascending: true })
      setItems(data || [])
    }
    fetch()
  }, [user.edificio.id])

  const agregar = async () => {
    if (!nombre.trim() || !telefono.trim()) return
    setLoading(true)
    const { data } = await supabase.from('emergencias').insert({ nombre: nombre.trim(), telefono: telefono.trim(), descripcion: descripcion.trim(), edificio_id: user.edificio.id }).select().single()
    if (data) setItems(prev => [...prev, data])
    setNombre(''); setTelefono(''); setDescripcion(''); setLoading(false)
  }

  const eliminar = async (id) => {
    await supabase.from('emergencias').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div className="page">
      <PalaceFrame />
      <PageHeader title="Emergencias" subtitle="Contactos del edificio" />
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Card style={{ padding: '14px' }}>
          <SectionLabel style={{ marginBottom: 10 }}>Agregar contacto</SectionLabel>
          <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre (ej: Bomberos)"
            style={{ width: '100%', background: 'rgba(242,224,201,0.04)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 4, padding: '9px 14px', color: '#F2E0C9', fontSize: 13, marginBottom: 7 }} />
          <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Teléfono"
            style={{ width: '100%', background: 'rgba(242,224,201,0.04)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 4, padding: '9px 14px', color: '#F2E0C9', fontSize: 13, marginBottom: 7 }} />
          <input value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción (opcional)"
            style={{ width: '100%', background: 'rgba(242,224,201,0.04)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 4, padding: '9px 14px', color: '#F2E0C9', fontSize: 13, marginBottom: 10 }} />
          <PrimaryBtn onClick={agregar} disabled={loading}>{loading ? 'Guardando...' : 'Agregar'}</PrimaryBtn>
        </Card>
        {items.map(e => (
          <AccentCard key={e.id} accentColor="rgba(248,113,113,0.3)">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 13, color: 'rgba(242,224,201,0.85)', fontWeight: 500 }}>{e.nombre}</p>
                {e.descripcion && <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.3)', marginTop: 2 }}>{e.descripcion}</p>}
                <p style={{ fontSize: 12, color: 'rgba(248,113,113,0.65)', marginTop: 4, fontFamily: "'Cormorant Garamond',serif", fontWeight: 600 }}>{e.telefono}</p>
              </div>
              <button onClick={() => eliminar(e.id)} style={{ fontSize: 16, color: 'rgba(248,113,113,0.3)', padding: '4px 8px' }}>×</button>
            </div>
          </AccentCard>
        ))}
      </div>
    </div>
  )
}
