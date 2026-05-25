import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { OrnamentLine, SectionTitle, Card, PrimaryBtn, StatusBadge } from '../components/Palace'

export default function HomeAdmin({ user, onLogout }) {
  const [avisos, setAvisos] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [tab, setTab] = useState('avisos')
  const [loading, setLoading] = useState(true)
  const [nuevoP, setNuevoP] = useState({ nombre: '', rubro: 'Plomería', telefono: '', disponible: true })
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    const [{ data: av }, { data: pv }] = await Promise.all([
      supabase.from('avisos').select('*, vecinos(nombre, departamento)').eq('edificio_id', user.edificio.id).order('created_at', { ascending: false }),
      supabase.from('proveedores').select('*').eq('edificio_id', user.edificio.id).order('nombre')
    ])
    setAvisos(av || [])
    setProveedores(pv || [])
    setLoading(false)
  }

  const cambiarEstado = async (id, estado) => {
    await supabase.from('avisos').update({ estado }).eq('id', id)
    setAvisos(prev => prev.map(a => a.id === id ? { ...a, estado } : a))
  }

  const agregarProveedor = async () => {
    if (!nuevoP.nombre.trim() || !nuevoP.telefono.trim()) return
    setGuardando(true)
    await supabase.from('proveedores').insert({ ...nuevoP, edificio_id: user.edificio.id })
    setNuevoP({ nombre: '', rubro: 'Plomería', telefono: '', disponible: true })
    await fetchData()
    setGuardando(false)
  }

  const inputStyle = { width: '100%', background: 'rgba(242,224,201,0.06)', border: '1px solid rgba(217,203,176,0.12)', borderRadius: 10, padding: '11px 14px', color: '#F2E0C9', fontSize: 14, fontFamily: 'inherit' }
  const nuevos = avisos.filter(a => a.estado === 'nuevo').length

  return (
    <div style={{ paddingBottom: 60 }}>
      <div style={{ padding: '52px 24px 24px', textAlign: 'center' }}>
        <p className="font-cormorant animate-ornament" style={{ color: '#D9CBB0', fontSize: 11, letterSpacing: '0.5em', marginBottom: 14 }}>✦ ✦ ✦</p>
        <h1 className="font-cormorant" style={{ fontSize: 30, fontWeight: 700, color: '#F2E0C9', marginBottom: 4 }}>Panel de Gestión</h1>
        <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.5)', letterSpacing: '0.06em' }}>{user.edificio.nombre}</p>
        {nuevos > 0 && <div style={{ marginTop: 12, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '8px 14px', fontSize: 12, color: '#f87171' }}>{nuevos} aviso{nuevos > 1 ? 's' : ''} nuevo{nuevos > 1 ? 's' : ''} sin atender</div>}
        <div style={{ marginTop: 16 }}><OrnamentLine /></div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', margin: '0 20px 20px', background: 'rgba(242,224,201,0.03)', border: '1px solid rgba(217,203,176,0.08)', borderRadius: 10, padding: 4 }}>
        {[{ k: 'avisos', l: `Avisos${nuevos > 0 ? ` (${nuevos})` : ''}` }, { k: 'proveedores', l: 'Proveedores' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ flex: 1, padding: '9px', borderRadius: 7, fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 600, background: tab === t.k ? 'rgba(242,224,201,0.08)' : 'none', color: tab === t.k ? '#F2E0C9' : 'rgba(160,174,192,0.4)', border: tab === t.k ? '1px solid rgba(217,203,176,0.15)' : '1px solid transparent', transition: 'all 0.2s' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'avisos' && (
        <div style={{ padding: '0 20px' }}>
          {avisos.map(a => (
            <Card key={a.id} style={{ marginBottom: 10, borderColor: a.estado === 'nuevo' ? 'rgba(248,113,113,0.2)' : 'rgba(217,203,176,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <p className="font-cormorant" style={{ fontSize: 16, color: '#F2E0C9', lineHeight: 1.3 }}>{a.descripcion}</p>
                  <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.45)', marginTop: 4 }}>
                    {a.vecinos ? `Depto ${a.vecinos.departamento} · ${a.vecinos.nombre}` : ''} · {new Date(a.created_at).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <StatusBadge estado={a.estado} />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['nuevo', 'en_curso', 'resuelto'].map(e => {
                  const c = { nuevo: '#f87171', en_curso: '#fbbf24', resuelto: '#34d399' }[e]
                  const l = { nuevo: 'Nuevo', en_curso: 'En curso', resuelto: 'Resuelto' }[e]
                  return (
                    <button key={e} onClick={() => cambiarEstado(a.id, e)} style={{ flex: 1, padding: '7px 4px', borderRadius: 7, fontSize: 10, fontWeight: 600, background: a.estado === e ? `${c}12` : 'rgba(242,224,201,0.03)', border: `1px solid ${a.estado === e ? `${c}30` : 'rgba(217,203,176,0.08)'}`, color: a.estado === e ? c : 'rgba(160,174,192,0.35)', transition: 'all 0.15s', letterSpacing: '0.04em' }}>{l}</button>
                  )
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'proveedores' && (
        <div style={{ padding: '0 20px' }}>
          <Card style={{ marginBottom: 16 }}>
            <p className="font-cormorant" style={{ fontSize: 16, color: 'rgba(160,174,192,0.6)', marginBottom: 12 }}>Agregar proveedor</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input value={nuevoP.nombre} onChange={e => setNuevoP({ ...nuevoP, nombre: e.target.value })} placeholder="Nombre" style={inputStyle} />
              <input value={nuevoP.telefono} onChange={e => setNuevoP({ ...nuevoP, telefono: e.target.value })} placeholder="Teléfono" style={inputStyle} />
              <select value={nuevoP.rubro} onChange={e => setNuevoP({ ...nuevoP, rubro: e.target.value })} style={{ ...inputStyle, background: 'rgba(242,224,201,0.06)' }}>
                {['Plomería', 'Electricidad', 'Cerrajería', 'Gas', 'Estructura', 'Jardinería', 'Limpieza', 'Otro'].map(r => <option key={r} style={{ background: '#071424' }}>{r}</option>)}
              </select>
            </div>
            <div style={{ marginTop: 12 }}>
              <PrimaryBtn onClick={agregarProveedor} disabled={guardando}>{guardando ? 'Guardando...' : 'Agregar proveedor'}</PrimaryBtn>
            </div>
          </Card>

          {proveedores.map(p => (
            <Card key={p.id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <p className="font-cormorant" style={{ fontSize: 16, color: '#F2E0C9' }}>{p.nombre}</p>
                <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.45)', marginTop: 2 }}>{p.rubro} · {p.telefono}</p>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: p.disponible ? 'rgba(52,211,153,0.1)' : 'rgba(160,174,192,0.08)', color: p.disponible ? '#34d399' : 'rgba(160,174,192,0.4)', border: `1px solid ${p.disponible ? 'rgba(52,211,153,0.2)' : 'rgba(160,174,192,0.1)'}` }}>
                {p.disponible ? 'Disponible' : 'Inactivo'}
              </span>
            </Card>
          ))}
        </div>
      )}

      <div style={{ padding: '24px 20px 0', textAlign: 'center' }}>
        <button onClick={onLogout} style={{ background: 'none', color: 'rgba(160,174,192,0.25)', fontSize: 11, letterSpacing: '0.1em' }}>Cerrar sesión</button>
      </div>
    </div>
  )
}
