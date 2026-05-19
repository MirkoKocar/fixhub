import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import BottomNav from '../components/BottomNav'

const estadoColor = { nuevo: 'var(--danger)', en_curso: 'var(--warning)', resuelto: 'var(--success)' }
const estadoLabel = { nuevo: 'Nuevo', en_curso: 'En curso', resuelto: 'Resuelto' }

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
)
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
)

export default function Admin({ vecino }) {
  const [avisos, setAvisos] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [tab, setTab] = useState('avisos')
  const [loading, setLoading] = useState(true)
  const [nuevoP, setNuevoP] = useState({ nombre: '', rubro: 'Plomería', telefono: '', disponible: true })
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito] = useState('')

  useEffect(() => { fetchData() }, [vecino.edificio.id])

  const fetchData = async () => {
    setLoading(true)
    const [{ data: av }, { data: pv }] = await Promise.all([
      supabase.from('avisos').select('*, vecinos(nombre, departamento)').eq('edificio_id', vecino.edificio.id).order('created_at', { ascending: false }),
      supabase.from('proveedores').select('*').eq('edificio_id', vecino.edificio.id).order('nombre')
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
    await supabase.from('proveedores').insert({ ...nuevoP, edificio_id: vecino.edificio.id })
    setNuevoP({ nombre: '', rubro: 'Plomería', telefono: '', disponible: true })
    setExito('Proveedor agregado correctamente')
    setTimeout(() => setExito(''), 2500)
    await fetchData()
    setGuardando(false)
  }

  const toggleDisponible = async (id, actual) => {
    await supabase.from('proveedores').update({ disponible: !actual }).eq('id', id)
    setProveedores(prev => prev.map(p => p.id === id ? { ...p, disponible: !actual } : p))
  }

  const eliminarProveedor = async (id) => {
    await supabase.from('proveedores').delete().eq('id', id)
    setProveedores(prev => prev.filter(p => p.id !== id))
  }

  const nuevos = avisos.filter(a => a.estado === 'nuevo').length

  const inputStyle = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '11px 14px', color: 'var(--text)', fontSize: 14 }

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: '56px 20px 20px' }}>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>Panel de gestión</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>{vecino.edificio.nombre}</h1>
        {nuevos > 0 && (
          <div style={{ marginTop: 14, background: 'var(--danger-dim)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13, color: 'var(--danger)', fontWeight: 500 }}>
            {nuevos} aviso{nuevos > 1 ? 's' : ''} nuevo{nuevos > 1 ? 's' : ''} sin atender
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', margin: '0 20px 20px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: 4 }}>
        {[{ key: 'avisos', label: `Avisos${nuevos > 0 ? ` (${nuevos})` : ''}` }, { key: 'proveedores', label: 'Proveedores' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '9px', borderRadius: 7, fontSize: 13, fontWeight: 600,
            background: tab === t.key ? 'var(--surface3)' : 'none',
            color: tab === t.key ? 'var(--text)' : 'var(--text3)',
            border: tab === t.key ? '1px solid var(--border2)' : '1px solid transparent',
            transition: 'all 0.2s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* AVISOS */}
      {tab === 'avisos' && (
        <div style={{ padding: '0 20px' }}>
          {loading && <p style={{ color: 'var(--text3)', textAlign: 'center', padding: 20 }}>Cargando...</p>}
          {!loading && avisos.length === 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, textAlign: 'center' }}>
              <p style={{ color: 'var(--text3)', fontSize: 14 }}>Sin avisos todavía.</p>
            </div>
          )}
          {avisos.map(a => (
            <div key={a.id} style={{ background: 'var(--surface)', border: `1px solid ${a.estado === 'nuevo' ? 'var(--danger-border)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: 16, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{a.descripcion}</p>
                  <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>
                    {a.vecinos ? `Depto ${a.vecinos.departamento} · ${a.vecinos.nombre}` : ''}
                  </p>
                  <p style={{ fontSize: 11, color: a.urgencia === 'alta' ? 'var(--danger)' : 'var(--text3)', marginTop: 4, fontWeight: 500 }}>
                    {a.urgencia === 'alta' ? 'Urgente' : a.urgencia === 'media' ? 'Esta semana' : 'Puede esperar'} · {new Date(a.created_at).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: `${estadoColor[a.estado]}12`, color: estadoColor[a.estado], flexShrink: 0, height: 'fit-content', whiteSpace: 'nowrap' }}>
                  {estadoLabel[a.estado]}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['nuevo', 'en_curso', 'resuelto'].map(e => (
                  <button key={e} onClick={() => cambiarEstado(a.id, e)} style={{
                    flex: 1, padding: '7px 4px', borderRadius: 'var(--radius-sm)', fontSize: 10, fontWeight: 600,
                    background: a.estado === e ? `${estadoColor[e]}12` : 'var(--surface2)',
                    border: `1px solid ${a.estado === e ? `${estadoColor[e]}25` : 'var(--border)'}`,
                    color: a.estado === e ? estadoColor[e] : 'var(--text3)',
                    transition: 'all 0.15s'
                  }}>{estadoLabel[e]}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PROVEEDORES */}
      {tab === 'proveedores' && (
        <div style={{ padding: '0 20px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 14 }}>Agregar proveedor</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input value={nuevoP.nombre} onChange={e => setNuevoP({ ...nuevoP, nombre: e.target.value })} placeholder="Nombre del proveedor" style={inputStyle} />
              <input value={nuevoP.telefono} onChange={e => setNuevoP({ ...nuevoP, telefono: e.target.value })} placeholder="Teléfono" style={inputStyle} />
              <select value={nuevoP.rubro} onChange={e => setNuevoP({ ...nuevoP, rubro: e.target.value })} style={{ ...inputStyle, background: 'var(--bg2)' }}>
                {['Plomería','Electricidad','Cerrajería','Gas','Estructura','Otro'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            {exito && <p style={{ color: 'var(--success)', fontSize: 13, marginTop: 10 }}>{exito}</p>}
            <button onClick={agregarProveedor} disabled={guardando} style={{ width: '100%', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '12px', fontSize: 13, fontWeight: 600, marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <PlusIcon /> {guardando ? 'Guardando...' : 'Agregar proveedor'}
            </button>
          </div>

          {proveedores.map(p => (
            <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{p.nombre}</p>
                <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{p.rubro} · {p.telefono}</p>
              </div>
              <button onClick={() => toggleDisponible(p.id, p.disponible)} style={{ padding: '5px 10px', borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 600, background: p.disponible ? 'var(--success-dim)' : 'var(--surface2)', border: `1px solid ${p.disponible ? 'var(--success-border)' : 'var(--border)'}`, color: p.disponible ? 'var(--success)' : 'var(--text3)' }}>
                {p.disponible ? 'Activo' : 'Inactivo'}
              </button>
              <button onClick={() => eliminarProveedor(p.id)} style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--danger-dim)', border: '1px solid var(--danger-border)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
