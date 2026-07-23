import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, PageHeader, AccentCard, Card, OrnamentLine, BottomNav, SectionLabel } from '../components/Palace'

export default function VotacionVecino({ user }) {
  const navigate = useNavigate()
  const [votaciones, setVotaciones] = useState([])
  const [misVotos, setMisVotos] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data: vots } = await supabase.from('votaciones').select('*, votos(*)')
        .eq('edificio_id', user.edificio.id).eq('activa', true)
      const { data: mv } = await supabase.from('votos').select('*').eq('vecino_id', user.id)
      setVotaciones(vots || [])
      const votosMap = {}
      mv?.forEach(v => { votosMap[v.votacion_id] = v.opcion })
      setMisVotos(votosMap)
      setLoading(false)
    }
    fetch()
  }, [user.id, user.edificio.id])

  const votar = async (votacionId, opcion) => {
    if (misVotos[votacionId]) return
    await supabase.from('votos').insert({ votacion_id: votacionId, vecino_id: user.id, opcion, edificio_id: user.edificio.id })
    setMisVotos(prev => ({ ...prev, [votacionId]: opcion }))
    setVotaciones(prev => prev.map(v => v.id === votacionId ? { ...v, votos: [...(v.votos || []), { opcion, vecino_id: user.id }] } : v))
  }

  return (
    <div className="page">
      <PalaceFrame />
      <PageHeader title="Votaciones" subtitle="Decisiones del consorcio" />
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? <p style={{ textAlign: 'center', color: 'var(--text-faint)', fontSize: 12, padding: '30px 0' }}>Cargando...</p>
          : votaciones.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '28px' }}>
              <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>Sin votaciones activas</p>
            </Card>
          ) : votaciones.map(v => {
            const yaVoté = misVotos[v.id]
            const totalVotos = v.votos?.length || 0
            return (
              <Card key={v.id} style={{ padding: '14px' }}>
                <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500, marginBottom: 12, lineHeight: 1.3 }}>{v.titulo}</p>
                {v.fecha_limite && <p style={{ fontSize: 9, color: 'var(--text-faint)', marginBottom: 10, letterSpacing: '0.06em' }}>Cierra: {new Date(v.fecha_limite).toLocaleDateString('es-AR')}</p>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(v.opciones || []).map(op => {
                    const count = v.votos?.filter(vt => vt.opcion === op).length || 0
                    const pct = totalVotos > 0 ? Math.round((count / totalVotos) * 100) : 0
                    const esmiVoto = yaVoté === op
                    return (
                      <button key={op} onClick={() => votar(v.id, op)} disabled={!!yaVoté} style={{ width: '100%', background: 'transparent', border: 'none', padding: 0, textAlign: 'left', cursor: yaVoté ? 'default' : 'pointer' }}>
                        <AccentCard accentColor={esmiVoto ? 'var(--border-strong)' : 'var(--border)'} style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: yaVoté ? 6 : 0 }}>
                            <span style={{ fontSize: 12, color: esmiVoto ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{op}</span>
                            {yaVoté && <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{pct}%</span>}
                          </div>
                          {yaVoté && (
                            <div style={{ height: 2, background: 'var(--border)', borderRadius: 1 }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: esmiVoto ? 'var(--border-strong)' : 'var(--border-strong)', borderRadius: 1, transition: 'width 0.5s' }} />
                            </div>
                          )}
                        </AccentCard>
                      </button>
                    )
                  })}
                </div>
                <p style={{ fontSize: 9, color: 'var(--text-faint)', marginTop: 10, letterSpacing: '0.06em' }}>{totalVotos} voto{totalVotos !== 1 ? 's' : ''}</p>
              </Card>
            )
          })}
      </div>
    </div>
  )
}
