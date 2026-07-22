import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, PageHeader, Card, StatusBadge, UrgenciaBadge, BottomNav } from '../components/Palace'

const ESTADOS = ['Todos', 'Nuevo', 'En curso', 'Resuelto']
const estadoMap = { 'Nuevo': 'nuevo', 'En curso': 'en_curso', 'Resuelto': 'resuelto' }

export default function AdminAvisos({ user }) {
  const navigate = useNavigate()
  const [avisos, setAvisos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('Todos')

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('avisos').select('*, vecinos(nombre, departamento)')
        .eq('edificio_id', user.edificio.id).order('created_at', { ascending: false })
      setAvisos(data || [])
      setLoading(false)
    }
    fetch()
  }, [user.edificio.id])

  const filtrados = filtro === 'Todos' ? avisos : avisos.filter(a => a.estado === estadoMap[filtro])

  const cambiarEstado = async (avisoId, nuevoEstado, e) => {
    e.stopPropagation()
    await supabase.from('avisos').update({ estado: nuevoEstado }).eq('id', avisoId)
    setAvisos(prev => prev.map(a => a.id === avisoId ? { ...a, estado: nuevoEstado } : a))
  }

  return (
    <div className="page">
      <PalaceFrame />
      <PageHeader title="Avisos" subtitle="Gestión de reportes" onBack={() => navigate('/')} />

      {/* Filtros */}
      <div style={{ padding: '0 20px 20px', display: 'flex', gap: 7, overflowX: 'auto' }}>
        {ESTADOS.map(f => (
          <button key={f} onClick={() => setFiltro(f)} style={{
            padding: '6px 14px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0,
            background: filtro === f ? 'var(--gold-faint)' : 'transparent',
            border: `1px solid ${filtro === f ? 'var(--border)' : 'var(--border)'}`,
            color: filtro === f ? 'var(--text-primary)' : 'var(--text-faint)',
            fontSize: 10, letterSpacing: '0.05em', transition: 'all 0.2s'
          }}>{f}</button>
        ))}
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-faint)', fontSize: 12, padding: '30px 0' }}>Cargando...</p>
        ) : filtrados.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '32px 16px' }}>
            <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>Sin avisos</p>
          </Card>
        ) : (
          filtrados.map(a => (
            <Card key={a.id} onClick={() => navigate(`/admin/aviso/${a.id}`)} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.3 }}>{a.titulo}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 2 }}>
                    {a.vecinos?.nombre} · Depto {a.vecinos?.departamento}
                  </p>
                </div>
                <StatusBadge estado={a.estado} />
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>{a.categoria}</span>
                  {a.urgencia && <UrgenciaBadge urgencia={a.urgencia} />}
                </div>
                {/* Quick estado change */}
                <div style={{ display: 'flex', gap: 4 }}>
                  {['nuevo','en_curso','resuelto'].filter(e => e !== a.estado).map(est => (
                    <button key={est} onClick={(ev) => cambiarEstado(a.id, est, ev)} style={{
                      fontSize: 8, padding: '3px 8px', borderRadius: 10, letterSpacing: '0.05em',
                      background: 'var(--border)', border: '1px solid var(--border)',
                      color: 'var(--text-faint)', textTransform: 'uppercase'
                    }}>
                      → {est.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
