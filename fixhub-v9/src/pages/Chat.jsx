import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, BottomNav } from '../components/Palace'

const RESPUESTAS_RAPIDAS = ['Estoy en camino', 'Lo reviso hoy', 'Necesito más información', 'Trabajo completado']

export default function Chat({ user }) {
  const { avisoId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [aviso, setAviso] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto] = useState(location.state?.mensajeInicial || '')
  const [loading, setLoading] = useState(true)
  const [showNota, setShowNota] = useState(false)
  const [notaInterna, setNotaInterna] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: av } = await supabase.from('avisos').select('*, proveedores(*), vecinos(nombre,departamento)').eq('id', avisoId).single()
      setAviso(av)
      const { data: msgs } = await supabase.from('mensajes').select('*').eq('aviso_id', avisoId).order('created_at', { ascending: true })
      setMensajes(msgs || [])
      setLoading(false)
    }
    fetchData()

    const channel = supabase.channel(`chat-${avisoId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes', filter: `aviso_id=eq.${avisoId}` },
        payload => setMensajes(prev => [...prev, payload.new]))
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [avisoId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [mensajes])

  const sendMsg = async (contenidoOverride) => {
    const contenido = contenidoOverride || texto.trim()
    if (!contenido) return
    setTexto('')
    await supabase.from('mensajes').insert({
      aviso_id: avisoId, contenido,
      remitente_rol: user.rol, remitente_id: user.id,
      vecino_id: aviso?.vecino_id, proveedor_id: aviso?.proveedor_id,
      es_nota_interna: false,
    })
  }

  const sendNota = async () => {
    if (!notaInterna.trim()) return
    await supabase.from('mensajes').insert({
      aviso_id: avisoId, contenido: notaInterna.trim(),
      remitente_rol: 'admin', remitente_id: user.id,
      es_nota_interna: true,
    })
    setNotaInterna(''); setShowNota(false)
  }

  const cambiarEstado = async (nuevoEstado) => {
    await supabase.from('avisos').update({ estado: nuevoEstado, updated_at: new Date().toISOString() }).eq('id', avisoId)
    setAviso(prev => ({ ...prev, estado: nuevoEstado }))
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <p style={{ color:'rgba(180,190,205,0.2)', fontSize:12 }}>Cargando...</p>
    </div>
  )

  const esPropio = (msg) => msg.remitente_rol === user.rol
  const stateIdx = ['nuevo','en_curso','resuelto'].indexOf(aviso?.estado)

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100dvh' }}>
      <PalaceFrame />

      {/* Header */}
      <div style={{ padding:'44px 18px 12px', background:'rgba(10,20,40,0.97)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(217,203,176,0.07)', flexShrink:0 }}>
        <button onClick={() => navigate(-1)} style={{ color:'rgba(180,190,205,0.35)', fontSize:10, letterSpacing:'0.08em', display:'flex', alignItems:'center', gap:5, marginBottom:8, textTransform:'uppercase', fontWeight:600, background:'rgba(255,255,255,0.04)', padding:'6px 12px', borderRadius:999, border:'1px solid rgba(217,203,176,0.1)' }}>
          <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Volver
        </button>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div style={{ flex:1, minWidth:0 }}>
            <h2 className="font-serif" style={{ fontSize:18, color:'#F2E0C9', lineHeight:1.2, marginBottom:2 }}>{aviso?.titulo}</h2>
            <p style={{ fontSize:10, color:'rgba(180,190,205,0.32)', fontWeight:500 }}>
              {aviso?.vecinos?.nombre} · Depto {aviso?.vecinos?.departamento}
              {aviso?.proveedores?.nombre && ` · ${aviso.proveedores.nombre}`}
            </p>
            {/* Progress bar */}
            <div style={{ display:'flex', gap:3, marginTop:8 }}>
              {['nuevo','en_curso','resuelto'].map((e, i) => (
                <div key={e} style={{ flex:1, height:3, borderRadius:999, background:i<=stateIdx?(e==='resuelto'?'rgba(52,211,153,0.65)':e==='en_curso'?'rgba(251,191,36,0.6)':'rgba(248,113,113,0.55)'):'rgba(255,255,255,0.06)', transition:'background 0.3s' }}/>
              ))}
            </div>
          </div>
          {user.rol === 'admin' && (
            <select value={aviso?.estado} onChange={e => cambiarEstado(e.target.value)}
              style={{ marginLeft:10, background:'#11203B', border:'1px solid rgba(217,203,176,0.12)', borderRadius:10, padding:'6px 10px', color:'#F2E0C9', fontSize:10, fontWeight:600, letterSpacing:'0.04em', flexShrink:0 }}>
              <option value="nuevo">Nuevo</option>
              <option value="en_curso">En curso</option>
              <option value="resuelto">Resuelto</option>
            </select>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'14px 18px', display:'flex', flexDirection:'column', gap:9 }}>
        {mensajes.length === 0 && (
          <div style={{ textAlign:'center', margin:'auto', color:'rgba(180,190,205,0.2)', fontSize:12 }}>Iniciá la conversación</div>
        )}
        {mensajes.map((m, i) => {
          const propio = esPropio(m)
          if (m.es_nota_interna && user.rol !== 'admin') return null
          return (
            <div key={m.id || i} style={{ display:'flex', justifyContent:m.es_nota_interna?'center':propio?'flex-end':'flex-start' }}>
              {m.es_nota_interna ? (
                <div style={{ padding:'6px 14px', background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.15)', borderRadius:10, maxWidth:'85%' }}>
                  <p style={{ fontSize:11, color:'rgba(251,191,36,0.6)', fontStyle:'italic' }}>Nota interna: {m.contenido}</p>
                </div>
              ) : (
                <div style={{ maxWidth:'76%', padding:'10px 14px', borderRadius:16, borderBottomRightRadius:propio?4:16, borderBottomLeftRadius:propio?16:4, background:propio?'rgba(224,176,94,0.1)':'rgba(255,255,255,0.04)', border:`1px solid ${propio?'rgba(224,176,94,0.18)':'rgba(217,203,176,0.07)'}` }}>
                  <p style={{ fontSize:14, color:propio?'#F2E0C9':'rgba(242,224,201,0.72)', lineHeight:1.45, fontWeight:500 }}>{m.contenido}</p>
                  <p style={{ fontSize:9, color:'rgba(180,190,205,0.22)', marginTop:4, textAlign:propio?'right':'left' }}>
                    {new Date(m.created_at).toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' })}
                  </p>
                </div>
              )}
            </div>
          )
        })}
        <div ref={bottomRef}/>
      </div>

      {/* Respuestas rápidas proveedor */}
      {user.rol === 'proveedor' && (
        <div style={{ padding:'8px 16px 0', display:'flex', gap:7, overflowX:'auto', flexShrink:0 }}>
          {RESPUESTAS_RAPIDAS.map(r => (
            <button key={r} onClick={() => sendMsg(r)} style={{ padding:'6px 14px', borderRadius:999, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(217,203,176,0.1)', color:'rgba(217,203,176,0.5)', fontSize:10, whiteSpace:'nowrap', fontWeight:600, letterSpacing:'0.04em', flexShrink:0 }}>{r}</button>
          ))}
        </div>
      )}

      {/* Nota interna admin */}
      {user.rol === 'admin' && showNota && (
        <div style={{ padding:'8px 16px 0', flexShrink:0 }}>
          <div style={{ display:'flex', gap:8 }}>
            <input value={notaInterna} onChange={e => setNotaInterna(e.target.value)} placeholder="Nota interna (solo visible para admin)..."
              style={{ flex:1, background:'rgba(251,191,36,0.05)', border:'1px solid rgba(251,191,36,0.18)', borderRadius:12, padding:'10px 14px', color:'#F2E0C9', fontSize:13, fontFamily:"'DM Sans',sans-serif" }}/>
            <button onClick={sendNota} style={{ padding:'10px 16px', background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.22)', borderRadius:12, color:'rgba(251,191,36,0.75)', fontSize:11, fontWeight:700 }}>Guardar</button>
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ padding:'10px 15px 30px', background:'rgba(10,20,40,0.97)', backdropFilter:'blur(20px)', borderTop:'1px solid rgba(217,203,176,0.07)', display:'flex', gap:8, alignItems:'flex-end', flexShrink:0 }}>
        {user.rol === 'admin' && (
          <button onClick={() => setShowNota(!showNota)} style={{ width:38, height:38, borderRadius:12, background:showNota?'rgba(251,191,36,0.12)':'rgba(255,255,255,0.04)', border:`1px solid ${showNota?'rgba(251,191,36,0.25)':'rgba(217,203,176,0.1)'}`, color:showNota?'rgba(251,191,36,0.7)':'rgba(180,190,205,0.3)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
        )}
        <textarea value={texto} onChange={e => setTexto(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg() } }} placeholder="Escribí un mensaje..." rows={1}
          style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(217,203,176,0.1)', borderRadius:14, padding:'11px 14px', color:'#F2E0C9', fontSize:14, resize:'none', lineHeight:1.5, maxHeight:90, overflowY:'auto', fontFamily:"'DM Sans',sans-serif" }}/>
        <button onClick={() => sendMsg()} style={{ width:40, height:40, borderRadius:13, flexShrink:0, background:texto.trim()?'linear-gradient(135deg,#E0B05E,#C9923A)':'rgba(255,255,255,0.05)', border:'1px solid rgba(217,203,176,0.1)', color:texto.trim()?'#0A1428':'rgba(180,190,205,0.25)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:texto.trim()?'0 2px 12px rgba(224,176,94,0.28)':'none', transition:'all 0.2s' }}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
        </button>
      </div>
    </div>
  )
}
