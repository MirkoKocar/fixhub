import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import BottomNav from '../components/BottomNav'

const estadoColor = { nuevo: '#ff6b4a', en_curso: '#ffc800', resuelto: '#00e5a0' }
const estadoLabel = { nuevo: 'NUEVO', en_curso: 'EN CURSO', resuelto: 'RESUELTO' }
const rubroIcon = { Plomería: '🚿', Electricidad: '💡', Cerrajería: '🔒', Gas: '🌡️', Estructura: '🏗️', Otro: '📦' }

export default function Admin({ vecino }) {
  const [avisos, setAvisos] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [tab, setTab] = useState('avisos')
  const [loading, setLoading] = useState(true)

  // Nuevo proveedor
  const [nuevoP, setNuevoP] = useState({ nombre: '', rubro: 'Plomería', telefono: '', disponible: true })
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito] = useState('')

  useEffect(() => {
    fetchData()
  }, [vecino.edificio.id])

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
    setExito('Proveedor agregado ✓')
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

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: '56px 24px 20px' }}>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Panel de</p>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800 }}>
          Administrador<br /><span style={{ color: 'var(--accent)' }}>{vecino.edificio.nombre}</span>
        </h1>
        {nuevos > 0 && (
          <div style={{ marginTop: 12, background: 'rgba(255,107,74,0.1)', border: '1px solid rgba(255,107,74,0.25)', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: 'var(--accent2)', fontWeight: 600 }}>
            🔔 {nuevos} aviso{nuevos > 1 ? 's' : ''} nuevo{nuevos > 1 ? 's' : ''} sin atender
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', margin: '0 20px 20px', background: 'var(--surface2)', borderRadius: 12, padding: 4 }}>
        {[{ key: 'avisos', label: `Avisos ${nuevos > 0 ? `(${nuevos})` : ''}` }, { key: 'proveedores', label: 'Proveedores' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '8px', borderRadius: 9, fontSize: 13, fontWeight: 600,
            background: tab === t.key ? 'var(--accent)' : 'none',
            color: tab === t.key ? '#0f0f12' : 'var(--muted)',
            transition: 'all 0.2s', fontFamily: 'Syne, sans-serif'
          }}>{t.label}</button>
        ))}
      </div>

      {/* AVISOS TAB */}
      {tab === 'avisos' && (
        <div style={{ padding: '0 20px' }}>
          {loading && <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 20 }}>Cargando...</p>}
          {!loading && avisos.length === 0 && (
            <div style={{ background: 'var(--surface2)', borderRadius: 14, padding: 24, textAlign: 'center', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 24, marginBottom: 8 }}>✨</p>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>Sin avisos todavía.</p>
            </div>
          )}
          {avisos.map(aviso => (
            <div key={aviso.id} style={{ background: 'var(--surface2)', borderRadius: 14, padding: 16, marginBottom: 12, border: `1px solid ${aviso.estado === 'nuevo' ? 'rgba(255,107,74,0.3)' : 'var(--border)'}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>{rubroIcon[aviso.rubro] || '📦'}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{aviso.descripcion}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {aviso.vecinos ? `Depto ${aviso.vecinos.departamento} · ${aviso.vecinos.nombre}` : ''} · {new Date(aviso.created_at).toLocaleDateString('es-AR')}
                  </p>
                  <p style={{ fontSize: 11, color: aviso.urgencia === 'alta' ? 'var(--accent2)' : 'var(--muted)', marginTop: 2 }}>
                    {aviso.urgencia === 'alta' ? '🚨 Urgente' : aviso.urgencia === 'media' ? '⏱ Esta semana' : '📅 Puede esperar'}
                  </p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 6, background: `rgba(${aviso.estado === 'nuevo' ? '255,107,74' : aviso.estado === 'en_curso' ? '255,200,0' : '0,229,160'},0.12)`, color: estadoColor[aviso.estado], flexShrink: 0 }}>
                  {estadoLabel[aviso.estado]}
                </span>
              </div>
              {/* Cambiar estado */}
              <div style={{ display: 'flex', gap: 6 }}>
                {['nuevo', 'en_curso', 'resuelto'].map(e => (
                  <button key={e} onClick={() => cambiarEstado(aviso.id, e)} style={{
                    flex: 1, padding: '7px 4px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                    background: aviso.estado === e ? `rgba(${e === 'nuevo' ? '255,107,74' : e === 'en_curso' ? '255,200,0' : '0,229,160'},0.15)` : 'var(--surface)',
                    border: `1px solid ${aviso.estado === e ? estadoColor[e] : 'var(--border)'}`,
                    color: aviso.estado === e ? estadoColor[e] : 'var(--muted)',
                    transition: 'all 0.15s'
                  }}>{estadoLabel[e]}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PROVEEDORES TAB */}
      {tab === 'proveedores' && (
        <div style={{ padding: '0 20px' }}>
          {/* Agregar proveedor */}
          <div style={{ background: 'var(--surface2)', borderRadius: 16, padding: 16, marginBottom: 20, border: '1px solid rgba(0,229,160,0.15)' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--accent)' }}>+ Agregar proveedor</p>
            <input value={nuevoP.nombre} onChange={e => setNuevoP({ ...nuevoP, nombre: e.target.value })} placeholder="Nombre"
              style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', fontSize: 13, marginBottom: 8 }} />
            <input value={nuevoP.telefono} onChange={e => setNuevoP({ ...nuevoP, telefono: e.target.value })} placeholder="Teléfono"
              style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', fontSize: 13, marginBottom: 8 }} />
            <select value={nuevoP.rubro} onChange={e => setNuevoP({ ...nuevoP, rubro: e.target.value })}
              style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', fontSize: 13, marginBottom: 12 }}>
              {['Plomería', 'Electricidad', 'Cerrajería', 'Gas', 'Estructura', 'Otro'].map(r => <option key={r}>{r}</option>)}
            </select>
            {exito && <p style={{ color: 'var(--accent)', fontSize: 13, marginBottom: 8 }}>{exito}</p>}
            <button onClick={agregarProveedor} disabled={guardando} style={{
              width: '100%', background: 'var(--accent)', color: '#0f0f12', borderRadius: 10,
              padding: '11px', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 800
            }}>{guardando ? 'Guardando...' : 'Guardar proveedor'}</button>
          </div>

          {/* Lista */}
          {proveedores.map(p => (
            <div key={p.id} style={{ background: 'var(--surface2)', borderRadius: 14, padding: 14, marginBottom: 10, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>{rubroIcon[p.rubro] || '📦'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Syne, sans-serif' }}>{p.nombre}</p>
                <p style={{ fontSize: 11, color: 'var(--accent)' }}>{p.rubro} · {p.telefono}</p>
              </div>
              <button onClick={() => toggleDisponible(p.id, p.disponible)} style={{
                padding: '5px 8px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                background: p.disponible ? 'rgba(0,229,160,0.1)' : 'rgba(255,107,74,0.1)',
                border: `1px solid ${p.disponible ? 'rgba(0,229,160,0.3)' : 'rgba(255,107,74,0.3)'}`,
                color: p.disponible ? 'var(--accent)' : 'var(--accent2)'
              }}>{p.disponible ? '🟢' : '🔴'}</button>
              <button onClick={() => eliminarProveedor(p.id)} style={{ padding: '5px 8px', borderRadius: 8, fontSize: 12, background: 'rgba(255,107,74,0.08)', border: '1px solid rgba(255,107,74,0.15)', color: 'var(--accent2)' }}>🗑</button>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
