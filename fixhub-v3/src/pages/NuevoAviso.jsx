import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { OrnamentLine, PrimaryBtn, Card } from '../components/Palace'

const rubros = ['Plomería', 'Electricidad', 'Cerrajería', 'Gas', 'Estructura', 'Jardinería', 'Limpieza', 'Otro']
const urgencias = [
  { key: 'baja', label: 'Puede esperar', color: '#34d399' },
  { key: 'media', label: 'Esta semana', color: '#fbbf24' },
  { key: 'alta', label: 'Urgente', color: '#f87171' },
]

export default function NuevoAviso({ user }) {
  const navigate = useNavigate()
  const [rubro, setRubro] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [urgencia, setUrgencia] = useState('media')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const enviar = async () => {
    if (!rubro || !descripcion.trim()) return
    setLoading(true)
    await supabase.from('avisos').insert({ rubro, descripcion: descripcion.trim(), urgencia, estado: 'nuevo', vecino_id: user.id, edificio_id: user.edificio.id })
    setLoading(false)
    setEnviado(true)
    setTimeout(() => navigate('/proveedores', { state: { rubro } }), 2000)
  }

  if (enviado) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 28, textAlign: 'center' }}>
      <p className="font-cormorant animate-ornament" style={{ color: '#D9CBB0', fontSize: 14, letterSpacing: '0.5em' }}>✦ ✦ ✦</p>
      <h2 className="font-cormorant" style={{ fontSize: 32, fontWeight: 600, color: '#F2E0C9' }}>Aviso enviado</h2>
      <p style={{ fontSize: 13, color: 'rgba(160,174,192,0.5)' }}>El administrador fue notificado. Te mostramos los proveedores.</p>
    </div>
  )

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ padding: '52px 24px 24px', textAlign: 'center' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', color: 'rgba(160,174,192,0.4)', fontSize: 12, letterSpacing: '0.1em', marginBottom: 20, display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>← Volver</button>
        <h1 className="font-cormorant" style={{ fontSize: 30, fontWeight: 700, color: '#F2E0C9', marginBottom: 6 }}>Nuevo aviso</h1>
        <p style={{ fontSize: 12, color: 'rgba(160,174,192,0.45)' }}>El administrador lo recibe al instante</p>
        <div style={{ marginTop: 16 }}><OrnamentLine /></div>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Tipo de problema</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {rubros.map(r => (
            <button key={r} onClick={() => setRubro(r)} style={{ background: rubro === r ? 'rgba(242,224,201,0.1)' : 'rgba(242,224,201,0.03)', border: `1px solid ${rubro === r ? 'rgba(217,203,176,0.3)' : 'rgba(217,203,176,0.08)'}`, borderRadius: 10, padding: '10px 6px', fontSize: 10, color: rubro === r ? '#F2E0C9' : 'rgba(160,174,192,0.45)', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 13, transition: 'all 0.15s' }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Descripción</p>
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={3} placeholder="Describí brevemente el problema..."
          style={{ width: '100%', background: 'rgba(242,224,201,0.05)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 12, padding: '14px 16px', color: '#F2E0C9', fontSize: 14, resize: 'none', lineHeight: 1.5, fontFamily: 'inherit' }} />
      </div>

      <div style={{ padding: '0 20px 28px' }}>
        <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Urgencia</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {urgencias.map(u => (
            <button key={u.key} onClick={() => setUrgencia(u.key)} style={{ flex: 1, padding: '10px 6px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: urgencia === u.key ? `${u.color}12` : 'rgba(242,224,201,0.03)', border: `1px solid ${urgencia === u.key ? `${u.color}30` : 'rgba(217,203,176,0.08)'}`, color: urgencia === u.key ? u.color : 'rgba(160,174,192,0.4)', transition: 'all 0.15s' }}>{u.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <PrimaryBtn onClick={enviar} disabled={loading || !rubro || !descripcion.trim()}>
          {loading ? 'Enviando...' : 'Enviar aviso'}
        </PrimaryBtn>
      </div>
    </div>
  )
}
