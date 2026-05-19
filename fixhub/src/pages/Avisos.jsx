import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import BottomNav from '../components/BottomNav'

const estadoColor = { nuevo: '#ff6b4a', en_curso: '#ffc800', resuelto: '#00e5a0' }
const estadoLabel = { nuevo: 'NUEVO', en_curso: 'EN CURSO', resuelto: 'RESUELTO' }
const rubroIcon = { Plomería: '🚿', Electricidad: '💡', Cerrajería: '🔒', Gas: '🌡️', Estructura: '🏗️', Otro: '📦' }

export default function Avisos({ vecino }) {
  const [avisos, setAvisos] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('mis')

  useEffect(() => {
    const fetch = async () => {
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
      <div style={{ padding: '56px 24px 20px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800 }}>
          Avisos<br /><span style={{ color: 'var(--accent)' }}>del edificio.</span>
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', margin: '0 20px 20px', background: 'var(--surface2)', borderRadius: 12, padding: 4 }}>
        {[{ key: 'mis', label: 'Mis avisos' }, { key: 'todos', label: 'Edificio' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '8px', borderRadius: 9, fontSize: 13, fontWeight: 600,
            background: tab === t.key ? 'var(--accent)' : 'none',
            color: tab === t.key ? '#0f0f12' : 'var(--muted)',
            transition: 'all 0.2s', fontFamily: 'Syne, sans-serif'
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: '0 20px' }}>
        {loading && <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 20 }}>Cargando...</p>}
        {!loading && avisos.length === 0 && (
          <div style={{ background: 'var(--surface2)', borderRadius: 14, padding: 24, textAlign: 'center', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 24, marginBottom: 8 }}>✨</p>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Sin avisos todavía.</p>
          </div>
        )}
        {avisos.map(aviso => (
          <div key={aviso.id} style={{ background: 'var(--surface2)', borderRadius: 14, padding: '14px 16px', marginBottom: 10, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(${aviso.estado === 'nuevo' ? '255,107,74' : aviso.estado === 'en_curso' ? '255,200,0' : '0,229,160'},0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {rubroIcon[aviso.rubro] || '📦'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{aviso.descripcion}</p>
                {tab === 'todos' && aviso.vecinos && (
                  <p style={{ fontSize: 11, color: 'var(--muted)' }}>Depto {aviso.vecinos.departamento} · {aviso.vecinos.nombre}</p>
                )}
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 6, background: `rgba(${aviso.estado === 'nuevo' ? '255,107,74' : aviso.estado === 'en_curso' ? '255,200,0' : '0,229,160'},0.12)`, color: estadoColor[aviso.estado], flexShrink: 0 }}>
                {estadoLabel[aviso.estado]}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)' }}>
              <span>{aviso.rubro} · Urgencia: {aviso.urgencia}</span>
              <span>{new Date(aviso.created_at).toLocaleDateString('es-AR')}</span>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
