import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, ChevronLeft, Send, Check, Phone, X } from '../components/Palace'

const RESPUESTAS_RAPIDAS = ['Estoy en camino','Lo reviso hoy','Necesito más información','Trabajo completado']

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
  const [showWhatsapp, setShowWhatsapp] = useState(false)
  const [showCall, setShowCall] = useState(false)
  const bottomRef = useRef(null)
  const channelRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: av } = await supabase.from('avisos').select('*, proveedores(*), vecinos(nombre,departamento)').eq('id', avisoId).single()
      setAviso(av)
      const { data: msgs } = await supabase.from('mensajes').select('*').eq('aviso_id', avisoId).order('created_at', { ascending: true })
      setMensajes(msgs || [])
      setLoading(false)
    }
    fetchData()

    channelRef.current = supabase.channel(`chat-${avisoId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes', filter: `aviso_id=eq.${avisoId}` },
        payload => {
          setMensajes(prev => {
            if (prev.find(m => m.id === payload.new.id)) return prev
            // Reemplaza optimistic si existe
            const filtered = prev.filter(m => !m._temp || m.contenido !== payload.new.contenido)
            return [...filtered, payload.new]
          })
        })
      .subscribe()

    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [avisoId])

  // Alert timers
  useEffect(() => {
    if (user.rol !== 'vecino') return
    const t1 = setTimeout(() => setShowWhatsapp(true), 10 * 60 * 1000)
    const t2 = setTimeout(() => setShowCall(true), 25 * 60 * 1000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [user.rol])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [mensajes])

  const sendMsg = useCallback(async (contenidoOverride) => {
    const contenido = contenidoOverride || texto.trim()
    if (!contenido) return
    setTexto('')

    // Optimistic update — aparece INMEDIATAMENTE
    const tempId = `temp-${Date.now()}`
    const tempMsg = {
      id: tempId, aviso_id: avisoId, contenido,
      remitente_rol: user.rol, remitente_id: user.id,
      vecino_id: aviso?.vecino_id, proveedor_id: aviso?.proveedor_id,
      es_nota_interna: false, created_at: new Date().toISOString(), _temp: true
    }
    setMensajes(prev => [...prev, tempMsg])
    if (navigator.vibrate) navigator.vibrate(40)

    const { data: saved } = await supabase.from('mensajes').insert({
      aviso_id: avisoId, contenido, remitente_rol: user.rol,
      remitente_id: user.id, vecino_id: aviso?.vecino_id,
      proveedor_id: aviso?.proveedor_id, es_nota_interna: false,
    }).select().single()

    if (saved) setMensajes(prev => prev.map(m => m.id === tempId ? saved : m))
  }, [texto, avisoId, user, aviso])

  const sendNota = async () => {
    if (!notaInterna.trim()) return
    await supabase.from('mensajes').insert({ aviso_id: avisoId, contenido: notaInterna.trim(), remitente_rol: 'admin', remitente_id: user.id, es_nota_interna: true })
    setNotaInterna(''); setShowNota(false)
  }

  const cambiarEstado = async (nuevoEstado) => {
    await supabase.from('avisos').update({ estado: nuevoEstado, updated_at: new Date().toISOString() }).eq('id', avisoId)
    setAviso(prev => ({ ...prev, estado: nuevoEstado }))
  }

  const abrirWhatsApp = () => {
    const tel = aviso?.proveedores?.telefono
    if (!tel) return
    const msg = encodeURIComponent(`Hola, te escribo desde FixHub sobre el aviso: "${aviso?.titulo}". Necesito una respuesta.`)
    window.open(`https://wa.me/${tel}?text=${msg}`, '_blank')
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0A1428' }}>
      <p style={{ color:'var(--text-faint)', fontSize:12 }}>Cargando...</p>
    </div>
  )

  const esPropio = (msg) => msg.remitente_rol === user.rol
  const stateIdx = ['nuevo','en_curso','resuelto'].indexOf(aviso?.estado)

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100dvh', background:'#0A1428', maxWidth:430, margin:'0 auto' }}>
      <PalaceFrame />

      {/* Header */}
      <div style={{ padding:'44px 18px 12px', background:'rgba(10,20,40,0.97)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <button onClick={() => navigate(-1)} style={{ color:'var(--text-muted)', fontSize:10, letterSpacing:'0.08em', display:'flex', alignItems:'center', gap:5, marginBottom:8, textTransform:'uppercase', fontWeight:600, background:'var(--bg-card)', padding:'6px 12px', borderRadius:999, border:'1px solid var(--border)' }}>
          <ChevronLeft size={13}/> Volver
        </button>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div style={{ flex:1, minWidth:0 }}>
            <h2 className="font-serif" style={{ fontSize:17, color:'var(--text-primary)', lineHeight:1.2, marginBottom:2 }}>{aviso?.titulo}</h2>
            <p style={{ fontSize:10, color:'var(--text-muted)', fontWeight:500 }}>
              {aviso?.vecinos?.nombre} · Depto {aviso?.vecinos?.departamento}
              {aviso?.proveedores?.nombre && ` · ${aviso.proveedores.nombre}`}
            </p>
            <div style={{ display:'flex', gap:3, marginTop:7 }}>
              {['nuevo','en_curso','resuelto'].map((e,i) => (
                <div key={e} style={{ flex:1, height:3, borderRadius:999, background:i<=stateIdx?(e==='resuelto'?'rgba(52,211,153,0.65)':e==='en_curso'?'rgba(251,191,36,0.6)':'rgba(248,113,113,0.55)'):'rgba(255,255,255,0.06)', transition:'background 0.3s' }}/>
              ))}
            </div>
          </div>
          {user.rol === 'admin' && (
            <select value={aviso?.estado} onChange={e => cambiarEstado(e.target.value)}
              style={{ marginLeft:10, background:'#11203B', border:'1px solid var(--border)', borderRadius:10, padding:'6px 10px', color:'var(--text-primary)', fontSize:10, fontWeight:600, flexShrink:0 }}>
              <option value="nuevo">Nuevo</option>
              <option value="en_curso">En curso</option>
              <option value="resuelto">Resuelto</option>
            </select>
          )}
        </div>
      </div>

      {/* Alert banners */}
      {showWhatsapp && user.rol === 'vecino' && aviso?.proveedores?.telefono && (
        <div style={{ background:'rgba(251,191,36,0.08)', borderBottom:'1px solid rgba(251,191,36,0.18)', padding:'10px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <p style={{ fontSize:11, color:'rgba(251,191,36,0.8)', fontWeight:600 }}>Sin respuesta. ¿Alertar por WhatsApp?</p>
          <button onClick={abrirWhatsApp} style={{ fontSize:10, color:'rgba(251,191,36,0.9)', fontWeight:700, padding:'5px 12px', border:'1px solid rgba(251,191,36,0.3)', borderRadius:999, background:'rgba(251,191,36,0.1)', flexShrink:0, marginLeft:10 }}>Alertar</button>
        </div>
      )}
      {showCall && user.rol === 'vecino' && aviso?.proveedores?.telefono && (
        <div style={{ background:'rgba(248,113,113,0.08)', borderBottom:'1px solid rgba(248,113,113,0.18)', padding:'10px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <p style={{ fontSize:11, color:'rgba(248,113,113,0.8)', fontWeight:600 }}>Urgente — sin respuesta por 25 min.</p>
          <a href={`tel:${aviso.proveedores.telefono}`} style={{ fontSize:10, color:'#f87171', fontWeight:700, padding:'5px 12px', border:'1px solid rgba(248,113,113,0.3)', borderRadius:999, background:'rgba(248,113,113,0.1)', flexShrink:0, marginLeft:10, textDecoration:'none', display:'flex', alignItems:'center', gap:5 }}>
            <Phone size={11}/> Llamar
          </a>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'14px 18px', display:'flex', flexDirection:'column', gap:8 }}>
        {mensajes.length === 0 && !loading && (
          <div style={{ textAlign:'center', margin:'auto', color:'var(--text-faint)', fontSize:12 }}>Iniciá la conversación</div>
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
                <div style={{ maxWidth:'76%', padding:'10px 14px', borderRadius:16, borderBottomRightRadius:propio?4:16, borderBottomLeftRadius:propio?16:4, background:propio?'rgba(224,176,94,0.12)':'var(--bg-card)', border:`1px solid ${propio?'rgba(224,176,94,0.2)':'var(--border)'}`, opacity:m._temp?0.7:1, transition:'opacity 0.2s' }}>
                  <p style={{ fontSize:14, color:propio?'var(--text-primary)':'var(--text-secondary)', lineHeight:1.45, fontWeight:500 }}>{m.contenido}</p>
                  <div style={{ display:'flex', justifyContent:propio?'flex-end':'flex-start', alignItems:'center', gap:4, marginTop:3 }}>
                    <p style={{ fontSize:9, color:'var(--text-faint)' }}>{new Date(m.created_at).toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' })}</p>
                    {propio && !m._temp && <Check size={10} color="var(--text-muted)" strokeWidth={2}/>}
                  </div>
                </div>
              )}
            </div>
          )
        })}
        <div ref={bottomRef} style={{ height:1 }}/>
      </div>

      {/* Respuestas rápidas proveedor */}
      {user.rol === 'proveedor' && (
        <div style={{ padding:'8px 16px 0', display:'flex', gap:7, overflowX:'auto', flexShrink:0 }}>
          {RESPUESTAS_RAPIDAS.map(r => (
            <button key={r} onClick={() => sendMsg(r)} style={{ padding:'6px 14px', borderRadius:999, background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--border)', fontSize:10, whiteSpace:'nowrap', fontWeight:600, flexShrink:0 }}>{r}</button>
          ))}
        </div>
      )}

      {/* Nota interna admin */}
      {user.rol === 'admin' && showNota && (
        <div style={{ padding:'8px 16px 0', flexShrink:0 }}>
          <div style={{ display:'flex', gap:8 }}>
            <input value={notaInterna} onChange={e => setNotaInterna(e.target.value)} placeholder="Nota interna..."
              style={{ flex:1, background:'rgba(251,191,36,0.05)', border:'1px solid rgba(251,191,36,0.18)', borderRadius:12, padding:'10px 14px', color:'var(--text-primary)', fontSize:13, fontFamily:"'DM Sans',sans-serif" }}/>
            <button onClick={sendNota} style={{ padding:'10px 16px', background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.22)', borderRadius:12, color:'rgba(251,191,36,0.75)', fontSize:11, fontWeight:700 }}>Guardar</button>
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ padding:'10px 15px 20px', background:'rgba(10,20,40,0.97)', backdropFilter:'blur(20px)', borderTop:'1px solid var(--border)', display:'flex', gap:8, alignItems:'flex-end', flexShrink:0 }}>
        {user.rol === 'admin' && (
          <button onClick={() => setShowNota(!showNota)} style={{ width:38, height:38, borderRadius:12, background:showNota?'rgba(251,191,36,0.12)':'var(--bg-card)', border:`1px solid ${showNota?'rgba(251,191,36,0.25)':'var(--border)'}`, color:showNota?'rgba(251,191,36,0.7)':'var(--text-muted)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>✎</button>
        )}
        <textarea value={texto} onChange={e => setTexto(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg() } }} placeholder="Escribí un mensaje..." rows={1}
          style={{ flex:1, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'11px 14px', color:'var(--text-primary)', fontSize:14, resize:'none', lineHeight:1.5, maxHeight:90, overflowY:'auto', fontFamily:"'DM Sans',sans-serif" }}/>
        <button onClick={() => sendMsg()} disabled={!texto.trim()} style={{ width:40, height:40, borderRadius:13, flexShrink:0, background:texto.trim()?'linear-gradient(135deg,#E0B05E,#C9923A)':'var(--bg-card)', border:'1px solid var(--border)', color:texto.trim()?'#0A1428':'var(--text-faint)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:texto.trim()?'0 2px 12px rgba(224,176,94,0.28)':'none', transition:'all 0.2s' }}>
          <Send size={15} strokeWidth={2}/>
        </button>
      </div>
    </div>
  )
}
