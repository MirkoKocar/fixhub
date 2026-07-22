import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, PageHeader, PrimaryBtn, OrnamentLine, BottomNav, SectionLabel, AccentCard, Card } from '../components/Palace'

const CATEGORIAS = ['Plomería','Electricidad','Gas','Ascensor','Limpieza','Seguridad','Estructura','Internet','Otro']
const URGENCIAS = [
  { value:'baja', label:'Baja', desc:'Puede esperar', color:'#34d399' },
  { value:'media', label:'Media', desc:'Esta semana', color:'#fbbf24' },
  { value:'alta', label:'Alta', desc:'Emergencia', color:'#f87171' },
]

// Step 2: elegir proveedor
function ElegirProveedor({ edificioId, categoria, onSelect }) {
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('proveedores').select('*')
        .eq('edificio_id', edificioId)
        .eq('especialidad', categoria)
        .order('ranking', { ascending: false })
      setProveedores(data || [])
      setLoading(false)
    }
    fetch()
  }, [edificioId, categoria])

  function DiamondRating({ valor }) {
    const stars = Math.max(1, Math.round((valor / 100) * 5))
    return (
      <div style={{ display: 'flex', gap: 4 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ width: 6, height: 6, transform: 'rotate(45deg)', background: i <= stars ? 'rgba(224,176,94,0.7)' : 'transparent', border: `1px solid ${i <= stars ? 'rgba(224,176,94,0.5)' : 'rgba(217,203,176,0.15)'}` }}/>
        ))}
      </div>
    )
  }

  if (loading) return <p style={{ textAlign: 'center', color: 'rgba(180,190,205,0.3)', padding: '30px 0', fontSize: 12 }}>Buscando proveedores...</p>

  if (proveedores.length === 0) return (
    <Card style={{ textAlign: 'center', padding: '24px' }}>
      <p style={{ fontSize: 13, color: 'rgba(180,190,205,0.35)', fontWeight: 500 }}>No hay proveedores disponibles para {categoria}.</p>
      <p style={{ fontSize: 11, color: 'rgba(180,190,205,0.25)', marginTop: 6 }}>El administrador recibirá tu aviso y asignará uno.</p>
    </Card>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <SectionLabel style={{ marginBottom: 2 }}>Elegí un proveedor de {categoria}</SectionLabel>
      <p style={{ fontSize: 10, color: 'rgba(180,190,205,0.28)', marginBottom: 6, fontWeight: 400 }}>Ordenados por preferencia del edificio. No se muestran datos de contacto.</p>
      {proveedores.map(p => (
        <AccentCard key={p.id} accentColor={p.disponible ? 'rgba(52,211,153,0.4)' : 'rgba(217,203,176,0.1)'} onClick={() => p.disponible && onSelect(p)}
          style={{ opacity: p.disponible ? 1 : 0.5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 14, color: 'rgba(242,224,201,0.9)', fontWeight: 700 }}>{p.nombre}</p>
              <div style={{ marginTop: 5 }}><DiamondRating valor={p.ranking || 50} /></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: p.disponible ? '#34d399' : '#f87171', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {p.disponible ? 'Disponible' : 'Ocupado'}
              </span>
              {p.disponible && (
                <p style={{ fontSize: 10, color: 'rgba(224,176,94,0.6)', marginTop: 4, fontWeight: 600 }}>Tocar para contactar →</p>
              )}
            </div>
          </div>
        </AccentCard>
      ))}
    </div>
  )
}

