// HomeProveedor.jsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { OrnamentLine, SectionTitle, Card, PrimaryBtn, GhostBtn } from '../components/Palace'

export function HomeProveedor({ user, onLogout }) {
  const [disponible, setDisponible] = useState(user.disponible)
  const [mensajes, setMensajes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('mensajes').select('*, vecinos(nombre, departamento)').eq('proveedor_id', user.id).order('created_at', { ascending: false })
      setMensajes(data || [])
      setLoading(false)
    }
    fetch()
  }, [user.id])

  const toggleDisponible = async () => {
    const nuevo = !disponible
    await supabase.from('proveedores').update({ disponible: nuevo }).eq('id', user.id)
    setDisponible(nuevo)
  }

  return (
    <div style={{ paddingBottom: 60 }}>
      <div style={{ padding: '52px 24px 24px', textAlign: 'center' }}>
        <p className="font-cormorant animate-ornament" style={{ color: '#D9CBB0', fontSize: 11, letterSpacing: '0.5em', marginBottom: 14 }}>✦ ✦ ✦</p>
        <h1 className="font-cormorant" style={{ fontSize: 30, fontWeight: 700, color: '#F2E0C9', marginBottom: 4 }}>{user.nombre}</h1>
        <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.5)', letterSpacing: '0.06em' }}>{user.rubro} · {user.edificio.nombre}</p>
        <div style={{ marginTop: 16 }}><OrnamentLine /></div>
      </div>

      <div style={{ padding: '0 20px 24px' }}>
        <Card style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Estado actual</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: disponible ? '#34d399' : '#6b7280', boxShadow: disponible ? '0 0 8px #34d399' : 'none' }} />
            <span className="font-cormorant" style={{ fontSize: 20, color: '#F2E0C9' }}>{disponible ? 'Disponible' : 'No disponible'}</span>
          </div>
          <PrimaryBtn onClick={toggleDisponible} style={{ fontSize: 15 }}>
            {disponible ? 'Marcarme como ocupado' : 'Marcarme como disponible'}
          </PrimaryBtn>
        </Card>
      </div>

      <div style={{ padding: '0 20px' }}>
        <SectionTitle>Mensajes recibidos</SectionTitle>
        <div style={{ height: 12 }} />
        {loading && <p style={{ color: 'rgba(160,174,192,0.4)', fontSize: 13, textAlign: 'center', padding: 20 }}>Cargando...</p>}
        {!loading && mensajes.length === 0 && (
          <Card><p style={{ color: 'rgba(160,174,192,0.4)', fontSize: 13, textAlign: 'center', padding: 8 }}>Sin mensajes todavía.</p></Card>
        )}
        {mensajes.map(m => (
          <Card key={m.id} style={{ marginBottom: 8 }}>
            <p className="font-cormorant" style={{ fontSize: 16, color: '#F2E0C9' }}>{m.contenido}</p>
            <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.4)', marginTop: 4 }}>
              {m.vecinos ? `Depto ${m.vecinos.departamento} · ${m.vecinos.nombre}` : ''} · {new Date(m.created_at).toLocaleDateString('es-AR')}
            </p>
          </Card>
        ))}
      </div>

      <div style={{ padding: '24px 20px 0', textAlign: 'center' }}>
        <button onClick={onLogout} style={{ background: 'none', color: 'rgba(160,174,192,0.25)', fontSize: 11, letterSpacing: '0.1em' }}>Cerrar sesión</button>
      </div>
    </div>
  )
}
export default HomeProveedor;
