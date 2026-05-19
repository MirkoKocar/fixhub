import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const rubros = [
  { icon: '🚿', label: 'Plomería' },
  { icon: '💡', label: 'Electricidad' },
  { icon: '🔒', label: 'Cerrajería' },
  { icon: '🏗️', label: 'Estructura' },
  { icon: '🌡️', label: 'Gas' },
  { icon: '📦', label: 'Otro' },
]

const urgencias = [
  { key: 'baja', label: 'Puede esperar', color: 'var(--accent)' },
  { key: 'media', label: 'Esta semana', color: '#ffc800' },
  { key: 'alta', label: '🚨 Urgente', color: 'var(--accent2)' },
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
      rubro,
      descripcion: descripcion.trim(),
      urgencia,
      estado: 'nuevo',
      vecino_id: vecino.id,
      edificio_id: vecino.edificio_id || vecino.edificio.id,
    })
    setLoading(false)
    setEnviado(true)
    setTimeout(() => navigate('/proveedores', { state: { rubro } }), 1800)
  }

  if (enviado) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 28 }}>
      <div style={{ fontSize: 72, animation: 'pulse 0.5s ease' }}>✅</div>
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, textAlign: 'center' }}>¡Aviso enviado!</h2>
      <p style={{ color: 'var(--muted)', textAlign: 'center' }}>El administrador ya lo recibió. Ahora te mostramos los proveedores disponibles.</p>
    </div>
  )

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ padding: '56px 24px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('/')} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px', fontSize: 14, color: 'var(--accent)' }}>←</button>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800 }}>Nuevo aviso</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>El admin lo recibe al instante.</p>
        </div>
      </div>

      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 700, padding: '20px 24px 12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>¿Qué tipo de problema?</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '0 20px 24px' }}>
        {rubros.map(r => (
          <button key={r.label} onClick={() => setRubro(r.label)} style={{
            background: rubro === r.label ? 'rgba(0,229,160,0.08)' : 'var(--surface2)',
            border: `1.5px solid ${rubro === r.label ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 16, padding: '16px 10px', textAlign: 'center', transition: 'all 0.15s'
          }}>
            <span style={{ fontSize: 24, display: 'block', marginBottom: 6 }}>{r.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{r.label}</span>
          </button>
        ))}
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block' }}>Descripción</label>
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={3}
          placeholder="Contá brevemente qué pasó…"
          style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', fontSize: 14, resize: 'none' }} />
      </div>

      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 700, padding: '0 24px 12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Urgencia</p>
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 28px' }}>
        {urgencias.map(u => (
          <button key={u.key} onClick={() => setUrgencia(u.key)} style={{
            flex: 1, padding: '10px 4px', borderRadius: 12, fontSize: 11, fontWeight: 600,
            background: urgencia === u.key ? `rgba(${u.key === 'baja' ? '0,229,160' : u.key === 'media' ? '255,200,0' : '255,107,74'},0.1)` : 'var(--surface2)',
            border: `1.5px solid ${urgencia === u.key ? u.color : 'var(--border)'}`,
            color: urgencia === u.key ? u.color : 'var(--muted)',
            transition: 'all 0.15s'
          }}>{u.label}</button>
        ))}
      </div>

      <div style={{ padding: '0 20px' }}>
        <button onClick={enviar} disabled={loading || !rubro || !descripcion.trim()} style={{
          width: '100%', background: rubro && descripcion.trim() ? 'var(--accent)' : 'var(--surface2)',
          color: rubro && descripcion.trim() ? '#0f0f12' : 'var(--muted)',
          borderRadius: 16, padding: 16, fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 800,
          transition: 'all 0.2s'
        }}>
          {loading ? 'Enviando...' : 'Enviar aviso →'}
        </button>
      </div>
    </div>
  )
}
