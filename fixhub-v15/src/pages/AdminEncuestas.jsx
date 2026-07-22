import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { PalaceFrame, PageHeader, AccentCard, Card, PrimaryBtn, OrnamentLine, BottomNav, SectionLabel } from '../components/Palace'

export default function AdminEncuestas({ user }) {
  const [encuestas, setEncuestas] = useState([])
  const [titulo, setTitulo] = useState('')
  const [preguntas, setPreguntas] = useState([''])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('encuestas').select('*, respuestas_encuesta(*)')
        .eq('edificio_id', user.edificio.id).order('created_at', { ascending: false })
      setEncuestas(data || [])
    }
    fetch()
  }, [user.edificio.id])

  const crear = async () => {
    if (!titulo.trim() || preguntas.filter(p => p.trim()).length === 0) return
    setLoading(true)
    const { data } = await supabase.from('encuestas').insert({
      titulo: titulo.trim(), preguntas: preguntas.filter(p => p.trim()),
      edificio_id: user.edificio.id, activa: true
    }).select('*, respuestas_encuesta(*)').single()
    if (data) setEncuestas(prev => [data, ...prev])
    setTitulo(''); setPreguntas(['']); setLoading(false)
  }

  const toggleActiva = async (id, activa) => {
    await supabase.from('encuestas').update({ activa: !activa }).eq('id', id)
    setEncuestas(prev => prev.map(e => e.id === id ? { ...e, activa: !activa } : e))
  }

  return (
    <div className="page">
      <PalaceFrame />
      <PageHeader title="Encuestas" subtitle="Satisfacción del edificio" />
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card style={{ padding: '16px' }}>
          <SectionLabel style={{ marginBottom: 12 }}>Nueva encuesta</SectionLabel>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título de la encuesta"
            style={{ width: '100%', background: 'rgba(242,224,201,0.04)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 4, padding: '10px 14px', color: '#F2E0C9', fontSize: 13, marginBottom: 10 }} />
          <SectionLabel style={{ marginBottom: 8 }}>Preguntas</SectionLabel>
          {preguntas.map((p, i) => (
            <input key={i} value={p} onChange={e => { const n = [...preguntas]; n[i] = e.target.value; setPreguntas(n) }} placeholder={`Pregunta ${i + 1}`}
              style={{ width: '100%', background: 'rgba(242,224,201,0.04)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 4, padding: '9px 14px', color: '#F2E0C9', fontSize: 13, marginBottom: 6 }} />
          ))}
          <button onClick={() => setPreguntas([...preguntas, ''])} style={{ fontSize: 10, color: 'rgba(217,203,176,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>+ Agregar pregunta</button>
          <PrimaryBtn onClick={crear} disabled={loading}>{loading ? 'Creando...' : 'Crear encuesta'}</PrimaryBtn>
        </Card>
        <OrnamentLine opacity={0.08} />
        {encuestas.map(e => (
          <Card key={e.id} style={{ padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <p style={{ fontSize: 13, color: '#F2E0C9', fontWeight: 500, flex: 1, marginRight: 10 }}>{e.titulo}</p>
              <span style={{ fontSize: 8.5, padding: '3px 8px', borderRadius: 2, background: e.activa ? 'rgba(52,211,153,0.1)' : 'rgba(217,203,176,0.04)', color: e.activa ? '#34d399' : 'rgba(160,174,192,0.3)', border: `1px solid ${e.activa ? 'rgba(52,211,153,0.2)' : 'rgba(217,203,176,0.07)'}`, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {e.activa ? 'Activa' : 'Cerrada'}
              </span>
            </div>
            <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.3)', marginBottom: 10 }}>{e.respuestas_encuesta?.length || 0} respuesta{e.respuestas_encuesta?.length !== 1 ? 's' : ''}</p>
            <button onClick={() => toggleActiva(e.id, e.activa)} style={{ fontSize: 9, color: e.activa ? 'rgba(248,113,113,0.45)' : 'rgba(52,211,153,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', border: `1px solid ${e.activa ? 'rgba(248,113,113,0.1)' : 'rgba(52,211,153,0.15)'}`, borderRadius: 2 }}>
              {e.activa ? 'Cerrar encuesta' : 'Reactivar'}
            </button>
          </Card>
        ))}
      </div>
    </div>
  )
}
