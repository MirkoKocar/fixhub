import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { PalaceFrame, PageHeader, AccentCard, Card, PrimaryBtn, OrnamentLine, BottomNav, SectionLabel } from '../components/Palace'

export default function AdminVotaciones({ user }) {
  const [votaciones, setVotaciones] = useState([])
  const [titulo, setTitulo] = useState('')
  const [opciones, setOpciones] = useState(['', ''])
  const [fechaLimite, setFechaLimite] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('votaciones').select('*, votos(*)')
        .eq('edificio_id', user.edificio.id).order('created_at', { ascending: false })
      setVotaciones(data || [])
    }
    fetch()
  }, [user.edificio.id])

  const crear = async () => {
    if (!titulo.trim() || opciones.filter(o => o.trim()).length < 2) return
    setLoading(true)
    const { data } = await supabase.from('votaciones').insert({
      titulo: titulo.trim(), opciones: opciones.filter(o => o.trim()),
      edificio_id: user.edificio.id, activa: true, fecha_limite: fechaLimite || null
    }).select('*, votos(*)').single()
    if (data) setVotaciones(prev => [data, ...prev])
    setTitulo(''); setOpciones(['', '']); setFechaLimite(''); setLoading(false)
  }

  const cerrar = async (id) => {
    await supabase.from('votaciones').update({ activa: false }).eq('id', id)
    setVotaciones(prev => prev.map(v => v.id === id ? { ...v, activa: false } : v))
  }

  return (
    <div className="page">
      <PalaceFrame />
      <PageHeader title="Votaciones" subtitle="Decisiones del consorcio" />

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card style={{ padding: '16px' }}>
          <SectionLabel style={{ marginBottom: 12 }}>Nueva votación</SectionLabel>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Pregunta o tema a votar"
            style={{ width: '100%', background: 'rgba(242,224,201,0.04)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 4, padding: '10px 14px', color: '#F2E0C9', fontSize: 13, marginBottom: 10 }} />
          <SectionLabel style={{ marginBottom: 8 }}>Opciones</SectionLabel>
          {opciones.map((op, i) => (
            <input key={i} value={op} onChange={e => { const n = [...opciones]; n[i] = e.target.value; setOpciones(n) }} placeholder={`Opción ${i + 1}`}
              style={{ width: '100%', background: 'rgba(242,224,201,0.04)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 4, padding: '9px 14px', color: '#F2E0C9', fontSize: 13, marginBottom: 6 }} />
          ))}
          <button onClick={() => setOpciones([...opciones, ''])} style={{ fontSize: 10, color: 'rgba(217,203,176,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>+ Agregar opción</button>
          <input type="date" value={fechaLimite} onChange={e => setFechaLimite(e.target.value)} min={new Date().toISOString().split('T')[0]}
            style={{ width: '100%', background: 'rgba(242,224,201,0.04)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 4, padding: '9px 14px', color: '#F2E0C9', fontSize: 13, marginBottom: 12, colorScheme: 'dark' }} />
          <PrimaryBtn onClick={crear} disabled={loading}>{loading ? 'Creando...' : 'Crear votación'}</PrimaryBtn>
        </Card>

        <OrnamentLine opacity={0.08} />
        <SectionLabel>Votaciones activas</SectionLabel>

        {votaciones.map(v => {
          const totalVotos = v.votos?.length || 0
          const conteo = (v.opciones || []).map(op => ({
            op, count: v.votos?.filter(vt => vt.opcion === op).length || 0
          }))
          const max = Math.max(...conteo.map(c => c.count), 1)
          return (
            <Card key={v.id} style={{ padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <p style={{ fontSize: 13, color: '#F2E0C9', fontWeight: 500, flex: 1, marginRight: 10, lineHeight: 1.3 }}>{v.titulo}</p>
                <span style={{ fontSize: 8.5, padding: '3px 8px', borderRadius: 2, background: v.activa ? 'rgba(52,211,153,0.1)' : 'rgba(217,203,176,0.05)', color: v.activa ? '#34d399' : 'rgba(160,174,192,0.3)', border: `1px solid ${v.activa ? 'rgba(52,211,153,0.2)' : 'rgba(217,203,176,0.08)'}`, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {v.activa ? 'Activa' : 'Cerrada'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {conteo.map(({ op, count }) => (
                  <div key={op}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'rgba(242,224,201,0.7)' }}>{op}</span>
                      <span style={{ fontSize: 11, color: 'rgba(160,174,192,0.4)' }}>{count} voto{count !== 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ height: 3, background: 'rgba(217,203,176,0.06)', borderRadius: 2 }}>
                      <div style={{ width: `${(count / max) * 100}%`, height: '100%', background: 'rgba(217,203,176,0.35)', borderRadius: 2, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 9, color: 'rgba(160,174,192,0.25)', marginTop: 10, letterSpacing: '0.06em' }}>{totalVotos} voto{totalVotos !== 1 ? 's' : ''} en total</p>
              {v.activa && (
                <button onClick={() => cerrar(v.id)} style={{ marginTop: 10, fontSize: 9, color: 'rgba(248,113,113,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', border: '1px solid rgba(248,113,113,0.1)', borderRadius: 2 }}>
                  Cerrar votación
                </button>
              )}
            </Card>
          )
        })}
      </div>
      <BottomNav rol="admin" />
    </div>
  )
}
