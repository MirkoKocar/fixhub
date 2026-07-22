import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { PalaceFrame, PageHeader, AccentCard, Card, PrimaryBtn, OrnamentLine, BottomNav, SectionLabel } from '../components/Palace'

export default function ProveedorAgenda({ user }) {
  const [items, setItems] = useState([])
  const [titulo, setTitulo] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [nota, setNota] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('agenda_proveedor').select('*')
        .eq('proveedor_id', user.id).order('fecha', { ascending: true })
      setItems(data || [])
    }
    fetch()
  }, [user.id])

  const agregar = async () => {
    if (!titulo.trim() || !fecha) return
    setLoading(true)
    const { data } = await supabase.from('agenda_proveedor').insert({
      proveedor_id: user.id, titulo: titulo.trim(), fecha, hora, nota: nota.trim(), completado: false
    }).select().single()
    if (data) setItems(prev => [...prev, data].sort((a,b) => new Date(a.fecha) - new Date(b.fecha)))
    setTitulo(''); setFecha(''); setHora(''); setNota(''); setLoading(false)
  }

  const completar = async (id) => {
    await supabase.from('agenda_proveedor').update({ completado: true }).eq('id', id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, completado: true } : i))
  }

  const pendientes = items.filter(i => !i.completado)
  const completados = items.filter(i => i.completado)

  return (
    <div className="page">
      <PalaceFrame />
      <PageHeader title="Mi Agenda" subtitle="Trabajos programados" />

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card style={{ padding: '16px' }}>
          <SectionLabel style={{ marginBottom: 12 }}>Nuevo trabajo</SectionLabel>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Descripción del trabajo"
            style={{ width: '100%', background: 'rgba(242,224,201,0.04)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 4, padding: '10px 14px', color: '#F2E0C9', fontSize: 13, marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
              style={{ flex: 1, background: 'rgba(242,224,201,0.04)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 4, padding: '10px 12px', color: '#F2E0C9', fontSize: 13, colorScheme: 'dark' }} />
            <input type="time" value={hora} onChange={e => setHora(e.target.value)}
              style={{ flex: 1, background: 'rgba(242,224,201,0.04)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 4, padding: '10px 12px', color: '#F2E0C9', fontSize: 13, colorScheme: 'dark' }} />
          </div>
          <input value={nota} onChange={e => setNota(e.target.value)} placeholder="Nota (opcional)"
            style={{ width: '100%', background: 'rgba(242,224,201,0.04)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 4, padding: '10px 14px', color: '#F2E0C9', fontSize: 13, marginBottom: 12 }} />
          <PrimaryBtn onClick={agregar} disabled={loading}>{loading ? 'Guardando...' : 'Agregar'}</PrimaryBtn>
        </Card>

        <OrnamentLine opacity={0.08} />
        <SectionLabel>Próximos trabajos</SectionLabel>

        {pendientes.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ fontSize: 12, color: 'rgba(160,174,192,0.28)' }}>Sin trabajos programados</p>
          </Card>
        ) : (
          pendientes.map(i => (
            <AccentCard key={i.id} accentColor="rgba(217,203,176,0.2)">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: 13, color: 'rgba(242,224,201,0.85)', fontWeight: 500 }}>{i.titulo}</p>
                  <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.35)', marginTop: 2 }}>
                    {new Date(i.fecha).toLocaleDateString('es-AR',{day:'2-digit',month:'short'})} {i.hora && `· ${i.hora}`}
                  </p>
                  {i.nota && <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.28)', marginTop: 3 }}>{i.nota}</p>}
                </div>
                <button onClick={() => completar(i.id)} style={{ fontSize: 9, color: 'rgba(52,211,153,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 8px', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 2, flexShrink: 0, marginLeft: 10 }}>
                  ✓ Hecho
                </button>
              </div>
            </AccentCard>
          ))
        )}

        {completados.length > 0 && (
          <>
            <SectionLabel style={{ marginTop: 8 }}>Completados</SectionLabel>
            {completados.slice(0,3).map(i => (
              <Card key={i.id} style={{ opacity: 0.45 }}>
                <p style={{ fontSize: 12, color: 'rgba(242,224,201,0.6)', textDecoration: 'line-through' }}>{i.titulo}</p>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
