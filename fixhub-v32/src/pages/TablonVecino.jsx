import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { PalaceFrame, PageHeader, Card, AccentCard, OrnamentLine, SectionLabel } from '../components/Palace'
import { ThumbsUp, MessageSquare, Send, X, Megaphone, Vote, Bell } from 'lucide-react'

const TIPO_CONFIG = {
  aviso:    { label:'Aviso',    color:'#E0B05E', Icon:Megaphone },
  votacion: { label:'Votación', color:'#60a5fa', Icon:Vote      },
  anuncio:  { label:'Urgente',  color:'#f87171', Icon:Bell      },
}

function ChatPrivado({ anuncioId, anuncioTitulo, user, onClose }) {
  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef               = useRef(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await supabase.from('mensajes_privados')
          .select('*').eq('vecino_id', user.id).eq('anuncio_id', anuncioId)
          .order('created_at', { ascending:true })
        setMensajes(data || [])
      } catch (err) {
        console.error('Error cargando mensajes privados:', err)
      }
    }
    fetch()
    const sub = supabase.channel(`priv-${anuncioId}-${user.id}`)
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'mensajes_privados' }, payload => {
        if (payload.new.vecino_id===user.id && payload.new.anuncio_id===anuncioId)
          setMensajes(prev=>[...prev, payload.new])
      }).subscribe()
    return () => supabase.removeChannel(sub)
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [mensajes])

  const handleSend = async () => {
    if (!texto.trim() || loading) return
    setLoading(true)
    const msg = { edificio_id:user.edificio.id, vecino_id:user.id, anuncio_id:anuncioId, autor:'vecino', contenido:texto.trim(), leido:false }
    const tempId = Date.now()
    setMensajes(prev=>[...prev, { ...msg, id:tempId, created_at:new Date().toISOString(), _temp:true }])
    setTexto('')
    try {
      const { error } = await supabase.from('mensajes_privados').insert(msg)
      if (error) throw error
      setMensajes(prev => prev.map(m => m.id === tempId ? { ...m, _temp:false } : m))
    } catch (err) {
      // Si falla el envío, se lo marcamos a la persona en vez de dejar el
      // mensaje ahí como si se hubiera mandado.
      setMensajes(prev => prev.map(m => m.id === tempId ? { ...m, _temp:false, _error:true } : m))
    }
    setLoading(false)
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)', zIndex:200, display:'flex', flexDirection:'column', maxWidth:430, margin:'0 auto' }}>
      <div style={{ padding:'44px 20px 14px', background:'var(--bg2)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div>
          <p style={{ fontSize:9, letterSpacing:'0.2em', color:'var(--gold)', textTransform:'uppercase', fontWeight:700 }}>Mensaje privado al admin</p>
          <p style={{ fontSize:13, color:'var(--text-primary)', fontWeight:700, marginTop:2 }}>{anuncioTitulo}</p>
        </div>
        <button onClick={onClose} style={{ color:'var(--text-muted)', padding:6 }}><X size={18}/></button>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:10 }}>
        {mensajes.length===0 && <p style={{ fontSize:12, color:'var(--text-faint)', textAlign:'center', padding:'30px 0' }}>Escribile al administrador.</p>}
        {mensajes.map(m => (
          <div key={m.id} style={{ display:'flex', justifyContent:m.autor==='vecino'?'flex-end':'flex-start' }}>
            <div onClick={() => m._error && setTexto(m.contenido)} className={m.autor==='vecino'?'chat-mine':'chat-other'} style={{ maxWidth:'75%', padding:'10px 14px', borderRadius:m.autor==='vecino'?'18px 18px 4px 18px':'18px 18px 18px 4px', opacity:m._temp?0.7:1, border:m._error?'1px solid rgba(248,113,113,0.6)':'none', cursor:m._error?'pointer':'default' }}>
              {m.autor==='admin' && <p style={{ fontSize:8, fontWeight:700, color:'rgba(224,176,94,0.7)', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.1em' }}>Admin</p>}
              <p style={{ fontSize:13, lineHeight:1.5 }}>{m.contenido}</p>
              {m._error && <p style={{ fontSize:9.5, color:'#f87171', fontWeight:700, marginTop:4 }}>⚠️ No se envió — tocá para reintentar</p>}
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>
      <div className="chat-input-bar" style={{ padding:'12px 16px', borderTop:'1px solid var(--border)', display:'flex', gap:10, flexShrink:0, paddingBottom:'max(12px,env(safe-area-inset-bottom))' }}>
        <input value={texto} onChange={e=>setTexto(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&handleSend()} placeholder="Escribile al admin..." style={{ flex:1, background:'var(--input-bg)', border:'1px solid var(--input-border)', borderRadius:999, padding:'10px 16px', color:'var(--text-primary)', fontSize:13, fontFamily:"'DM Sans',sans-serif" }}/>
        <button onClick={handleSend} disabled={loading||!texto.trim()} style={{ width:42, height:42, borderRadius:'50%', background:texto.trim()?'linear-gradient(135deg,#E0B05E,#C9923A)':'var(--bg-card)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Send size={16} color={texto.trim()?'#0A1428':'var(--text-faint)'} strokeWidth={2}/>
        </button>
      </div>
    </div>
  )
}

export default function TablonVecino({ user }) {
  const [anuncios, setAnuncios]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [reacciones, setReacciones] = useState({})
  const [conteos, setConteos]     = useState({})
  const [misVotos, setMisVotos]   = useState({})
  const [conteoVotos, setConteoVotos] = useState({})
  const [chatAnuncio, setChatAnuncio] = useState(null)

  const cargar = async () => {
    setLoading(true); setErrorCarga('')
    try {
      const { data:anns, error: eAnn } = await supabase.from('anuncios').select('*')
        .eq('edificio_id', user.edificio.id)
        .lte('fecha_publicacion', new Date().toISOString())
        .order('fecha_publicacion', { ascending:false })
      if (eAnn) throw eAnn

      if (anns?.length) {
        const ids = anns.map(a=>a.id)
        const [{ data:reacs, error: eR }, { data:votes, error: eV }] = await Promise.all([
          supabase.from('reacciones_anuncio').select('anuncio_id,vecino_id').in('anuncio_id', ids),
          supabase.from('votos_tablon').select('anuncio_id,vecino_id,opcion').in('anuncio_id', ids),
        ])
        if (eR || eV) throw (eR || eV)
        const misR={}, cuentasR={}, misV={}, cuentasV={}
        reacs?.forEach(r => {
          cuentasR[r.anuncio_id]=(cuentasR[r.anuncio_id]||0)+1
          if (r.vecino_id===user.id) misR[r.anuncio_id]=true
        })
        votes?.forEach(v => {
          if (!cuentasV[v.anuncio_id]) cuentasV[v.anuncio_id]={}
          cuentasV[v.anuncio_id][v.opcion]=(cuentasV[v.anuncio_id][v.opcion]||0)+1
          if (v.vecino_id===user.id) misV[v.anuncio_id]=v.opcion
        })
        setReacciones(misR); setConteos(cuentasR)
        setMisVotos(misV);   setConteoVotos(cuentasV)
      }
      setAnuncios(anns||[])
    } catch (err) {
      setErrorCarga('No se pudo cargar el tablón. Revisá tu conexión.')
    }
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const toggleReaccion = async (anuncioId) => {
    const ya = reacciones[anuncioId]
    setReacciones(p=>({...p,[anuncioId]:!ya}))
    setConteos(p=>({...p,[anuncioId]:(p[anuncioId]||0)+(ya?-1:1)}))
    try {
      const { error } = ya
        ? await supabase.from('reacciones_anuncio').delete().eq('anuncio_id',anuncioId).eq('vecino_id',user.id)
        : await supabase.from('reacciones_anuncio').insert({ anuncio_id:anuncioId, vecino_id:user.id, tipo:'like' })
      if (error) throw error
    } catch (err) {
      // Revertimos el cambio visual si no se pudo guardar de verdad
      setReacciones(p=>({...p,[anuncioId]:ya}))
      setConteos(p=>({...p,[anuncioId]:(p[anuncioId]||0)+(ya?1:-1)}))
    }
  }

  const votar = async (anuncioId, opcion) => {
    if (misVotos[anuncioId]) return // ya votó
    setMisVotos(p=>({...p,[anuncioId]:opcion}))
    setConteoVotos(p=>({ ...p, [anuncioId]:{ ...(p[anuncioId]||{}), [opcion]:((p[anuncioId]?.[opcion])||0)+1 } }))
    try {
      const { error } = await supabase.from('votos_tablon').insert({ anuncio_id:anuncioId, vecino_id:user.id, opcion })
      if (error) throw error
    } catch (err) {
      // Revertir: el voto no se guardó, dejar que lo vuelva a intentar
      setMisVotos(p=>{ const c={...p}; delete c[anuncioId]; return c })
      setConteoVotos(p=>({ ...p, [anuncioId]:{ ...(p[anuncioId]||{}), [opcion]:Math.max(0,((p[anuncioId]?.[opcion])||1)-1) } }))
    }
  }

  const formatFechaHora = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('es-AR',{day:'numeric',month:'short'}) + ' ' +
           d.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})
  }

  return (
    <div className="page page-enter">
      <PalaceFrame />
      {chatAnuncio && <ChatPrivado anuncioId={chatAnuncio.id} anuncioTitulo={chatAnuncio.titulo} user={user} onClose={()=>setChatAnuncio(null)}/>}
      <PageHeader title="Tablón" subtitle="Novedades del edificio"/>
      <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:14 }}>

        {loading && [1,2].map(i=>(
          <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:18, padding:'18px 16px' }}>
            <div className="skeleton" style={{ height:12, width:'60%', marginBottom:10 }}/>
            <div className="skeleton" style={{ height:10, width:'80%' }}/>
          </div>
        ))}

        {!loading && errorCarga && (
          <Card style={{ textAlign:'center', padding:'40px 20px' }}>
            <p style={{ fontSize:13, color:'var(--red)', fontWeight:600 }}>{errorCarga}</p>
            <button onClick={cargar} style={{ marginTop:14, fontSize:12, fontWeight:700, color:'#E0B05E', padding:'8px 18px', background:'rgba(224,176,94,0.1)', borderRadius:999 }}>Reintentar</button>
          </Card>
        )}

        {!loading && !errorCarga && anuncios.length===0 && (
          <Card style={{ textAlign:'center', padding:'40px 20px' }}>
            <Megaphone size={32} color="var(--text-faint)" strokeWidth={1} style={{ margin:'0 auto 12px' }}/>
            <p style={{ fontSize:14, color:'var(--text-muted)', fontWeight:600 }}>Sin publicaciones por ahora</p>
            <p style={{ fontSize:11, color:'var(--text-faint)', marginTop:6 }}>El administrador publicará avisos y votaciones acá.</p>
          </Card>
        )}

        {!loading && anuncios.map(a => {
          const cfg = TIPO_CONFIG[a.tipo] || TIPO_CONFIG.aviso
          const reacciono = reacciones[a.id]
          const conteo    = conteos[a.id]||0
          const miVoto    = misVotos[a.id]
          const votosCuenta = conteoVotos[a.id]||{}
          const totalVotos  = Object.values(votosCuenta).reduce((s,v)=>s+v,0)

          return (
            <div key={a.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderLeft:`3px solid ${cfg.color}60`, borderRadius:18, padding:'16px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:16, right:16, height:1, background:`linear-gradient(to right,transparent,${cfg.color}15,transparent)` }}/>

              {/* Header */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <cfg.Icon size={12} color={cfg.color} strokeWidth={1.8}/>
                  <span style={{ fontSize:8.5, fontWeight:700, color:cfg.color, letterSpacing:'0.08em', textTransform:'uppercase' }}>{cfg.label}</span>
                </div>
                <span style={{ fontSize:9, color:'var(--text-faint)' }}>{formatFechaHora(a.created_at)}</span>
              </div>

              <p style={{ fontSize:14, color:'var(--text-primary)', fontWeight:700, marginBottom:a.contenido?6:12, lineHeight:1.3 }}>{a.titulo}</p>
              {a.contenido && <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.6, marginBottom:12 }}>{a.contenido}</p>}

              {/* Votación */}
              {a.tipo==='votacion' && a.opciones_votacion && (
                <div style={{ marginBottom:12 }}>
                  <OrnamentLine opacity={0.08}/>
                  <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:12 }}>
                    {a.opciones_votacion.map((op, i) => {
                      const votos = votosCuenta[op]||0
                      const pct   = totalVotos>0 ? Math.round((votos/totalVotos)*100) : 0
                      const elegida = miVoto===op
                      return (
                        <button key={i} onClick={() => votar(a.id, op)} disabled={!!miVoto}
                          style={{ width:'100%', padding:'11px 14px', borderRadius:12, textAlign:'left', background: elegida?'rgba(96,165,250,0.1)':'var(--cat-bg)', border:`1px solid ${elegida?'rgba(96,165,250,0.35)':'var(--cat-border)'}`, cursor:miVoto?'default':'pointer', position:'relative', overflow:'hidden' }}>
                          {miVoto && <div style={{ position:'absolute', left:0, top:0, bottom:0, width:`${pct}%`, background:'rgba(96,165,250,0.06)', transition:'width 0.5s' }}/>}
                          <div style={{ position:'relative', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <p style={{ fontSize:12, fontWeight:700, color:elegida?'#60a5fa':'var(--text-secondary)' }}>{op}</p>
                            {miVoto && <p style={{ fontSize:10, fontWeight:700, color:'rgba(96,165,250,0.6)' }}>{pct}% · {votos}</p>}
                          </div>
                        </button>
                      )
                    })}
                    {miVoto && <p style={{ fontSize:9.5, color:'var(--text-faint)', textAlign:'center', fontWeight:500 }}>Votaste: <span style={{ color:'#60a5fa', fontWeight:700 }}>{miVoto}</span> · {totalVotos} votos totales</p>}
                    {!miVoto && <p style={{ fontSize:9.5, color:'var(--text-faint)', textAlign:'center' }}>Tocá una opción para votar</p>}
                  </div>
                </div>
              )}

              <OrnamentLine opacity={0.06}/>

              {/* Acciones */}
              <div style={{ display:'flex', gap:10, marginTop:12 }}>
                {a.tipo !== 'votacion' && (
                  <button onClick={()=>toggleReaccion(a.id)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:999, background:reacciono?'rgba(52,211,153,0.1)':'var(--bg-card)', border:`1px solid ${reacciono?'rgba(52,211,153,0.35)':'var(--border)'}`, transition:'all 0.2s' }}>
                    <ThumbsUp size={14} color={reacciono?'#34d399':'var(--text-muted)'} strokeWidth={reacciono?2:1.5} fill={reacciono?'rgba(52,211,153,0.3)':'none'}/>
                    {conteo>0 && <span style={{ fontSize:11, fontWeight:700, color:reacciono?'#34d399':'var(--text-muted)' }}>{conteo}</span>}
                  </button>
                )}
                <button onClick={()=>setChatAnuncio(a)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:999, background:'var(--gold-faint)', border:'1px solid rgba(224,176,94,0.2)', flex:1, justifyContent:'center' }}>
                  <MessageSquare size={14} color="var(--gold)" strokeWidth={1.5}/>
                  <span style={{ fontSize:11, fontWeight:700, color:'var(--gold)' }}>Responder en privado</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
