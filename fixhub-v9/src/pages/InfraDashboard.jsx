import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { PalaceFrame, Card, AccentCard, OrnamentLine, SectionLabel, AnimCounter, PrimaryBtn } from '../components/Palace'

export default function InfraDashboard({ onExit }) {
  const [data, setData] = useState({ edificios: [], vecinos: [], admins: [], proveedores: [], avisos: [] })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [newEdificio, setNewEdificio] = useState({ nombre: '', direccion: '', codigo_acceso: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const fetch = async () => {
      const [edRes, vRes, pRes, avRes] = await Promise.all([
        supabase.from('edificios').select('*').order('created_at', { ascending: false }),
        supabase.from('vecinos').select('*, edificios(nombre)').order('created_at', { ascending: false }),
        supabase.from('proveedores').select('*, edificios(nombre)').order('ranking', { ascending: false }),
        supabase.from('avisos').select('*, edificios(nombre), vecinos(nombre,departamento)').order('created_at', { ascending: false }),
      ])
      setData({
        edificios: edRes.data || [],
        vecinos: vRes.data || [],
        proveedores: pRes.data || [],
        avisos: avRes.data || [],
      })
      setLoading(false)
    }
    fetch()
  }, [])

  const addEdificio = async () => {
    if (!newEdificio.nombre || !newEdificio.codigo_acceso) return
    setSaving(true)
    const { data: ed, error } = await supabase.from('edificios').insert(newEdificio).select().single()
    if (!error && ed) {
      setData(prev => ({ ...prev, edificios: [ed, ...prev.edificios] }))
      setNewEdificio({ nombre: '', direccion: '', codigo_acceso: '' })
      setMsg('Edificio agregado correctamente.')
      setTimeout(() => setMsg(''), 3000)
    }
    setSaving(false)
  }

  // Stats
  const avisosPorEdificio = data.edificios.map(e => ({
    nombre: e.nombre,
    total: data.avisos.filter(a => a.edificio_id === e.id).length,
    resueltos: data.avisos.filter(a => a.edificio_id === e.id && a.estado === 'resuelto').length,
  })).sort((a, b) => b.total - a.total)

  const vecinosPorEdificio = data.edificios.map(e => ({
    nombre: e.nombre,
    total: data.vecinos.filter(v => v.edificio_id === e.id).length,
  })).sort((a, b) => b.total - a.total)

  const tabs = [
    { id: 'overview', label: 'Resumen' },
    { id: 'edificios', label: 'Edificios' },
    { id: 'vecinos', label: 'Vecinos' },
    { id: 'stats', label: 'Estadísticas' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#060D1C', fontFamily: "'DM Sans',sans-serif", maxWidth: 430, margin: '0 auto', position: 'relative' }}>
      <PalaceFrame />

      {/* Header INFRA */}
      <div style={{ padding: '48px 20px 16px', textAlign: 'center', borderBottom: '1px solid rgba(224,176,94,0.1)' }}>
        <p style={{ fontSize: 8, letterSpacing: '0.6em', color: 'rgba(224,176,94,0.35)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>MODO INFRAESTRUCTURA</p>
        <h1 className="font-serif" style={{ fontSize: 22, color: '#F2E0C9' }}>Panel Global</h1>
        <p style={{ fontSize: 9.5, color: 'rgba(180,190,205,0.28)', marginTop: 3, fontWeight: 500 }}>Acceso total al sistema FixHub</p>
        <button onClick={onExit} style={{ marginTop: 10, fontSize: 9, color: 'rgba(248,113,113,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, padding: '5px 14px', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 999 }}>
          Salir del modo INFRA
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(217,203,176,0.08)', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '12px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
            color: tab === t.id ? '#E0B05E' : 'rgba(180,190,205,0.3)',
            borderBottom: `2px solid ${tab === t.id ? '#E0B05E' : 'transparent'}`,
            transition: 'all 0.2s'
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: '20px', paddingBottom: 60 }}>
        {loading && <p style={{ textAlign: 'center', color: 'rgba(180,190,205,0.2)', fontSize: 12, padding: '40px 0' }}>Cargando datos...</p>}

        {/* OVERVIEW */}
        {!loading && tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Edificios', value: data.edificios.length, color: '#E0B05E' },
                { label: 'Vecinos', value: data.vecinos.length, color: '#60a5fa' },
                { label: 'Proveedores', value: data.proveedores.length, color: '#34d399' },
                { label: 'Avisos totales', value: data.avisos.length, color: '#fbbf24' },
              ].map(s => (
                <div key={s.label} style={{ background: `${s.color}06`, border: `1px solid ${s.color}18`, borderTop: `3px solid ${s.color}40`, borderRadius: 16, padding: '14px 12px', textAlign: 'center' }}>
                  <AnimCounter value={s.value} color={s.color} size={30} />
                  <p style={{ fontSize: 8.5, color: 'rgba(180,190,205,0.3)', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{s.label}</p>
                </div>
              ))}
            </div>

            <OrnamentLine opacity={0.1}/>
            <SectionLabel style={{ marginBottom: 8 }}>Actividad reciente</SectionLabel>
            {data.avisos.slice(0, 5).map(a => (
              <AccentCard key={a.id} accentColor={a.estado==='nuevo'?'#f87171':a.estado==='en_curso'?'#fbbf24':'#34d399'} style={{ marginBottom: 7 }}>
                <p style={{ fontSize: 12, color: 'rgba(242,224,201,0.85)', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.titulo}</p>
                <p style={{ fontSize: 9.5, color: 'rgba(180,190,205,0.3)', marginTop: 2, fontWeight: 500 }}>
                  {a.edificios?.nombre} · {a.vecinos?.nombre} · Depto {a.vecinos?.departamento}
                </p>
              </AccentCard>
            ))}
          </div>
        )}

        {/* EDIFICIOS */}
        {!loading && tab === 'edificios' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Card style={{ padding: '16px' }}>
              <SectionLabel style={{ marginBottom: 12 }}>Agregar edificio</SectionLabel>
              {['nombre','direccion','codigo_acceso'].map(field => (
                <input key={field} value={newEdificio[field]} onChange={e => setNewEdificio(prev => ({ ...prev, [field]: e.target.value }))}
                  placeholder={field === 'nombre' ? 'Nombre del edificio' : field === 'direccion' ? 'Dirección' : 'Código de acceso (ej: EDIF01)'}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 12, padding: '10px 14px', color: '#F2E0C9', fontSize: 13, fontFamily: "'DM Sans',sans-serif", marginBottom: 8, letterSpacing: field === 'codigo_acceso' ? '0.08em' : 0, textTransform: field === 'codigo_acceso' ? 'uppercase' : 'none' }}/>
              ))}
              {msg && <p style={{ color: '#34d399', fontSize: 11, marginBottom: 8, fontWeight: 600 }}>{msg}</p>}
              <PrimaryBtn onClick={addEdificio} disabled={saving}>{saving ? 'Guardando...' : 'Agregar edificio'}</PrimaryBtn>
            </Card>

            <OrnamentLine opacity={0.08}/>
            <SectionLabel style={{ marginBottom: 8 }}>{data.edificios.length} edificios registrados</SectionLabel>

            {data.edificios.map(e => {
              const vecinosCount = data.vecinos.filter(v => v.edificio_id === e.id).length
              const avisosCount = data.avisos.filter(a => a.edificio_id === e.id).length
              return (
                <AccentCard key={e.id} accentColor="rgba(224,176,94,0.3)">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, color: '#F2E0C9', fontWeight: 700 }}>{e.nombre}</p>
                      <p style={{ fontSize: 10, color: 'rgba(180,190,205,0.35)', marginTop: 2, fontWeight: 500 }}>{e.direccion}</p>
                      <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                        <span style={{ fontSize: 9.5, color: 'rgba(224,176,94,0.55)', fontWeight: 700 }}>{vecinosCount} vecinos</span>
                        <span style={{ fontSize: 9.5, color: 'rgba(180,190,205,0.35)', fontWeight: 700 }}>{avisosCount} avisos</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                      <p style={{ fontSize: 10, color: 'rgba(224,176,94,0.6)', fontWeight: 700, fontFamily: "'DM Serif Display',serif" }}>{e.codigo_acceso}</p>
                    </div>
                  </div>
                </AccentCard>
              )
            })}
          </div>
        )}

        {/* VECINOS */}
        {!loading && tab === 'vecinos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SectionLabel style={{ marginBottom: 8 }}>{data.vecinos.length} vecinos totales</SectionLabel>
            {data.vecinos.map(v => (
              <AccentCard key={v.id} accentColor="rgba(96,165,250,0.3)">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 13, color: 'rgba(242,224,201,0.88)', fontWeight: 700 }}>{v.nombre}</p>
                    <p style={{ fontSize: 9.5, color: 'rgba(180,190,205,0.32)', marginTop: 2, fontWeight: 500 }}>{v.edificios?.nombre}</p>
                  </div>
                  <span className="font-serif" style={{ fontSize: 13, color: 'rgba(224,176,94,0.55)' }}>Depto {v.departamento}</span>
                </div>
              </AccentCard>
            ))}
          </div>
        )}

        {/* STATS */}
        {!loading && tab === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <SectionLabel style={{ marginBottom: 8 }}>Avisos por edificio</SectionLabel>
            {avisosPorEdificio.map(e => (
              <Card key={e.nombre} style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <p style={{ fontSize: 12, color: 'rgba(242,224,201,0.82)', fontWeight: 700 }}>{e.nombre}</p>
                  <p style={{ fontSize: 11, color: 'rgba(180,190,205,0.4)', fontWeight: 600 }}>{e.total} avisos</p>
                </div>
                <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 999 }}>
                  <div style={{ width: `${Math.min((e.total / (avisosPorEdificio[0]?.total || 1)) * 100, 100)}%`, height: '100%', background: 'linear-gradient(90deg,#E0B05E,#C9923A)', borderRadius: 999, transition: 'width 0.6s' }}/>
                </div>
                <p style={{ fontSize: 9, color: 'rgba(52,211,153,0.55)', marginTop: 4, fontWeight: 700 }}>{e.resueltos} resueltos</p>
              </Card>
            ))}

            <OrnamentLine opacity={0.08}/>
            <SectionLabel style={{ marginBottom: 8 }}>Vecinos por edificio</SectionLabel>
            {vecinosPorEdificio.map(e => (
              <Card key={e.nombre} style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <p style={{ fontSize: 12, color: 'rgba(242,224,201,0.82)', fontWeight: 700 }}>{e.nombre}</p>
                  <p style={{ fontSize: 11, color: 'rgba(180,190,205,0.4)', fontWeight: 600 }}>{e.total} vecinos</p>
                </div>
                <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 999 }}>
                  <div style={{ width: `${Math.min((e.total / (vecinosPorEdificio[0]?.total || 1)) * 100, 100)}%`, height: '100%', background: 'linear-gradient(90deg,#60a5fa,#3b82f6)', borderRadius: 999, transition: 'width 0.6s' }}/>
                </div>
              </Card>
            ))}

            <OrnamentLine opacity={0.08}/>
            <SectionLabel style={{ marginBottom: 8 }}>Resumen global</SectionLabel>
            <Card>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['Total edificios', data.edificios.length],
                  ['Total vecinos registrados', data.vecinos.length],
                  ['Total proveedores', data.proveedores.length],
                  ['Total avisos', data.avisos.length],
                  ['Avisos resueltos', data.avisos.filter(a => a.estado === 'resuelto').length],
                  ['Avisos pendientes', data.avisos.filter(a => a.estado !== 'resuelto').length],
                  ['Tasa de resolución', `${data.avisos.length > 0 ? Math.round((data.avisos.filter(a => a.estado === 'resuelto').length / data.avisos.length) * 100) : 0}%`],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: 12, color: 'rgba(180,190,205,0.38)', fontWeight: 500 }}>{label}</p>
                    <p style={{ fontSize: 13, color: '#E0B05E', fontWeight: 700 }}>{val}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
