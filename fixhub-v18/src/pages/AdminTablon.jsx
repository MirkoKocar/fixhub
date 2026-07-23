import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { PalaceFrame, PageHeader, AccentCard, Card, PrimaryBtn, OrnamentLine, BottomNav, SectionLabel } from '../components/Palace'

export default function AdminTablon({ user }) {
  const [anuncios, setAnuncios] = useState([])
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [prioridad, setPrioridad] = useState('normal')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('anuncios').select('*')
        .eq('edificio_id', user.edificio.id).order('created_at', { ascending: false })
      setAnuncios(data || [])
    }
    fetch()
  }, [user.edificio.id])

  const publicar = async () => {
    if (!titulo.trim() || !contenido.trim()) return
    setLoading(true)
    const { data } = await supabase.from('anuncios').insert({
      titulo: titulo.trim(), contenido: contenido.trim(),
      edificio_id: user.edificio.id, prioridad, autor: user.nombre
    }).select().single()
    if (data) setAnuncios(prev => [data, ...prev])
    setTitulo(''); setContenido(''); setLoading(false)
  }

  const eliminar = async (id) => {
    await supabase.from('anuncios').delete().eq('id', id)
    setAnuncios(prev => prev.filter(a => a.id !== id))
  }

  const colors = { urgente: '#f87171', normal: 'var(--border-strong)', info: '#60a5fa' }

  return (
    <div className="page">
      <PalaceFrame />
      <PageHeader title="Tablón" subtitle="Anuncios del edificio" />

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Nuevo anuncio */}
        <Card style={{ padding: '16px' }}>
          <SectionLabel style={{ marginBottom: 12 }}>Nuevo anuncio</SectionLabel>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {['info','normal','urgente'].map(p => (
              <button key={p} onClick={() => setPrioridad(p)} style={{
                flex: 1, padding: '6px', borderRadius: 2,
                background: prioridad === p ? `${colors[p]}10` : 'transparent',
                border: `1px solid ${prioridad === p ? colors[p] + '35' : 'var(--border)'}`,
                color: prioridad === p ? colors[p] : 'var(--text-faint)',
                fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.2s'
              }}>{p}</button>
            ))}
          </div>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título del anuncio"
            style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '10px 14px', color: 'var(--text-primary)', fontSize: 13, marginBottom: 8 }} />
          <textarea value={contenido} onChange={e => setContenido(e.target.value)} placeholder="Contenido del anuncio..." rows={3}
            style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '10px 14px', color: 'var(--text-primary)', fontSize: 13, resize: 'none', lineHeight: 1.5, marginBottom: 12 }} />
          <PrimaryBtn onClick={publicar} disabled={loading}>{loading ? 'Publicando...' : 'Publicar anuncio'}</PrimaryBtn>
        </Card>

        <OrnamentLine opacity={0.08} />

        {/* Lista */}
        <SectionLabel style={{ marginBottom: 8 }}>Anuncios publicados</SectionLabel>
        {anuncios.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '24px' }}>
            <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>Sin anuncios publicados</p>
          </Card>
        ) : (
          anuncios.map(a => (
            <AccentCard key={a.id} accentColor={colors[a.prioridad] || colors.normal}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{a.titulo}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4, lineHeight: 1.5 }}>{a.contenido}</p>
                  <p style={{ fontSize: 9, color: 'var(--text-faint)', marginTop: 6, letterSpacing: '0.06em' }}>
                    {new Date(a.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <button onClick={() => eliminar(a.id)} style={{ marginLeft: 12, fontSize: 14, color: 'rgba(248,113,113,0.3)', flexShrink: 0, padding: '4px' }}>×</button>
              </div>
            </AccentCard>
          ))
        )}
      </div>
    </div>
  )
}
