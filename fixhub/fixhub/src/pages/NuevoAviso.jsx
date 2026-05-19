import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const rubros = [
  { label: 'Plomería', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 00-5 5v3H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2v-8a2 2 0 00-2-2h-2V7a5 5 0 00-5-5z"/></svg> },
  { label: 'Electricidad', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
  { label: 'Cerrajería', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg> },
  { label: 'Estructura', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg> },
  { label: 'Gas', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 6v6l4 2"/></svg> },
  { label: 'Otro', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
]

const urgencias = [
  { key: 'baja', label: 'Puede esperar', color: 'var(--success)' },
  { key: 'media', label: 'Esta semana', color: 'var(--warning)' },
  { key: 'alta', label: 'Urgente', color: 'var(--danger)' },
]

export default function NuevoAviso({ vecino }) {
  const navigate = useNavigate()
  const [rubro, setRubro] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [urgencia, setUrgencia] = useState('media')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const enviar = async () => {
    if (!rubro || !descripcion.trim()) return
    setLoading(true)
    await supabase.from('avisos').insert({
      rubro, descripcion: descripcion.trim(), urgencia,
      estado: 'nuevo', vecino_id: vecino.id,
      edificio_id: vecino.edificio_id || vecino.edificio.id,
    })
    setLoading(false)
    setEnviado(true)
    setTimeout(() => navigate('/proveedores', { state: { rubro } }), 2000)
  }

  if (enviado) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 28 }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--success-dim)', border: '1px solid var(--success-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Aviso enviado</h2>
        <p style={{ color: 'var(--text2)', marginTop: 8, fontSize: 14 }}>El administrador fue notificado. Ahora te mostramos los proveedores.</p>
      </div>
    </div>
  )

  const sectionLabel = (text) => (
    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 20px', marginBottom: 12 }}>{text}</p>
  )

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ padding: '56px 20px 28px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={() => navigate('/')} style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Nuevo aviso</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>El administrador lo recibe al instante</p>
        </div>
      </div>

      {/* Tipo */}
      {sectionLabel('Tipo de problema')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '0 20px 28px' }}>
        {rubros.map(r => (
          <button key={r.label} onClick={() => setRubro(r.label)} style={{
            background: rubro === r.label ? 'var(--accent-dim)' : 'var(--surface2)',
            border: `1px solid ${rubro === r.label ? 'var(--accent-border)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)', padding: '16px 10px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            color: rubro === r.label ? 'var(--accent)' : 'var(--text2)',
            transition: 'all 0.15s',
          }}>
            {r.icon}
            <span style={{ fontSize: 11, fontWeight: 500 }}>{r.label}</span>
          </button>
        ))}
      </div>

      {/* Descripción */}
      {sectionLabel('Descripción')}
      <div style={{ padding: '0 20px 28px' }}>
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={3}
          placeholder="Describí brevemente el problema..."
          style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', color: 'var(--text)', fontSize: 14, resize: 'none', lineHeight: 1.5 }} />
      </div>

      {/* Urgencia */}
      {sectionLabel('Urgencia')}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 32px' }}>
        {urgencias.map(u => (
          <button key={u.key} onClick={() => setUrgencia(u.key)} style={{
            flex: 1, padding: '10px 6px', borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 600,
            background: urgencia === u.key ? `${u.color}12` : 'var(--surface2)',
            border: `1px solid ${urgencia === u.key ? `${u.color}30` : 'var(--border)'}`,
            color: urgencia === u.key ? u.color : 'var(--text3)',
            transition: 'all 0.15s'
          }}>{u.label}</button>
        ))}
      </div>

      {/* Submit */}
      <div style={{ padding: '0 20px' }}>
        <button onClick={enviar} disabled={loading || !rubro || !descripcion.trim()} style={{
          width: '100%', background: rubro && descripcion.trim() ? 'var(--accent)' : 'var(--surface2)',
          color: rubro && descripcion.trim() ? '#fff' : 'var(--text3)',
          borderRadius: 'var(--radius)', padding: '15px',
          fontSize: 14, fontWeight: 600, letterSpacing: '0.02em', transition: 'all 0.2s'
        }}>
          {loading ? 'Enviando...' : 'Enviar aviso'}
        </button>
      </div>
    </div>
  )
}
