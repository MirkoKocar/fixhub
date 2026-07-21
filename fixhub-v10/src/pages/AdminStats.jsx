import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { PalaceFrame, PageHeader, Card, OrnamentLine, BottomNav } from '../components/Palace'

export default function AdminStats({ user }) {
  const navigate = useNavigate()
  const [avisos, setAvisos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('avisos').select('*').eq('edificio_id', user.edificio.id)
      setAvisos(data || [])
      setLoading(false)
    }
    fetch()
  }, [user.edificio.id])

  const total = avisos.length
  const resueltos = avisos.filter(a => a.estado === 'resuelto').length
  const enCurso = avisos.filter(a => a.estado === 'en_curso').length
  const nuevos = avisos.filter(a => a.estado === 'nuevo').length
  const tasaResolucion = total > 0 ? Math.round((resueltos / total) * 100) : 0

  // Por categoría
  const porCategoria = avisos.reduce((acc, a) => {
    acc[a.categoria] = (acc[a.categoria] || 0) + 1
    return acc
  }, {})
  const categorias = Object.entries(porCategoria).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxCat = categorias[0]?.[1] || 1

  return (
    <div className="page">
      <PalaceFrame />
      <PageHeader title="Estadísticas" subtitle={user.edificio.nombre} onBack={() => navigate('/')} />

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Total avisos', value: total, color: '#F2E0C9' },
            { label: 'Tasa resolución', value: `${tasaResolucion}%`, color: '#34d399' },
            { label: 'Resueltos', value: resueltos, color: '#34d399' },
            { label: 'En curso', value: enCurso, color: '#fbbf24' },
          ].map(k => (
            <Card key={k.label} style={{ textAlign: 'center', padding: '16px 10px' }}>
              <p className="font-cormorant" style={{ fontSize: 32, fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.value}</p>
              <p style={{ fontSize: 9, color: 'rgba(160,174,192,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 6 }}>{k.label}</p>
            </Card>
          ))}
        </div>

        <OrnamentLine opacity={0.1} />

        {/* Por categoría */}
        {categorias.length > 0 && (
          <div>
            <p style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(160,174,192,0.3)', textTransform: 'uppercase', marginBottom: 12 }}>Por categoría</p>
            <Card>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {categorias.map(([cat, count]) => (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: 'rgba(242,224,201,0.7)' }}>{cat}</span>
                      <span style={{ fontSize: 12, color: 'rgba(160,174,192,0.4)' }}>{count}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(217,203,176,0.06)', borderRadius: 2 }}>
                      <div style={{ width: `${(count / maxCat) * 100}%`, height: '100%', background: 'rgba(217,203,176,0.35)', borderRadius: 2, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Estado visual */}
        <div>
          <p style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(160,174,192,0.3)', textTransform: 'uppercase', marginBottom: 12 }}>Distribución de estados</p>
          <Card style={{ padding: '20px 16px' }}>
            {total > 0 ? (
              <div>
                <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', gap: 2 }}>
                  {nuevos > 0 && <div style={{ flex: nuevos, background: '#f87171', opacity: 0.7 }} />}
                  {enCurso > 0 && <div style={{ flex: enCurso, background: '#fbbf24', opacity: 0.7 }} />}
                  {resueltos > 0 && <div style={{ flex: resueltos, background: '#34d399', opacity: 0.7 }} />}
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'center' }}>
                  {[['Nuevo', nuevos, '#f87171'], ['En curso', enCurso, '#fbbf24'], ['Resuelto', resueltos, '#34d399']].map(([label, n, c]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: c, opacity: 0.7 }} />
                      <span style={{ fontSize: 10, color: 'rgba(160,174,192,0.4)' }}>{label} ({n})</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(160,174,192,0.25)' }}>Sin datos aún</p>
            )}
          </Card>
        </div>
      </div>

      <BottomNav rol="admin" />
    </div>
  )
}
