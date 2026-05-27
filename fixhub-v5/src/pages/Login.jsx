import React, { useState, useRef, useEffect } from 'react'
import { supabase } from '../supabase'

function parseInput(raw) {
  const upper = raw.trim().toUpperCase()
  if (upper.startsWith('VEC-')) return { rol: 'vecino', codigo: upper.slice(4) }
  if (upper.startsWith('ADM-')) return { rol: 'admin', codigo: upper.slice(4) }
  if (upper.startsWith('PRO-')) return { rol: 'proveedor', codigo: upper.slice(4) }
  return null
}

const rolLabels = { vecino: 'Vecino', admin: 'Administrador', proveedor: 'Proveedor' }

export default function Login({ onLogin }) {
  const [step, setStep] = useState(1)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [parsed, setParsed] = useState(null)
  const [edificio, setEdificio] = useState(null)
  const [nombre, setNombre] = useState('')
  const [depto, setDepto] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100) }, [step])

  const handleCode = async () => {
    const p = parseInput(input)
    if (!p) { setError('Formato: VEC-, ADM- o PRO- seguido del código'); return }
    setLoading(true); setError('')
    const { data, error: err } = await supabase.from('edificios').select('*')
      .eq('codigo_acceso', p.codigo).limit(1)
    if (err || !data || data.length === 0) {
      setError('Código no encontrado.')
      setLoading(false); return
    }
    setParsed(p); setEdificio(data[0]); setStep(2); setLoading(false)
  }

  const handleEnter = async () => {
    if (!nombre.trim()) { setError('Ingresá tu nombre.'); return }
    if (parsed.rol === 'vecino' && !depto.trim()) { setError('Ingresá tu departamento.'); return }
    setLoading(true); setError('')

    if (parsed.rol === 'vecino') {
      let { data: v } = await supabase.from('vecinos').select('*')
        .eq('edificio_id', edificio.id).eq('departamento', depto.trim().toUpperCase()).limit(1)
      let vecino = v?.[0]
      if (!vecino) {
        const { data: nuevo, error: e } = await supabase.from('vecinos')
          .insert({ nombre: nombre.trim(), departamento: depto.trim().toUpperCase(), edificio_id: edificio.id, email: '' })
          .select().single()
        if (e) { setError('Error al registrar.'); setLoading(false); return }
        vecino = nuevo
      }
      onLogin({ ...vecino, edificio, rol: 'vecino' })
    } else if (parsed.rol === 'admin') {
      if (edificio.admin_pin && nombre.trim() !== edificio.admin_pin) {
        setError('PIN incorrecto.'); setLoading(false); return
      }
      onLogin({ nombre: nombre.trim(), edificio, rol: 'admin', id: edificio.id })
    } else {
      let { data: provData } = await supabase.from('proveedores').select('*')
        .eq('edificio_id', edificio.id).eq('nombre', nombre.trim()).limit(1)
      if (!provData?.[0]) { setError('Proveedor no encontrado.'); setLoading(false); return }
      onLogin({ ...provData[0], edificio, rol: 'proveedor' })
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 32px', position: 'relative', overflow: 'hidden' }}>
      {/* ambient glow */}
      <div style={{ position: 'absolute', top: '25%', left: '50%', transform: 'translate(-50%,-50%)', width: 280, height: 280, background: 'radial-gradient(circle, rgba(217,203,176,0.025) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Brand */}
      <div style={{ paddingTop: 72, textAlign: 'center', flex: 1 }} className="fade-up">
        <p className="font-cormorant animate-ornament" style={{ fontSize: 9, letterSpacing: '0.55em', color: '#D9CBB0', marginBottom: 18 }}>✦ &nbsp; ✦ &nbsp; ✦</p>
        <h1 className="font-cormorant" style={{ fontSize: 36, fontWeight: 700, color: '#F2E0C9', letterSpacing: '-0.01em', lineHeight: 1.05, marginBottom: 8 }}>
          Residencia<br /><em style={{ fontWeight: 400, color: 'rgba(217,203,176,0.65)' }}>&amp; Confort.</em>
        </h1>
        <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.35)', letterSpacing: '0.18em', fontStyle: 'italic' }}>
          Tu espacio. Tu tranquilidad.
        </p>

        {/* thin ornament line */}
        <div style={{ margin: '28px 0 32px', display: 'flex', alignItems: 'center', gap: 12, opacity: 0.14 }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(217,203,176,0.6))' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, border: '1px solid rgba(217,203,176,0.8)', transform: 'rotate(45deg)' }} />)}
          </div>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(217,203,176,0.6))' }} />
        </div>

        {step === 1 && (
          <div className="fade-up-2">
            <p style={{ fontSize: 9, letterSpacing: '0.28em', color: 'rgba(160,174,192,0.28)', textTransform: 'uppercase', marginBottom: 16 }}>
              VEC · ADM · PRO — seguido del código
            </p>

            {/* Slim input */}
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => { setInput(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleCode()}
                placeholder="VEC-EDIFICIO1"
                style={{
                  width: '100%',
                  background: 'rgba(242,224,201,0.04)',
                  border: '1px solid rgba(217,203,176,0.12)',
                  borderRadius: 4,
                  padding: '13px 50px 13px 18px',
                  color: '#F2E0C9',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 20, fontWeight: 600,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  caretColor: '#D9CBB0',
                }}
              />
              <button onClick={handleCode} disabled={loading} style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                width: 32, height: 32, borderRadius: 3,
                background: input.trim() ? 'rgba(242,224,201,0.1)' : 'transparent',
                border: '1px solid rgba(217,203,176,0.12)',
                color: '#D9CBB0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}>
                {loading
                  ? <span style={{ fontSize: 9, letterSpacing: 1 }}>···</span>
                  : <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                }
              </button>
            </div>

            {error && <p style={{ color: '#f87171', fontSize: 11, marginBottom: 14, opacity: 0.8 }}>{error}</p>}

            {/* Minimal role hints */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 18 }}>
              {[['VEC-','Vecino'],['ADM-','Admin'],['PRO-','Proveedor']].map(([prefix, label]) => (
                <button key={prefix} onClick={() => setInput(prefix)} style={{
                  padding: '5px 12px', borderRadius: 2,
                  background: 'rgba(217,203,176,0.04)',
                  border: '1px solid rgba(217,203,176,0.1)',
                  color: 'rgba(217,203,176,0.4)',
                  fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase',
                  transition: 'all 0.2s'
                }}>{prefix}</button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-up-2" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Edificio confirmed */}
            <div style={{
              padding: '14px 18px', background: 'rgba(242,224,201,0.03)',
              border: '1px solid rgba(217,203,176,0.09)', borderRadius: 4, textAlign: 'center', marginBottom: 6
            }}>
              <p style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(160,174,192,0.4)', textTransform: 'uppercase', marginBottom: 6 }}>
                {rolLabels[parsed.rol]}
              </p>
              <p className="font-cormorant" style={{ fontSize: 20, color: '#F2E0C9', fontWeight: 600 }}>{edificio.nombre}</p>
              <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.35)', marginTop: 3 }}>{edificio.direccion}</p>
            </div>

            <input
              ref={inputRef}
              value={nombre}
              onChange={e => { setNombre(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && !depto && handleEnter()}
              placeholder={parsed.rol === 'admin' ? 'PIN de administrador' : 'Nombre completo'}
              type={parsed.rol === 'admin' ? 'password' : 'text'}
              style={{
                width: '100%', background: 'rgba(242,224,201,0.04)',
                border: '1px solid rgba(217,203,176,0.1)', borderRadius: 4,
                padding: '13px 16px', color: '#F2E0C9', fontSize: 14, letterSpacing: '0.03em',
              }}
            />

            {parsed.rol === 'vecino' && (
              <input
                value={depto}
                onChange={e => { setDepto(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleEnter()}
                placeholder="Departamento (ej: 4B)"
                style={{
                  width: '100%', background: 'rgba(242,224,201,0.04)',
                  border: '1px solid rgba(217,203,176,0.1)', borderRadius: 4,
                  padding: '13px 16px', color: '#F2E0C9', fontSize: 14,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                }}
              />
            )}

            {error && <p style={{ color: '#f87171', fontSize: 11, opacity: 0.8 }}>{error}</p>}

            <button onClick={handleEnter} disabled={loading} style={{
              width: '100%', background: 'rgba(242,224,201,0.9)', border: 'none', borderRadius: 4,
              padding: '14px', fontFamily: "'Cormorant Garamond', serif",
              fontSize: 16, fontWeight: 700, color: '#071020',
              letterSpacing: '0.14em', textTransform: 'uppercase',
              opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s', marginTop: 4
            }}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>

            <button onClick={() => { setStep(1); setError(''); setParsed(null); setEdificio(null) }}
              style={{ color: 'rgba(160,174,192,0.25)', fontSize: 10, padding: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              ← Volver
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fade-up-3" style={{ paddingBottom: 36, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 16, opacity: 0.15 }}>
          {[
            ['M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', 'Protegido'],
            ['M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', '24 / 7'],
            ['M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0', 'En vivo'],
          ].map(([d, label]) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <svg width="16" height="16" fill="none" stroke="rgba(217,203,176,0.9)" strokeWidth="1.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={d} />
              </svg>
              <span style={{ fontSize: 7.5, textTransform: 'uppercase', letterSpacing: '0.28em', color: '#D9CBB0' }}>{label}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 7.5, letterSpacing: '0.42em', textTransform: 'uppercase', color: 'rgba(217,203,176,0.1)' }}>
          — FixHub · 2026 —
        </p>
      </div>
    </div>
  )
}
