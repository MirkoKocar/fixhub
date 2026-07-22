import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, PageHeader, AccentCard, PrimaryBtn, BottomNav } from '../components/Palace'

export default function EncuestaVecino({ user }) {
  const { encuestaId } = useParams()
  const navigate = useNavigate()
  const [encuesta, setEncuesta] = useState(null)
  const [respuestas, setRespuestas] = useState({})
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('encuestas').select('*').eq('id', encuestaId).single()
      setEncuesta(data)
    }
    fetch()
  }, [encuestaId])

  const enviar = async () => {
    if (!encuesta) return
    setLoading(true)
    await supabase.from('respuestas_encuesta').insert({
      encuesta_id: encuestaId, vecino_id: user.id,
      respuestas: respuestas, edificio_id: user.edificio.id
    })
    setEnviado(true); setLoading(false)
  }

  if (enviado) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
      <p className="font-cormorant animate-ornament" style={{ fontSize: 9, letterSpacing: '0.5em', color: '#D9CBB0', marginBottom: 16 }}>✦ ✦ ✦</p>
      <h2 className="font-cormorant" style={{ fontSize: 26, color: '#F2E0C9', marginBottom: 10 }}>Gracias por tu opinión</h2>
      <p style={{ fontSize: 13, color: 'rgba(160,174,192,0.4)', marginBottom: 24 }}>Tu respuesta fue registrada correctamente.</p>
      <button onClick={() => navigate('/')} style={{ fontSize: 10, color: 'rgba(217,203,176,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Volver al inicio →</button>
    </div>
  )

  return (
    <div className="page">
      <PalaceFrame />
      <PageHeader title={encuesta?.titulo || 'Encuesta'} subtitle="Tu opinión importa" onBack={() => navigate('/')} />
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {(encuesta?.preguntas || []).map((pregunta, i) => (
          <AccentCard key={i} accentColor="rgba(217,203,176,0.2)">
            <p style={{ fontSize: 13, color: 'rgba(242,224,201,0.85)', fontWeight: 500, marginBottom: 12 }}>{pregunta}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setRespuestas(prev => ({ ...prev, [i]: n }))} style={{
                  flex: 1, padding: '10px 4px', borderRadius: 3, textAlign: 'center',
                  background: respuestas[i] === n ? 'rgba(217,203,176,0.12)' : 'rgba(242,224,201,0.02)',
                  border: `1px solid ${respuestas[i] === n ? 'rgba(217,203,176,0.35)' : 'rgba(217,203,176,0.07)'}`,
                  transition: 'all 0.2s'
                }}>
                  <div style={{ width: 6, height: 6, border: `1px solid ${respuestas[i] >= n ? 'rgba(217,203,176,0.7)' : 'rgba(217,203,176,0.2)'}`, transform: 'rotate(45deg)', margin: '0 auto 4px', background: respuestas[i] >= n ? 'rgba(217,203,176,0.3)' : 'transparent', transition: 'all 0.2s' }} />
                  <span style={{ fontSize: 9, color: respuestas[i] === n ? 'rgba(242,224,201,0.8)' : 'rgba(160,174,192,0.3)' }}>{n}</span>
                </button>
              ))}
            </div>
          </AccentCard>
        ))}
        <PrimaryBtn onClick={enviar} disabled={loading || Object.keys(respuestas).length < (encuesta?.preguntas?.length || 0)}>
          {loading ? 'Enviando...' : 'Enviar respuestas'}
        </PrimaryBtn>
      </div>
      <BottomNav rol="vecino" />
    </div>
  )
}
