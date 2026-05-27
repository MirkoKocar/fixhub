import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, PageHeader, PrimaryBtn, Card, BottomNav } from '../components/Palace'

const CATEGORIAS = ['Plomería', 'Electricidad', 'Gas', 'Ascensor', 'Limpieza', 'Seguridad', 'Estructura', 'Internet', 'Otro']
const URGENCIAS = [
  { value: 'baja', label: 'Baja', desc: 'Puede esperar días', color: '#34d399' },
  { value: 'media', label: 'Media', desc: 'Urgente en horas', color: '#fbbf24' },
  { value: 'alta', label: 'Alta', desc: 'Emergencia', color: '#f87171' },
]

export default function NuevoAviso({ user }) {
  const navigate = useNavigate()
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState('')
  const [urgencia, setUrgencia] = useState('media')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!titulo.trim()) { setError('Agregá un título.'); return }
    if (!categoria) { setError('Elegí una categoría.'); return }
    setLoading(true); setError('')
    const { error: e } = await supabase.from('avisos').insert({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      categoria,
      urgencia,
      estado: 'nuevo',
      vecino_id: user.id,
      edificio_id: user.edificio.id,
    })
    if (e) { setError('Error al enviar. Intentá de nuevo.'); setLoading(false); return }
    navigate('/avisos')
  }

  return (
    <div className="page">
      <PalaceFrame />
      <PageHeader title="Nuevo Aviso" subtitle="Reportá un problema" onBack={() => navigate('/')} />

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Título */}
        <div>
          <p style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(160,174,192,0.35)', marginBottom: 8 }}>Título del problema</p>
          <input
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Ej: Pérdida de agua en baño"
            style={{
              width: '100%', background: 'rgba(242,224,201,0.05)',
              border: '1px solid rgba(217,203,176,0.12)', borderRadius: 10,
              padding: '13px 16px', color: '#F2E0C9', fontSize: 15,
            }}
          />
        </div>

        {/* Categoría */}
        <div>
          <p style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(160,174,192,0.35)', marginBottom: 8 }}>Categoría</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {CATEGORIAS.map(c => (
              <button key={c} onClick={() => setCategoria(c)} style={{
                padding: '7px 14px', borderRadius: 20,
                background: categoria === c ? 'rgba(242,224,201,0.12)' : 'rgba(242,224,201,0.04)',
                border: `1px solid ${categoria === c ? 'rgba(217,203,176,0.35)' : 'rgba(217,203,176,0.1)'}`,
                color: categoria === c ? '#F2E0C9' : 'rgba(160,174,192,0.4)',
                fontSize: 11, letterSpacing: '0.04em', transition: 'all 0.2s'
              }}>{c}</button>
            ))}
          </div>
        </div>

        {/* Urgencia */}
        <div>
          <p style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(160,174,192,0.35)', marginBottom: 8 }}>Urgencia</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {URGENCIAS.map(u => (
              <button key={u.value} onClick={() => setUrgencia(u.value)} style={{
                flex: 1, padding: '11px 8px', borderRadius: 10, textAlign: 'center',
                background: urgencia === u.value ? `${u.color}10` : 'rgba(242,224,201,0.03)',
                border: `1px solid ${urgencia === u.value ? `${u.color}35` : 'rgba(217,203,176,0.08)'}`,
                transition: 'all 0.2s'
              }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: urgencia === u.value ? u.color : 'rgba(160,174,192,0.4)' }}>{u.label}</p>
                <p style={{ fontSize: 9, color: 'rgba(160,174,192,0.3)', marginTop: 2 }}>{u.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <p style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(160,174,192,0.35)', marginBottom: 8 }}>
            Descripción <span style={{ color: 'rgba(160,174,192,0.2)' }}>(opcional)</span>
          </p>
          <textarea
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Describí el problema con más detalle..."
            rows={3}
            style={{
              width: '100%', background: 'rgba(242,224,201,0.05)',
              border: '1px solid rgba(217,203,176,0.12)', borderRadius: 10,
              padding: '13px 16px', color: '#F2E0C9', fontSize: 14,
              resize: 'none', lineHeight: 1.5,
            }}
          />
        </div>

        {error && <p style={{ color: '#f87171', fontSize: 11, textAlign: 'center' }}>{error}</p>}

        <PrimaryBtn onClick={handleSubmit} disabled={loading} style={{ marginTop: 4 }}>
          {loading ? 'Enviando...' : 'Enviar aviso'}
        </PrimaryBtn>
      </div>

      <BottomNav rol="vecino" />
    </div>
  )
}
