// Proveedores.jsx
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { OrnamentLine, SectionTitle, Card, BottomNav } from '../components/Palace'

export function Proveedores({ user }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [proveedores, setProveedores] = useState([])
  const [filtro, setFiltro] = useState(location.state?.rubro || 'Todos')
  const [loading, setLoading] = useState(true)
  const rubros = ['Todos', 'Plomería', 'Electricidad', 'Cerrajería', 'Gas', 'Estructura', 'Jardinería', 'Limpieza', 'Otro']

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('proveedores').select('*').eq('edificio_id', user.edificio.id).order('nombre')
      setProveedores(data || [])
      setLoading(false)
    }
    fetch()
  }, [user.edificio.id])

  const filtrados = proveedores.filter(p => filtro === 'Todos' || p.rubro === filtro)

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: '52px 24px 24px', textAlign: 'center' }}>
        <h1 className="font-cormorant" style={{ fontSize: 30, fontWeight: 700, color: '#F2E0C9', marginBottom: 6 }}>Proveedores</h1>
        <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.5)' }}>{user.edificio.nombre}</p>
        <div style={{ marginTop: 16 }}><OrnamentLine /></div>
      </div>

      <div style={{ display: 'flex', gap: 6, padding: '0 20px 20px', overflowX: 'auto' }}>
        {rubros.map(r => (
          <button key={r} onClick={() => setFiltro(r)} style={{ background: filtro === r ? 'rgba(242,224,201,0.1)' : 'transparent', border: `1px solid ${filtro === r ? 'rgba(217,203,176,0.25)' : 'rgba(217,203,176,0.08)'}`, borderRadius: 20, padding: '6px 14px', fontSize: 11, color: filtro === r ? '#F2E0C9' : 'rgba(160,174,192,0.4)', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', transition: 'all 0.15s' }}>{r}</button>
        ))}
      </div>

      <div style={{ padding: '0 20px' }}>
        {loading && <p style={{ color: 'rgba(160,174,192,0.4)', textAlign: 'center', padding: 20 }}>Cargando...</p>}
        {filtrados.map(p => (
          <Card key={p.id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <p className="font-cormorant" style={{ fontSize: 17, color: '#F2E0C9', fontWeight: 600 }}>{p.nombre}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                <span style={{ fontSize: 11, color: 'rgba(160,174,192,0.5)' }}>{p.rubro}</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(160,174,192,0.3)' }} />
                <span style={{ fontSize: 11, color: p.disponible ? '#34d399' : 'rgba(160,174,192,0.35)', fontWeight: 500 }}>{p.disponible ? 'Disponible' : 'No disponible'}</span>
              </div>
            </div>
            {p.disponible && (
              <button onClick={() => navigate(`/chat/${p.id}`, { state: { proveedor: p } })} style={{ background: 'rgba(242,224,201,0.08)', border: '1px solid rgba(217,203,176,0.15)', borderRadius: 10, padding: '8px 14px', fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: '#F2E0C9' }}>
                Escribir
              </button>
            )}
          </Card>
        ))}
      </div>
      <BottomNav rol="vecino" />
    </div>
  )
}

// Avisos.jsx
export function Avisos({ user }) {
  const [avisos, setAvisos] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('mis')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      let q = supabase.from('avisos').select('*, vecinos(nombre, departamento)').order('created_at', { ascending: false })
      if (tab === 'mis') q = q.eq('vecino_id', user.id)
      else q = q.eq('edificio_id', user.edificio.id)
      const { data } = await q
      setAvisos(data || [])
      setLoading(false)
    }
    fetch()
  }, [tab])

  const estadoColor = { nuevo: '#f87171', en_curso: '#fbbf24', resuelto: '#34d399' }
  const estadoLabel = { nuevo: 'Nuevo', en_curso: 'En curso', resuelto: 'Resuelto' }

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: '52px 24px 24px', textAlign: 'center' }}>
        <h1 className="font-cormorant" style={{ fontSize: 30, fontWeight: 700, color: '#F2E0C9', marginBottom: 6 }}>Avisos</h1>
        <div style={{ marginTop: 12 }}><OrnamentLine /></div>
      </div>

      <div style={{ display: 'flex', margin: '0 20px 20px', background: 'rgba(242,224,201,0.03)', border: '1px solid rgba(217,203,176,0.08)', borderRadius: 10, padding: 4 }}>
        {[{ k: 'mis', l: 'Mis avisos' }, { k: 'todos', l: 'Todo el edificio' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ flex: 1, padding: '9px', borderRadius: 7, fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 600, background: tab === t.k ? 'rgba(242,224,201,0.08)' : 'none', color: tab === t.k ? '#F2E0C9' : 'rgba(160,174,192,0.4)', border: tab === t.k ? '1px solid rgba(217,203,176,0.15)' : '1px solid transparent', transition: 'all 0.2s' }}>{t.l}</button>
        ))}
      </div>

      <div style={{ padding: '0 20px' }}>
        {loading && <p style={{ color: 'rgba(160,174,192,0.4)', textAlign: 'center', padding: 20 }}>Cargando...</p>}
        {avisos.map(a => (
          <Card key={a.id} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
              <p className="font-cormorant" style={{ fontSize: 15, color: '#F2E0C9', flex: 1, lineHeight: 1.3 }}>{a.descripcion}</p>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: `${estadoColor[a.estado]}12`, color: estadoColor[a.estado], flexShrink: 0, height: 'fit-content' }}>{estadoLabel[a.estado]}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(160,174,192,0.35)', paddingTop: 8, borderTop: '1px solid rgba(217,203,176,0.06)' }}>
              <span>{a.rubro}</span>
              <span>{new Date(a.created_at).toLocaleDateString('es-AR')}</span>
            </div>
          </Card>
        ))}
      </div>
      <BottomNav rol="vecino" />
    </div>
  )
}

