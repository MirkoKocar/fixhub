import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import BottomNav from '../components/BottomNav'

const estadoColor = { nuevo: 'var(--danger)', en_curso: 'var(--warning)', resuelto: 'var(--success)' }
const estadoLabel = { nuevo: 'Nuevo', en_curso: 'En curso', resuelto: 'Resuelto' }

export default function Avisos({ vecino }) {
  const [avisos, setAvisos] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('mis')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      let query = supabase.from('avisos').select('*, vecinos(nombre, departamento)').order('created_at', { ascending: false })
      if (tab === 'mis') query = query.eq('vecino_id', vecino.id)
      else query = query.eq('edificio_id', vecino.edificio.id)
      const { data } = await query
      setAvisos(data || [])
      setLoading(false)
    }
    fetch()
  }, [tab, vecino.id, vecino.edificio.id])

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: '56px 20px 24px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>Avisos</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', margin: '0 20px 20px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: 4 }}>
        {[{ key: 'mis', label: 'Mis avisos' }, { key: 'todos', label: 'Todo el edificio' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '9px', borderRadius: 7, fontSize: 13, fontWeight: 600,
            background: tab === t.key ? 'var(--surface3)' : 'none',
            color: tab === t.key ? 'var(--text)' : 'var(--text3)',
            border: tab === t.key ? '1px solid var(--border2)' : '1px solid transparent',
            transition: 'all 0.2s',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: '0 20px' }}>
        {loading && <p style={{ color: 'var(--text3)', textAlign: 'center', padding: 20 }}>Cargando...</p>}
        {!loading && avisos.length === 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, textAlign: 'center' }}>
            <p style={{ color: 'var(--text3)', fontSize: 14 }}>Sin avisos todavía.</p>
          </div>
        )}
        {avisos.map(a => (
          <div key={a.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{a.descripcion}</p>
                {tab === 'todos' && a.vecinos && (
                  <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>Depto {a.vecinos.departamento} · {a.vecinos.nombre}</p>
                )}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: `${estadoColor[a.estado]}12`, color: estadoColor[a.estado], flexShrink: 0, whiteSpace: 'nowrap' }}>
                {estadoLabel[a.estado]}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text3)' }}>
              <span style={{ fontWeight: 500 }}>{a.rubro}</span>
              <span>{new Date(a.created_at).toLocaleDateString('es-AR')}</span>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