export default function NuevoAviso({ user }) {
  const navigate = useNavigate()
  const location = useLocation()
  const preCategoria = location.state?.categoria || ''
  const preProveedor = location.state?.proveedor_id
  const preProveedorNombre = location.state?.proveedor_nombre
  const tituloSugerido = location.state?.tituloSugerido || ''

  const [titulo, setTitulo] = useState(tituloSugerido)
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState(preCategoria)
  const [urgencia, setUrgencia] = useState('media')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1=form, 2=elegir proveedor
  const [avisoCreado, setAvisoCreado] = useState(null)

  const esOtro = categoria === 'Otro'

  const inputStyle = { width:'100%', background:'var(--input-bg)', border:'1px solid var(--input-border)', borderRadius:14, padding:'12px 16px', color:'var(--input-color)', fontSize:14, fontFamily:"'DM Sans',sans-serif" }

  const handleSubmit = async () => {
    if (!titulo.trim()) { setError('Agregá un título.'); return }
    if (!categoria) { setError('Elegí una categoría.'); return }
    if (esOtro && !descripcion.trim()) { setError('Para "Otro" es obligatorio describir el problema.'); return }
    setLoading(true); setError('')

    const { data: aviso, error: e } = await supabase.from('avisos').insert({
      titulo: titulo.trim(), descripcion: descripcion.trim(),
      categoria, urgencia, estado: 'nuevo',
      vecino_id: user.id, edificio_id: user.edificio.id,
      proveedor_id: preProveedor || null,
    }).select().single()

    if (e) { setError('Error al enviar.'); setLoading(false); return }
    setLoading(false)

    if (esOtro) {
      navigate('/avisos')
    } else {
      setAvisoCreado(aviso)
      setStep(2)
    }
  }

  const handleSelectProveedor = async (prov) => {
    await supabase.from('avisos').update({ proveedor_id: prov.id }).eq('id', avisoCreado.id)
    navigate(`/chat/${avisoCreado.id}`, { state: { mensajeInicial: titulo } })
  }

  const handleSinProveedor = () => navigate('/avisos')

  return (
    <div className="page">
      <PalaceFrame />
      <PageHeader
        title={step === 1 ? 'Nuevo Aviso' : 'Elegí un proveedor'}
        subtitle={step === 1 ? (preProveedorNombre ? `Para: ${preProveedorNombre}` : 'Reportar un problema') : categoria}
        onBack={() => step === 2 ? setStep(1) : navigate(-1)}
      />

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {step === 1 && (
          <>
            {preProveedorNombre && (
              <div style={{ padding: '11px 16px', background: 'rgba(224,176,94,0.06)', border: '1px solid rgba(224,176,94,0.18)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 6, height: 6, border: '1px solid rgba(224,176,94,0.5)', transform: 'rotate(45deg)', flexShrink: 0 }}/>
                <p style={{ fontSize: 11, color: 'rgba(180,190,205,0.5)', fontWeight: 500 }}>Asignado a <span style={{ color: 'rgba(224,176,94,0.8)', fontWeight: 700 }}>{preProveedorNombre}</span></p>
              </div>
            )}

            <div>
              <SectionLabel style={{ marginBottom: 8 }}>Título del problema</SectionLabel>
              <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej: Pérdida de agua en baño" style={inputStyle}/>
            </div>

            <div>
              <SectionLabel style={{ marginBottom: 10 }}>Categoría</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {CATEGORIAS.map(c => (
                  <button key={c} onClick={() => setCategoria(c)} style={{
                    padding: '10px 8px', borderRadius: 12, textAlign: 'center',
                    background: categoria === c ? 'var(--gold-faint)' : 'var(--cat-bg)',
                    border: `1px solid ${categoria === c ? 'rgba(224,176,94,0.4)' : 'var(--cat-border)'}`,
                    color: categoria === c ? 'var(--gold)' : 'var(--cat-color)',
                    fontSize: 12, fontWeight: 700, transition: 'all 0.2s',
                    borderTop: categoria === c ? '2px solid rgba(224,176,94,0.5)' : '2px solid transparent'
                  }}>{c}</button>
                ))}
              </div>
              {esOtro && (
                <p style={{ fontSize: 10, color: 'rgba(251,191,36,0.6)', marginTop: 8, fontWeight: 600 }}>
                  ⚠ Tu aviso irá directo al administrador, quien buscará el servicio adecuado.
                </p>
              )}
            </div>

            <div>
              <SectionLabel style={{ marginBottom: 9 }}>Urgencia</SectionLabel>
              <div style={{ display: 'flex', gap: 8 }}>
                {URGENCIAS.map(u => (
                  <button key={u.value} onClick={() => setUrgencia(u.value)} style={{
                    flex: 1, padding: '12px 6px', borderRadius: 14, textAlign: 'center',
                    background: urgencia === u.value ? `${u.color}12` : 'var(--cat-bg)',
                    border: `1px solid ${urgencia === u.value ? u.color+'35' : 'var(--cat-border)'}`,
                    borderTop: urgencia === u.value ? `3px solid ${u.color}60` : '3px solid transparent',
                    transition: 'all 0.2s'
                  }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: urgencia === u.value ? u.color : 'var(--cat-color)' }}>{u.label}</p>
                    <p style={{ fontSize: 9, color: 'var(--text-faint)', marginTop: 2 }}>{u.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <SectionLabel style={{ marginBottom: 8 }}>
                Descripción {esOtro ? <span style={{ color: '#f87171', fontWeight: 700 }}> *obligatorio</span> : <span style={{ color: 'rgba(180,190,205,0.2)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>}
              </SectionLabel>
              <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder={esOtro ? 'Describí el problema en detalle para que el admin pueda ayudarte...' : 'Describí el problema...'} rows={3} style={{ ...inputStyle, resize: 'none', lineHeight: 1.5, borderRadius: 14 }}/>
            </div>

            {error && <p style={{ color: '#f87171', fontSize: 11, fontWeight: 600 }}>{error}</p>}
            <OrnamentLine opacity={0.08}/>
            <PrimaryBtn onClick={handleSubmit} disabled={loading}>
              {loading ? 'Enviando...' : esOtro ? 'Enviar al administrador' : 'Continuar'}
            </PrimaryBtn>
          </>
        )}

        {step === 2 && avisoCreado && (
          <>
            <ElegirProveedor edificioId={user.edificio.id} categoria={categoria} onSelect={handleSelectProveedor} />
            <OrnamentLine opacity={0.08}/>
            <button onClick={handleSinProveedor} style={{ fontSize: 11, color: 'rgba(180,190,205,0.28)', textAlign: 'center', padding: '8px', fontWeight: 600, letterSpacing: '0.06em' }}>
              Continuar sin proveedor por ahora →
            </button>
          </>
        )}
      </div>
      <BottomNav rol="vecino"/>
    </div>
  )
}