// Chat.jsx
export function Chat({ user }) {
  const location = useLocation()
  const navigate = useNavigate()
  const proveedor = location.state?.proveedor
  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!proveedor) return
    const fetch = async () => {
      const { data } = await supabase.from('mensajes').select('*').eq('vecino_id', user.id).eq('proveedor_id', proveedor.id).order('created_at')
      setMensajes(data || [])
      setLoading(false)
    }
    fetch()
    const sub = supabase.channel('chat').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes' }, payload => {
      setMensajes(prev => [...prev, payload.new])
    }).subscribe()
    return () => supabase.removeChannel(sub)
  }, [proveedor?.id, user.id])

  const enviar = async () => {
    if (!texto.trim() || !proveedor) return
    const msg = { contenido: texto.trim(), vecino_id: user.id, proveedor_id: proveedor.id, enviado_por: 'vecino' }
    setTexto('')
    await supabase.from('mensajes').insert(msg)
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '52px 20px 16px', borderBottom: '1px solid rgba(217,203,176,0.08)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(242,224,201,0.05)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 8, padding: '8px 12px', color: 'rgba(160,174,192,0.5)', fontSize: 13 }}>←</button>
        <div>
          <p className="font-cormorant" style={{ fontSize: 18, color: '#F2E0C9', fontWeight: 600 }}>{proveedor?.nombre || 'Chat'}</p>
          <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.4)' }}>{proveedor?.rubro}</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mensajes.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.enviado_por === 'vecino' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '75%', background: m.enviado_por === 'vecino' ? 'rgba(242,224,201,0.1)' : 'rgba(242,224,201,0.05)', border: `1px solid ${m.enviado_por === 'vecino' ? 'rgba(217,203,176,0.2)' : 'rgba(217,203,176,0.08)'}`, borderRadius: 12, padding: '10px 14px' }}>
              <p style={{ fontSize: 14, color: '#F2E0C9', lineHeight: 1.4 }}>{m.contenido}</p>
              <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.35)', marginTop: 4 }}>{new Date(m.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 20px 32px', borderTop: '1px solid rgba(217,203,176,0.08)', display: 'flex', gap: 10 }}>
        <input value={texto} onChange={e => setTexto(e.target.value)} onKeyDown={e => e.key === 'Enter' && enviar()} placeholder="Escribí tu mensaje..."
          style={{ flex: 1, background: 'rgba(242,224,201,0.06)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 12, padding: '12px 16px', color: '#F2E0C9', fontSize: 14, fontFamily: 'inherit' }} />
        <button onClick={enviar} style={{ background: 'rgba(242,224,201,0.9)', border: 'none', borderRadius: 12, padding: '12px 18px', color: '#071424', fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 700 }}>
          Enviar
        </button>
      </div>
    </div>
  )
}
