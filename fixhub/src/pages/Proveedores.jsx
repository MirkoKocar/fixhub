import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../supabase'
import BottomNav from '../components/BottomNav'

const rubroIcon = { Plomería: '🚿', Electricidad: '💡', Cerrajería: '🔒', Gas: '🌡️', Estructura: '🏗️', Otro: '📦' }
const rubros = ['Todos', 'Plomería', 'Electricidad', 'Cerrajería', 'Gas', 'Estructura', 'Otro']

export default function Proveedores({ vecino }) {
  const location = useLocation()
  const rubroInicial = location.state?.rubro || 'Todos'
  const [filtro, setFiltro] = useState(rubroInicial)
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('proveedores')
        .select('*')
        .eq('edificio_id', vecino.edificio.id)
        .order('nombre')
      setProveedores(data || [])
      setLoading(false)
    }
    fetch()
  }, [vecino.edificio.id])

  const filtrados = proveedores.filter(p => {
    const matchRubro = filtro === 'Todos' || p.rubro === filtro
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.rubro.toLowerCase().includes(busqueda.toLowerCase())
    return matchRubro && matchBusqueda
  })

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: '56px 24px 20px' }}>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>{vecino.edificio.nombre}</p>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, lineHeight: 1.1, marginTop: 4 }}>
          Proveedores<br /><span style={{ color: 'var(--accent)' }}>de confianza.</span>
        </h1>
      </div>

      {/* Buscador */}
      <div style={{ margin: '0 20px 16px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: 'var(--muted)' }}>🔍</span>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar plomero, electricista…"
          style={{ background: 'none', border: 'none', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', fontSize: 14, flex: 1 }} />
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 20px', overflowX: 'auto' }}>
        {rubros.map(r => (
          <button key={r} onClick={() => setFiltro(r)} style={{
            background: filtro === r ? 'var(--accent)' : 'var(--surface2)',
            color: filtro === r ? '#0f0f12' : 'var(--muted)',
            border: '1px solid var(--border)', borderRadius: 20, padding: '6px 14px',
            fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.15s'
          }}>{r}</button>
        ))}
      </div>

      {/* Lista */}
      <div style={{ padding: '0 20px' }}>
        {loading && <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 20 }}>Cargando...</p>}
        {!loading && filtrados.length === 0 && (
          <div style={{ background: 'var(--surface2)', borderRadius: 14, padding: 24, textAlign: 'center', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 24, marginBottom: 8 }}>🔍</p>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>No hay proveedores en esta categoría todavía.</p>
          </div>
        )}
        {filtrados.map(p => (
          <div key={p.id} style={{ background: 'var(--surface2)', borderRadius: 16, padding: 16, marginBottom: 10, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              {rubroIcon[p.rubro] || '📦'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600, fontFamily: 'Syne, sans-serif' }}>{p.nombre}</p>
              <p style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500, margin: '2px 0' }}>{p.rubro}</p>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>
                {p.disponible ? '🟢 Disponible' : '🔴 No disponible'}
              </p>
            </div>
            <a href={`tel:${p.telefono}`} style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(0,229,160,0.12)', border: '1px solid rgba(0,229,160,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, textDecoration: 'none', flexShrink: 0
            }}>📞</a>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
