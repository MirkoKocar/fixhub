import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, PageHeader, Card, PrimaryBtn, BottomNav } from '../components/Palace'

export default function AdminProveedores({ user }) {
  const navigate = useNavigate()
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [especialidad, setEspecialidad] = useState('')
  const [telefono, setTelefono] = useState('')
  const [saving, setSaving] = useState(false)

  const ESPECIALIDADES = ['Plomería','Electricidad','Gas','Ascensor','Limpieza','Seguridad','Estructura','Internet','Otro']

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('proveedores').select('*')
        .eq('edificio_id', user.edificio.id).order('ranking', { ascending: false })
      setProveedores(data || [])
      setLoading(false)
    }
    fetch()
  }, [user.edificio.id])

  const agregar = async () => {
    if (!nombre.trim() || !especialidad) return
    setSaving(true)
    const { data } = await supabase.from('proveedores').insert({
      nombre: nombre.trim(), especialidad, telefono: telefono.trim(),
      edificio_id: user.edificio.id, disponible: true, ranking: 50
    }).select().single()
    if (data) setProveedores(prev => [...prev, data])
    setNombre(''); setEspecialidad(''); setTelefono(''); setShowForm(false); setSaving(false)
  }

  const cambiarRanking = async (id, delta) => {
    const p = proveedores.find(p => p.id === id)
    const nuevo = Math.max(0, Math.min(100, (p.ranking || 50) + delta))
    await supabase.from('proveedores').update({ ranking: nuevo }).eq('id', id)
    setProveedores(prev => prev.map(p => p.id === id ? { ...p, ranking: nuevo } : p)
      .sort((a, b) => (b.ranking || 0) - (a.ranking || 0)))
  }

  const eliminar = async (id) => {
    await supabase.from('proveedores').delete().eq('id', id)
    setProveedores(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="page">
      <PalaceFrame />
      <PageHeader title="Proveedores" subtitle="Gestión y rankings" onBack={() => navigate('/')} extra={
        <button onClick={() => setShowForm(!showForm)} style={{
          marginTop: 10, padding: '7px 18px', borderRadius: 20,
          background: 'var(--input-bg)', border: '1px solid var(--border)',
          color: '#D9CBB0', fontSize: 11, letterSpacing: '0.06em'
        }}>
          {showForm ? 'Cancelar' : '+ Agregar proveedor'}
        </button>
      } />

      {showForm && (
        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Card style={{ padding: '16px' }}>
            <p className="font-cormorant" style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 12 }}>Nuevo proveedor</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre completo"
                style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text-primary)', fontSize: 14 }} />
              <select value={especialidad} onChange={e => setEspecialidad(e.target.value)}
                style={{ width: '100%', background: '#0B1A2E', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: especialidad ? 'var(--text-primary)' : 'var(--text-faint)', fontSize: 14 }}>
                <option value="">Especialidad...</option>
                {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Teléfono (opcional)"
                style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text-primary)', fontSize: 14 }} />
              <PrimaryBtn onClick={agregar} disabled={saving}>{saving ? 'Guardando...' : 'Agregar'}</PrimaryBtn>
            </div>
          </Card>
        </div>
      )}

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-faint)', fontSize: 12, padding: '30px 0' }}>Cargando...</p>
        ) : proveedores.map((p, i) => (
          <Card key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--border)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="font-cormorant" style={{ fontSize: 20, color: '#D9CBB0', fontWeight: 600 }}>{i + 1}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{p.nombre}</p>
              <p style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 1 }}>{p.especialidad}</p>
              {/* Ranking bar — visible solo al admin */}
              <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 2 }}>
                  <div style={{ width: `${p.ranking || 0}%`, height: '100%', background: 'var(--border-strong)', borderRadius: 2, transition: 'width 0.3s' }} />
                </div>
                <span style={{ fontSize: 9, color: 'var(--text-faint)' }}>{p.ranking || 0}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
              <button onClick={() => cambiarRanking(p.id, 10)} style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.15)', color: '#34d399', fontSize: 14 }}>↑</button>
              <button onClick={() => cambiarRanking(p.id, -10)} style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.12)', color: '#f87171', fontSize: 14 }}>↓</button>
            </div>
            <button onClick={() => eliminar(p.id)} style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.1)', color: 'rgba(248,113,113,0.5)', fontSize: 14, flexShrink: 0 }}>×</button>
          </Card>
        ))}
      </div>
    </div>
  )
}
