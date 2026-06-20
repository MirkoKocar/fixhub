import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, BottomNav } from '../components/Palace'

const RESPUESTAS_RAPIDAS = ['Estoy en camino', 'Lo reviso hoy', 'Necesito más información', 'Trabajo completado']

export default function Chat({ user }) {
  const { avisoId } = useParams()
  const navigate = useNavigate()
  const [aviso, setAviso] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(true)
  const [escribiendo, setEscribiendo] = useState(false)
  const [notaInterna, setNotaInterna] = useState('')
  const [showNota, setShowNota] = useState(false)
  const bottomRef = useRef(null)
  const escribiendoTimer = useRef(null)

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
        payload => { setMensajes(prev => [...prev, payload.new]); setEscribiendo(false) })
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
    await supabase.from('avisos').update({ estado: nuevoEstado }).eq('id', avisoId)
    setAviso(prev => ({ ...prev, estado: nuevoEstado }))
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p style={{ color: 'rgba(160,174,192,0.2)', fontSize: 12 }}>Cargando...</p>
    </div>
  )

  const esPropio = (msg) => msg.remitente_rol === user.rol

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <PalaceFrame />

      {/* Header */}
      <div style={{ padding: '44px 18px 12px', background: 'rgba(7,16,32,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(217,203,176,0.07)', flexShrink: 0 }}>
        <button onClick={() => navigate(-1)} style={{ color: 'rgba(160,174,192,0.28)', fontSize: 10, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8, textTransform: 'uppercase' }}>
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Volver
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="font-cormorant" style={{ fontSize: 18, color: '#F2E0C9', fontWeight: 600, lineHeight: 1.2, marginBottom: 2 }}>{aviso?.titulo}</h2>
            <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.32)' }}>
              {aviso?.vecinos?.nombre} · Depto {aviso?.vecinos?.departamento}
              {aviso?.proveedores?.nombre && ` · ${aviso.proveedores.nombre}`}
            </p>
            {/* Progress bar */}
            <div style={{ display: 'flex', gap: 3, marginTop: 8 }}>
              {['nuevo','en_curso','resuelto'].map((e, i) => {
                const idx = ['nuevo','en_curso','resuelto'].indexOf(aviso?.estado)
                return <div key={e} style={{ flex: 1, height: 2, borderRadius: 1, background: i <= idx ? (e === 'resuelto' ? 'rgba(52,211,153,0.6)' : e === 'en_curso' ? 'rgba(251,191,36,0.5)' : 'rgba(248,113,113,0.5)') : 'rgba(217,203,176,0.07)' }} />
              })}
            </div>
          </div>
          {user.rol === 'admin' && (
            <select value={aviso?.estado} onChange={e => cambiarEstado(e.target.value)}
              style={{ marginLeft: 12, background: '#0B1A2E', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 3, padding: '5px 8px', color: '#F2E0C9', fontSize: 10, letterSpacing: '0.06em', flexShrink: 0 }}>
              <option value="nuevo">Nuevo</option>
              <option value="en_curso">En curso</option>
              <option value="resuelto">Resuelto</option>
            </select>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {mensajes.length === 0 && (
          <div style={{ textAlign: 'center', margin: 'auto', color: 'rgba(160,174,192,0.2)', fontSize: 12 }}>Iniciá la conversación</div>
        )}
        {mensajes.map((m, i) => {
          const propio = esPropio(m)
          if (m.es_nota_interna && user.rol !== 'admin') return null
          return (
            <div key={m.id || i} style={{ display: 'flex', justifyContent: m.es_nota_interna ? 'center' : propio ? 'flex-end' : 'flex-start' }}>
              {m.es_nota_interna ? (
                <div style={{ padding: '6px 12px', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 4, maxWidth: '85%' }}>
                  <p style={{ fontSize: 11, color: 'rgba(251,191,36,0.6)', fontStyle: 'italic' }}>Nota interna: {m.contenido}</p>
                </div>
              ) : (
                <div style={{ maxWidth: '75%', padding: '9px 13px', borderRadius: 6, borderBottomRightRadius: propio ? 2 : 6, borderBottomLeftRadius: propio ? 6 : 2, background: propio ? 'rgba(242,224,201,0.09)' : 'rgba(242,224,201,0.03)', border: `1px solid ${propio ? 'rgba(217,203,176,0.15)' : 'rgba(217,203,176,0.06)'}` }}>
                  <p style={{ fontSize: 14, color: propio ? '#F2E0C9' : 'rgba(242,224,201,0.72)', lineHeight: 1.45 }}>{m.contenido}</p>
                  <p style={{ fontSize: 9, color: 'rgba(160,174,192,0.22)', marginTop: 3, textAlign: propio ? 'right' : 'left' }}>
                    {new Date(m.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </div>
          )
        })}
        {escribiendo && (
          <div style={{ display: 'flex', gap: 4, padding: '8px 12px', background: 'rgba(242,224,201,0.03)', border: '1px solid rgba(217,203,176,0.06)', borderRadius: 6, width: 56 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(217,203,176,0.4)', animation: `typing 1.2s ${i*0.2}s ease-in-out infinite` }} />)}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Respuestas rápidas para proveedor */}
      {user.rol === 'proveedor' && (
        <div style={{ padding: '8px 16px 0', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0 }}>
          {RESPUESTAS_RAPIDAS.map(r => (
            <button key={r} onClick={() => sendMsg(r)} style={{ padding: '5px 11px', borderRadius: 2, background: 'rgba(242,224,201,0.04)', border: '1px solid rgba(217,203,176,0.1)', color: 'rgba(217,203,176,0.45)', fontSize: 10, whiteSpace: 'nowrap', letterSpacing: '0.04em', flexShrink: 0 }}>{r}</button>
          ))}
        </div>
      )}

      {/* Nota interna admin */}
      {user.rol === 'admin' && showNota && (
        <div style={{ padding: '8px 16px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={notaInterna} onChange={e => setNotaInterna(e.target.value)} placeholder="Nota interna (solo visible para admin)..."
              style={{ flex: 1, background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 4, padding: '9px 12px', color: '#F2E0C9', fontSize: 13 }} />
            <button onClick={sendNota} style={{ padding: '9px 14px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 4, color: 'rgba(251,191,36,0.7)', fontSize: 11 }}>Guardar</button>
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '10px 15px 30px', background: 'rgba(7,16,32,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(217,203,176,0.07)', display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
        {user.rol === 'admin' && (
          <button onClick={() => setShowNota(!showNota)} style={{ width: 36, height: 36, borderRadius: 4, background: showNota ? 'rgba(251,191,36,0.1)' : 'rgba(242,224,201,0.04)', border: `1px solid ${showNota ? 'rgba(251,191,36,0.2)' : 'rgba(217,203,176,0.09)'}`, color: showNota ? 'rgba(251,191,36,0.7)' : 'rgba(160,174,192,0.3)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
        )}
        <textarea value={texto} onChange={e => setTexto(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg() } }} placeholder="Escribí un mensaje..." rows={1}
          style={{ flex: 1, background: 'rgba(242,224,201,0.05)', border: '1px solid rgba(217,203,176,0.09)', borderRadius: 5, padding: '10px 13px', color: '#F2E0C9', fontSize: 14, resize: 'none', lineHeight: 1.5, maxHeight: 90, overflowY: 'auto' }} />
        <button onClick={() => sendMsg()} style={{ width: 38, height: 38, borderRadius: 4, flexShrink: 0, background: texto.trim() ? 'rgba(242,224,201,0.88)' : 'rgba(242,224,201,0.06)', border: '1px solid rgba(217,203,176,0.1)', color: texto.trim() ? '#071020' : 'rgba(160,174,192,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
        </button>
      </div>
    </div>
  )
}
