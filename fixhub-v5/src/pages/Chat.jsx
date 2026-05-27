import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, BottomNav } from '../components/Palace'

export default function Chat({ user }) {
  const { avisoId } = useParams()
  const navigate = useNavigate()
  const [aviso, setAviso] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: av } = await supabase.from('avisos').select('*, proveedores(*)').eq('id', avisoId).single()
      setAviso(av)
      const { data: msgs } = await supabase.from('mensajes').select('*')
        .eq('aviso_id', avisoId).order('created_at', { ascending: true })
      setMensajes(msgs || [])
      setLoading(false)
    }
    fetchData()

    // Realtime subscription filtrada por aviso_id
    const channel = supabase.channel(`chat-${avisoId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'mensajes',
        filter: `aviso_id=eq.${avisoId}`
      }, payload => {
        setMensajes(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [avisoId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const sendMsg = async () => {
    if (!texto.trim()) return
    const msg = {
      aviso_id: avisoId,
      contenido: texto.trim(),
      remitente_rol: user.rol,
      remitente_id: user.id,
      vecino_id: aviso?.vecino_id,
      proveedor_id: aviso?.proveedor_id,
      created_at: new Date().toISOString(),
    }
    setTexto('')
    await supabase.from('mensajes').insert(msg)
  }

  const esPropio = (msg) => msg.remitente_rol === user.rol

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p style={{ color: 'rgba(160,174,192,0.3)', fontSize: 12 }}>Cargando chat...</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <PalaceFrame />

      {/* Header */}
      <div style={{
        padding: '48px 20px 14px',
        background: 'rgba(7,16,32,0.97)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(217,203,176,0.07)',
        flexShrink: 0
      }}>
        <button onClick={() => navigate(-1)} style={{ color: 'rgba(160,174,192,0.35)', fontSize: 11, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        <h2 className="font-cormorant" style={{ fontSize: 20, color: '#F2E0C9', fontWeight: 600, lineHeight: 1.2 }}>
          {aviso?.titulo || 'Chat'}
        </h2>
        <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'rgba(160,174,192,0.35)' }}>{aviso?.categoria}</span>
          {aviso?.proveedores?.nombre && (
            <><span style={{ color: 'rgba(160,174,192,0.2)', fontSize: 10 }}>·</span>
            <span style={{ fontSize: 10, color: 'rgba(160,174,192,0.4)' }}>{aviso.proveedores.nombre}</span></>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mensajes.length === 0 && (
          <div style={{ textAlign: 'center', margin: 'auto', color: 'rgba(160,174,192,0.25)', fontSize: 12 }}>
            <p>Iniciá la conversación</p>
          </div>
        )}
        {mensajes.map((m, i) => {
          const propio = esPropio(m)
          return (
            <div key={m.id || i} style={{ display: 'flex', justifyContent: propio ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%', padding: '10px 14px', borderRadius: 14,
                borderBottomRightRadius: propio ? 4 : 14,
                borderBottomLeftRadius: propio ? 14 : 4,
                background: propio ? 'rgba(242,224,201,0.1)' : 'rgba(242,224,201,0.04)',
                border: `1px solid ${propio ? 'rgba(217,203,176,0.18)' : 'rgba(217,203,176,0.07)'}`,
              }}>
                <p style={{ fontSize: 14, color: propio ? '#F2E0C9' : 'rgba(242,224,201,0.75)', lineHeight: 1.45 }}>{m.contenido}</p>
                <p style={{ fontSize: 9, color: 'rgba(160,174,192,0.25)', marginTop: 4, textAlign: propio ? 'right' : 'left' }}>
                  {new Date(m.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px 34px',
        background: 'rgba(7,16,32,0.97)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(217,203,176,0.07)',
        display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0
      }}>
        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg() } }}
          placeholder="Escribí un mensaje..."
          rows={1}
          style={{
            flex: 1, background: 'rgba(242,224,201,0.06)', border: '1px solid rgba(217,203,176,0.1)',
            borderRadius: 12, padding: '11px 14px', color: '#F2E0C9', fontSize: 14,
            resize: 'none', lineHeight: 1.5, maxHeight: 100, overflowY: 'auto'
          }}
        />
        <button onClick={sendMsg} style={{
          width: 42, height: 42, borderRadius: 11, flexShrink: 0,
          background: texto.trim() ? 'rgba(242,224,201,0.88)' : 'rgba(242,224,201,0.08)',
          border: '1px solid rgba(217,203,176,0.15)',
          color: texto.trim() ? '#071020' : 'rgba(160,174,192,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s'
        }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  )
}
