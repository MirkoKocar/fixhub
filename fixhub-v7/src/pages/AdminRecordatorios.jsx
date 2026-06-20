import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { PalaceFrame, PageHeader, AccentCard, Card, PrimaryBtn, OrnamentLine, BottomNav, SectionLabel } from '../components/Palace'

const TIPOS = ['Mantenimiento ascensor','Revisión gas','Limpieza tanque','Inspección eléctrica','Fumigación','Revisión matafuegos','Mantenimiento bomba','Otro']

function diasRestantes(fecha) {
  const hoy = new Date()
  const target = new Date(fecha)
  const diff = Math.ceil((target - hoy) / (1000 * 60 * 60 * 24))
  return diff
}

export default function AdminRecordatorios({ user }) {
  const [recordatorios, setRecordatorios] = useState([])
  const [tipo, setTipo] = useState('')
  const [fecha, setFecha] = useState('')
  const [nota, setNota] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('recordatorios').select('*')
        .eq('edificio_id', user.edificio.id).order('fecha', { ascending: true })
      setRecordatorios(data || [])
    }
    fetch()
  }, [user.edificio.id])

  const agregar = async () => {
    if (!tipo || !fecha) return
    setLoading(true)
    const { data } = await supabase.from('recordatorios').insert({
      tipo, fecha, nota: nota.trim(), edificio_id: user.edificio.id, completado: false
    }).select().single()
    if (data) setRecordatorios(prev => [...prev, data].sort((a,b) => new Date(a.fecha) - new Date(b.fecha)))
    setTipo(''); setFecha(''); setNota(''); setLoading(false)
  }

  const completar = async (id) => {
    await supabase.from('recordatorios').update({ completado: true }).eq('id', id)
    setRecordatorios(prev => prev.map(r => r.id === id ? { ...r, completado: true } : r))
  }

  const eliminar = async (id) => {
    await supabase.from('recordatorios').delete().eq('id', id)
    setRecordatorios(prev => prev.filter(r => r.id !== id))
  }

  const pendientes = recordatorios.filter(r => !r.completado)
  const completados = recordatorios.filter(r => r.completado)

  return (
    <div className="page">
      <PalaceFrame />
      <PageHeader title="Recordatorios" subtitle="Mantenimiento preventivo" />

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Nuevo */}
        <Card style={{ padding: '16px' }}>
          <SectionLabel style={{ marginBottom: 12 }}>Nuevo recordatorio</SectionLabel>
          <select value={tipo} onChange={e => setTipo(e.target.value)}
            style={{ width: '100%', background: '#0B1A2E', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 4, padding: '10px 14px', color: tipo ? '#F2E0C9' : 'rgba(160,174,192,0.35)', fontSize: 13, marginBottom: 8 }}>
            <option value="">Tipo de mantenimiento...</option>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            style={{ width: '100%', background: 'rgba(242,224,201,0.04)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 4, padding: '10px 14px', color: '#F2E0C9', fontSize: 13, marginBottom: 8, colorScheme: 'dark' }} />
          <input value={nota} onChange={e => setNota(e.target.value)} placeholder="Nota adicional (opcional)"
            style={{ width: '100%', background: 'rgba(242,224,201,0.04)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 4, padding: '10px 14px', color: '#F2E0C9', fontSize: 13, marginBottom: 12 }} />
          <PrimaryBtn onClick={agregar} disabled={loading}>{loading ? 'Guardando...' : 'Agregar recordatorio'}</PrimaryBtn>
        </Card>

        <OrnamentLine opacity={0.08} />

        {/* Pendientes */}
        <SectionLabel>Próximos</SectionLabel>
        {pendientes.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ fontSize: 12, color: 'rgba(160,174,192,0.28)' }}>Sin recordatorios pendientes</p>
          </Card>
        ) : (
          pendientes.map(r => {
            const dias = diasRestantes(r.fecha)
            const color = dias <= 7 ? '#f87171' : dias <= 30 ? '#fbbf24' : '#34d399'
            return (
              <AccentCard key={r.id} accentColor={color + '50'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: 'rgba(242,224,201,0.85)', fontWeight: 500 }}>{r.tipo}</p>
                    {r.nota && <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.35)', marginTop: 2 }}>{r.nota}</p>}
                    <p style={{ fontSize: 9, color: color, marginTop: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {dias < 0 ? 'Vencido' : dias === 0 ? 'Hoy' : `En ${dias} día${dias !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginLeft: 12, flexShrink: 0 }}>
                    <button onClick={() => completar(r.id)} style={{ fontSize: 9, color: 'rgba(52,211,153,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 8px', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 2 }}>
                      ✓ Hecho
                    </button>
                    <button onClick={() => eliminar(r.id)} style={{ fontSize: 9, color: 'rgba(248,113,113,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 8px', border: '1px solid rgba(248,113,113,0.1)', borderRadius: 2 }}>
                      Eliminar
                    </button>
                  </div>
                </div>
              </AccentCard>
            )
          })
        )}

        {completados.length > 0 && (
          <>
            <SectionLabel style={{ marginTop: 8 }}>Completados</SectionLabel>
            {completados.slice(0, 3).map(r => (
              <Card key={r.id} style={{ opacity: 0.5 }}>
                <p style={{ fontSize: 12, color: 'rgba(242,224,201,0.6)', textDecoration: 'line-through' }}>{r.tipo}</p>
                <p style={{ fontSize: 9, color: 'rgba(52,211,153,0.5)', marginTop: 3, letterSpacing: '0.08em' }}>Completado</p>
              </Card>
            ))}
          </>
        )}
      </div>
      <BottomNav rol="admin" />
    </div>
  )
}
