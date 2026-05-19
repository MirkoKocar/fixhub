import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import BottomNav from '../components/BottomNav'

const estadoColor = { nuevo: '#ff6b4a', en_curso: '#ffc800', resuelto: '#00e5a0' }
const estadoLabel = { nuevo: 'NUEVO', en_curso: 'EN CURSO', resuelto: 'RESUELTO' }
const rubroIcon = { Plomería: '🚿', Electricidad: '💡', Cerrajería: '🔒', Gas: '🌡️', Estructura: '🏗️', Otro: '📦' }

export default function Home({ vecino, onLogout }) {
  const navigate = useNavigate()
  const [avisos, setAvisos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAvisos = async () => {
      const { data } = await supabase
        .from('avisos')
        .select('*')
        .eq('vecino_id', vecino.id)
        .order('created_at', { ascending: false })
        .limit(5)
      setAvisos(data || [])
      setLoading(false)
    }
    fetchAvisos()

    // Tiempo real
    const sub = supabase
      .channel('avisos_home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'avisos', filter: `vecino_id=eq.${vecino.id}` }, fetchAvisos)
      .subscribe()
    return () => supabase.removeChannel(sub)
  }, [vecino.id])

  const abiertos = avisos.filter(a => a.estado !== 'resuelto').length

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '56px 24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Buen día, {vecino.nombre.split(' ')[0]} 👋</p>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, lineHeight: 1.1, marginTop: 4 }}>
            Tu edificio,<br /><span style={{ color: 'var(--accent)' }}>sin drama.</span>
          </h1>
        </div>
        <button onClick={onLogout} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '6px 10px', fontSize: 12, color: 'var(--muted)' }}>Salir</button>
      </div>

      {/* Edificio card */}
      <div style={{ margin: '0 20px 24px', background: 'linear-gradient(135deg, #1e3a2f, #0f2a20)', borderRadius: 20, padding: 20, border: '1px solid rgba(0,229,160,0.15)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: 16, top: 12, fontSize: 48, opacity: 0.12 }}>🏢</div>
        <p style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tu edificio</p>
        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, margin: '4px 0 2px' }}>{vecino.edificio.nombre}</p>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Depto {vecino.departamento}</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          {abiertos > 0
            ? <div style={{ background: 'rgba(255,107,74,0.12)', border: '1px solid rgba(255,107,74,0.2)', borderRadius: 10, padding: '6px 12px', fontSize: 12, color: 'var(--accent2)', fontWeight: 500 }}>{abiertos} aviso{abiertos > 1 ? 's' : ''} abierto{abiertos > 1 ? 's' : ''}</div>
            : <div style={{ background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 10, padding: '6px 12px', fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>Todo en orden ✓</div>
          }
        </div>
      </div>

      {/* Acciones rápidas */}
      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, padding: '0 24px 12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>¿Qué necesitás?</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px 24px' }}>
        {[
          { icon: '🔧', label: 'Reportar problema', sub: 'Plomería, electricidad…', path: '/aviso', highlight: true },
          { icon: '📋', label: 'Proveedores', sub: 'Contactos del edificio', path: '/proveedores' },
          { icon: '📢', label: 'Tablón', sub: 'Avisos del edificio', path: '/avisos' },
          { icon: '⚙️', label: 'Administrador', sub: 'Panel de gestión', path: '/admin' },
        ].map(item => (
          <button key={item.path} onClick={() => navigate(item.path)} style={{
            background: item.highlight ? 'linear-gradient(135deg, rgba(0,229,160,0.12), rgba(0,229,160,0.05))' : 'var(--surface2)',
            border: `1px solid ${item.highlight ? 'rgba(0,229,160,0.25)' : 'var(--border)'}`,
            borderRadius: 18, padding: '18px 16px', textAlign: 'left', transition: 'transform 0.15s'
          }}>
            <span style={{ fontSize: 26, marginBottom: 10, display: 'block' }}>{item.icon}</span>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{item.label}</p>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{item.sub}</p>
          </button>
        ))}
      </div>

      {/* Mis avisos recientes */}
      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, padding: '0 24px 12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mis avisos recientes</p>
      <div style={{ padding: '0 20px' }}>
        {loading && <p style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', padding: 20 }}>Cargando...</p>}
        {!loading && avisos.length === 0 && (
          <div style={{ background: 'var(--surface2)', borderRadius: 14, padding: 20, textAlign: 'center', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 24, marginBottom: 8 }}>✨</p>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Sin avisos todavía. ¡Todo bien!</p>
          </div>
        )}
        {avisos.map(aviso => (
          <div key={aviso.id} style={{ background: 'var(--surface2)', borderRadius: 14, padding: '14px 16px', marginBottom: 10, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `rgba(${aviso.estado === 'nuevo' ? '255,107,74' : aviso.estado === 'en_curso' ? '255,200,0' : '0,229,160'},0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              {rubroIcon[aviso.rubro] || '📦'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{aviso.descripcion}</p>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{aviso.rubro} · {new Date(aviso.created_at).toLocaleDateString('es-AR')}</p>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 6, background: `rgba(${aviso.estado === 'nuevo' ? '255,107,74' : aviso.estado === 'en_curso' ? '255,200,0' : '0,229,160'},0.12)`, color: estadoColor[aviso.estado], flexShrink: 0 }}>
              {estadoLabel[aviso.estado]}
            </span>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
