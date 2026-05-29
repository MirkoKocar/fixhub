import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, PageHeader, PrimaryBtn, OrnamentLine, BottomNav } from '../components/Palace'

const CATEGORIAS = ['Plomería','Electricidad','Gas','Ascensor','Limpieza','Seguridad','Estructura','Internet','Otro']
const URGENCIAS = [
  { value: 'baja', label: 'Baja', desc: 'Puede esperar', color: '#34d399' },
  { value: 'media', label: 'Media', desc: 'Esta semana', color: '#fbbf24' },
  { value: 'alta', label: 'Alta', desc: 'Emergencia', color: '#f87171' },
]

export default function NuevoAviso({ user }) {
  const navigate = useNavigate()
  const location = useLocation()
  const preProveedor = location.state?.proveedor_id
  const preProveedorNombre = location.state?.proveedor_nombre

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
    const { data: aviso, error: e } = await supabase.from('avisos').insert({
      titulo: titulo.trim(), descripcion: descripcion.trim(),
      categoria, urgencia, estado: 'nuevo',
      vecino_id: user.id, edificio_id: user.edificio.id,
      proveedor_id: preProveedor || null,
    }).select().single()
    if (e) { setError('Error al enviar.'); setLoading(false); return }
    // Si vino con proveedor pre-asignado, ir al chat directo
    if (preProveedor && aviso) navigate(`/chat/${aviso.id}`)
    else navigate('/avisos')
  }

  return (
    <div className="page">
      <PalaceFrame />
      <PageHeader title="Nuevo Aviso" subtitle={preProveedorNombre ? `Para: ${preProveedorNombre}` : 'Reportar un problema'} onBack={() => navigate(-1)} />

      {preProveedorNombre && (
        <div style={{ margin: '0 20px 16px', padding: '10px 14px', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 4, height: 4, border: '1px solid rgba(217,203,176,0.4)', transform: 'rotate(45deg)', flexShrink: 0 }} />
          <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.45)', letterSpacing: '0.06em' }}>
            Este aviso será asignado a <span style={{ color: 'rgba(242,224,201,0.7)' }}>{preProveedorNombre}</span>
          </p>
        </div>
      )}

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <p style={{ fontSize: 8.5, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(160,174,192,0.28)', marginBottom: 8 }}>Título del problema</p>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej: Pérdida de agua en baño"
            style={{ width: '100%', background: 'rgba(242,224,201,0.04)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 4, padding: '12px 15px', color: '#F2E0C9', fontSize: 14 }} />
        </div>

        <div>
          <p style={{ fontSize: 8.5, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(160,174,192,0.28)', marginBottom: 8 }}>Categoría</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORIAS.map(c => (
              <button key={c} onClick={() => setCategoria(c)} style={{
                padding: '6px 13px', borderRadius: 2,
                background: categoria === c ? 'rgba(242,224,201,0.1)' : 'rgba(242,224,201,0.03)',
                border: `1px solid ${categoria === c ? 'rgba(217,203,176,0.3)' : 'rgba(217,203,176,0.08)'}`,
                color: categoria === c ? '#F2E0C9' : 'rgba(160,174,192,0.35)',
                fontSize: 10, letterSpacing: '0.06em', transition: 'all 0.2s'
              }}>{c}</button>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize: 8.5, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(160,174,192,0.28)', marginBottom: 8 }}>Urgencia</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {URGENCIAS.map(u => (
              <button key={u.value} onClick={() => setUrgencia(u.value)} style={{
                flex: 1, padding: '10px 6px', borderRadius: 4, textAlign: 'center',
                background: urgencia === u.value ? `${u.color}08` : 'rgba(242,224,201,0.02)',
                borderLeft: urgencia === u.value ? `2px solid ${u.color}60` : '2px solid rgba(217,203,176,0.06)',
                border: `1px solid ${urgencia === u.value ? `${u.color}25` : 'rgba(217,203,176,0.07)'}`,
                borderLeft: urgencia === u.value ? `2px solid ${u.color}60` : '2px solid rgba(217,203,176,0.06)',
                transition: 'all 0.2s'
              }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: urgencia === u.value ? u.color : 'rgba(160,174,192,0.35)' }}>{u.label}</p>
                <p style={{ fontSize: 9, color: 'rgba(160,174,192,0.25)', marginTop: 2 }}>{u.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize: 8.5, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(160,174,192,0.28)', marginBottom: 8 }}>
            Descripción <span style={{ color: 'rgba(160,174,192,0.15)' }}>(opcional)</span>
          </p>
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
            placeholder="Describí el problema..." rows={3}
            style={{ width: '100%', background: 'rgba(242,224,201,0.04)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 4, padding: '12px 15px', color: '#F2E0C9', fontSize: 13, resize: 'none', lineHeight: 1.5 }} />
        </div>

        {error && <p style={{ color: '#f87171', fontSize: 11 }}>{error}</p>}
        <OrnamentLine opacity={0.08} />
        <PrimaryBtn onClick={handleSubmit} disabled={loading}>{loading ? 'Enviando...' : preProveedor ? 'Enviar y abrir chat' : 'Enviar aviso'}</PrimaryBtn>
      </div>
      <BottomNav rol="vecino" />
    </div>
  )
}
