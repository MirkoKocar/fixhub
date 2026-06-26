import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, PageHeader, PrimaryBtn, OrnamentLine, BottomNav, SectionLabel, AccentCard } from '../components/Palace'

const CATEGORIAS = ['Plomería','Electricidad','Gas','Ascensor','Limpieza','Seguridad','Estructura','Internet','Otro']
const URGENCIAS = [
  { value:'baja', label:'Baja', desc:'Puede esperar', color:'#34d399' },
  { value:'media', label:'Media', desc:'Esta semana', color:'#fbbf24' },
  { value:'alta', label:'Alta', desc:'Emergencia', color:'#f87171' },
]

export default function NuevoAviso({ user }) {
  const navigate = useNavigate()
  const location = useLocation()
  const preProveedor = location.state?.proveedor_id
  const preProveedorNombre = location.state?.proveedor_nombre

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState(location.state?.categoria || '')
  const [urgencia, setUrgencia] = useState('media')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const inputStyle = { width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(217,203,176,0.12)', borderRadius:14, padding:'12px 16px', color:'#F2E0C9', fontSize:14, fontFamily:"'DM Sans',sans-serif" }

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
    if (preProveedor && aviso) navigate(`/chat/${aviso.id}`, { state: { mensajeInicial: titulo } })
    else navigate('/avisos')
  }

  return (
    <div className="page">
      <PalaceFrame />
      <PageHeader title="Nuevo Aviso" subtitle={preProveedorNombre ? `Para: ${preProveedorNombre}` : 'Reportar un problema'} onBack={() => navigate(-1)} />

      {preProveedorNombre && (
        <div style={{margin:'0 20px 16px',padding:'11px 16px',background:'rgba(224,176,94,0.06)',border:'1px solid rgba(224,176,94,0.18)',borderRadius:14,display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:6,height:6,border:'1px solid rgba(224,176,94,0.5)',transform:'rotate(45deg)',flexShrink:0}}/>
          <p style={{fontSize:11,color:'rgba(180,190,205,0.5)'}}>Asignado a <span style={{color:'rgba(224,176,94,0.8)',fontWeight:600}}>{preProveedorNombre}</span></p>
        </div>
      )}

      <div style={{padding:'0 20px',display:'flex',flexDirection:'column',gap:16}}>
        <div>
          <SectionLabel style={{marginBottom:8}}>Título del problema</SectionLabel>
          <input value={titulo} onChange={e=>setTitulo(e.target.value)} placeholder="Ej: Pérdida de agua en baño" style={inputStyle}/>
        </div>
        <div>
          <SectionLabel style={{marginBottom:9}}>Categoría</SectionLabel>
          <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
            {CATEGORIAS.map(c=>(
              <button key={c} onClick={()=>setCategoria(c)} style={{padding:'7px 14px',borderRadius:999,background:categoria===c?'rgba(224,176,94,0.15)':'rgba(255,255,255,0.03)',border:`1px solid ${categoria===c?'rgba(224,176,94,0.4)':'rgba(217,203,176,0.1)'}`,color:categoria===c?'#E0B05E':'rgba(180,190,205,0.45)',fontSize:11,fontWeight:600,transition:'all 0.2s'}}>{c}</button>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel style={{marginBottom:9}}>Urgencia</SectionLabel>
          <div style={{display:'flex',gap:8}}>
            {URGENCIAS.map(u=>(
              <button key={u.value} onClick={()=>setUrgencia(u.value)} style={{flex:1,padding:'11px 6px',borderRadius:14,textAlign:'center',background:urgencia===u.value?`${u.color}0C`:'rgba(255,255,255,0.02)',border:`1px solid ${urgencia===u.value?u.color+'35':'rgba(217,203,176,0.08)'}`,transition:'all 0.2s',borderTop:urgencia===u.value?`3px solid ${u.color}60`:'3px solid transparent'}}>
                <p style={{fontSize:12,fontWeight:700,color:urgencia===u.value?u.color:'rgba(180,190,205,0.4)'}}>{u.label}</p>
                <p style={{fontSize:9,color:'rgba(180,190,205,0.28)',marginTop:2}}>{u.desc}</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel style={{marginBottom:8}}>Descripción <span style={{color:'rgba(180,190,205,0.2)',fontWeight:400,textTransform:'none',letterSpacing:0}}>(opcional)</span></SectionLabel>
          <textarea value={descripcion} onChange={e=>setDescripcion(e.target.value)} placeholder="Describí el problema con más detalle..." rows={3} style={{...inputStyle,resize:'none',lineHeight:1.5,borderRadius:14}}/>
        </div>
        {error&&<p style={{color:'#f87171',fontSize:11,fontWeight:500}}>{error}</p>}
        <OrnamentLine opacity={0.08}/>
        <PrimaryBtn onClick={handleSubmit} disabled={loading}>{loading?'Enviando...':(preProveedor?'Enviar y abrir chat':'Enviar aviso')}</PrimaryBtn>
      </div>
      <BottomNav rol="vecino"/>
    </div>
  )
}
