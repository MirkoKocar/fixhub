import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../supabase'
import BottomNav from '../components/BottomNav'

const rubros = ['Todos', 'Plomería', 'Electricidad', 'Cerrajería', 'Gas', 'Estructura', 'Otro']

const rubroColor = {
  Plomería: '#4f8ef7', Electricidad: '#f5a623', Cerrajería: '#a78bfa',
  Gas: '#f76f6f', Estructura: '#2dd4a0', Otro: '#8b95aa'
}

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.28-1.28a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
)
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

export default function Proveedores({ vecino }) {
  const location = useLocation()
  const rubroInicial = location.state?.rubro || 'Todos'
  const [filtro, setFiltro] = useState(rubroInicial)
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('proveedores').select('*').eq('edificio_id', vecino.edificio.id).order('nombre')
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
      <div style={{ padding: '56px 20px 24px' }}>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>{vecino.edificio.nombre}</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>Proveedores</h1>
      </div>

      {/* Search */}
      <div style={{ margin: '0 20px 16px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text3)' }}>
        <SearchIcon />
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar proveedor..."
          style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: 14, flex: 1 }} />
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 6, padding: '0 20px 20px', overflowX: 'auto' }}>
        {rubros.map(r => (
          <button key={r} onClick={() => setFiltro(r)} style={{
            background: filtro === r ? 'var(--accent)' : 'var(--surface2)',
            color: filtro === r ? '#fff' : 'var(--text2)',
            border: `1px solid ${filtro === r ? 'transparent' : 'var(--border)'}`,
            borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 500,
            whiteSpace: 'nowrap', transition: 'all 0.15s'
          }}>{r}</button>
        ))}
      </div>

      {/* List */}
      <div style={{ padding: '0 20px' }}>
        {loading && <p style={{ color: 'var(--text3)', textAlign: 'center', padding: 20 }}>Cargando...</p>}
        {!loading && filtrados.length === 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, textAlign: 'center' }}>
            <p style={{ color: 'var(--text3)', fontSize: 14 }}>No hay proveedores en esta categoría.</p>
          </div>
        )}
        {filtrados.map(p => (
          <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${rubroColor[p.rubro] || '#8b95aa'}15`, border: `1px solid ${rubroColor[p.rubro] || '#8b95aa'}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: rubroColor[p.rubro] || 'var(--text2)', fontFamily: 'DM Mono, monospace' }}>{p.rubro.slice(0,2).toUpperCase()}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{p.nombre}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                <span style={{ fontSize: 12, color: rubroColor[p.rubro] || 'var(--text2)', fontWeight: 500 }}>{p.rubro}</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text3)' }} />
                <span style={{ fontSize: 11, color: p.disponible ? 'var(--success)' : 'var(--text3)', fontWeight: 500 }}>{p.disponible ? 'Disponible' : 'No disponible'}</span>
              </div>
            </div>
            <a href={`tel:${p.telefono}`} style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
              <PhoneIcon />
            </a>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
