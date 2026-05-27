import React, { useState, useRef, useEffect } from 'react'
import { supabase } from '../supabase'

// Parses prefix: VEC-CODIGO → { rol: 'vecino', codigo: 'CODIGO' }
function parseInput(raw) {
  const upper = raw.trim().toUpperCase()
  if (upper.startsWith('VEC-')) return { rol: 'vecino', codigo: upper.slice(4) }
  if (upper.startsWith('ADM-')) return { rol: 'admin', codigo: upper.slice(4) }
  if (upper.startsWith('PRO-')) return { rol: 'proveedor', codigo: upper.slice(4) }
  return null
}

const rolLabels = { vecino: 'Vecino', admin: 'Administrador', proveedor: 'Proveedor' }
const rolColors = { vecino: '#34d399', admin: '#fbbf24', proveedor: '#60a5fa' }

export default function Login({ onLogin }) {
  // Step 1: code entry. Step 2: name/depto entry
  const [step, setStep] = useState(1)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [parsed, setParsed] = useState(null) // { rol, codigo }
  const [edificio, setEdificio] = useState(null)
  const [nombre, setNombre] = useState('')
  const [depto, setDepto] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [step])

  const handleCode = async () => {
    const p = parseInput(input)
    if (!p) {
      setError('Formato incorrecto. Usá VEC-, ADM- o PRO- seguido del código.')
      return
    }
    setLoading(true); setError('')
    const { data, error: err } = await supabase
      .from('edificios').select('*')
      .eq('codigo_acceso', p.codigo).single()
    if (err || !data) {
      setError('Código no encontrado.')
      setLoading(false); return
    }
    setParsed(p)
    setEdificio(data)
    setStep(2)
    setLoading(false)
  }

  const handleEnter = async () => {
    if (!nombre.trim()) { setError('Ingresá tu nombre.'); return }
    if (parsed.rol === 'vecino' && !depto.trim()) { setError('Ingresá tu departamento.'); return }
    setLoading(true); setError('')

    if (parsed.rol === 'vecino') {
      let { data: v } = await supabase.from('vecinos').select('*')
        .eq('edificio_id', edificio.id).eq('departamento', depto.trim().toUpperCase()).single()
      if (!v) {
        const { data: nuevo, error: e } = await supabase.from('vecinos')
          .insert({ nombre: nombre.trim(), departamento: depto.trim().toUpperCase(), edificio_id: edificio.id, email: '' })
          .select().single()
        if (e) { setError('Error al registrar.'); setLoading(false); return }
        v = nuevo
      }
      onLogin({ ...v, edificio, rol: 'vecino' })
    } else if (parsed.rol === 'admin') {
      // Check admin_pin if exists
      if (edificio.admin_pin && nombre.trim() !== edificio.admin_pin) {
        setError('PIN de administrador incorrecto.')
        setLoading(false); return
      }
      onLogin({ nombre: nombre.trim(), edificio, rol: 'admin', id: edificio.id })
    } else {
      let { data: p } = await supabase.from('proveedores').select('*')
        .eq('edificio_id', edificio.id).eq('nombre', nombre.trim()).single()
      if (!p) { setError('Proveedor no encontrado. Pedile al admin que te registre.'); setLoading(false); return }
      onLogin({ ...p, edificio, rol: 'proveedor' })
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', padding: '0 28px',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Subtle bg glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(217,203,176,0.03) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Top brand */}
      <div style={{ paddingTop: 64, textAlign: 'center' }} className="fade-up">
        <div className="animate-ornament" style={{
          fontSize: 9, letterSpacing: '0.5em', color: '#D9CBB0',
          textTransform: 'uppercase', marginBottom: 20
        }}>✦ &nbsp; ✦ &nbsp; ✦</div>
        <h1 className="font-cormorant" style={{
          fontSize: 38, fontWeight: 700, color: '#F2E0C9',
          letterSpacing: '-0.01em', lineHeight: 1.05, marginBottom: 6
        }}>
          Residencia <em style={{ fontWeight: 400, color: 'rgba(217,203,176,0.7)' }}>&amp;</em> Confort.
        </h1>
        <p style={{ fontSize: 12, color: 'rgba(160,174,192,0.45)', letterSpacing: '0.14em', fontStyle: 'italic' }}>
          Tu espacio. Tu tranquilidad.
        </p>
      </div>

      {/* Form */}
      <div className="fade-up-2" style={{ width: '100%' }}>
        {step === 1 && (
          <div>
            {/* Instruction */}
            <p style={{
              textAlign: 'center', fontSize: 10, color: 'rgba(160,174,192,0.35)',
              letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20
            }}>
              VEC · ADM · PRO — seguido del código
            </p>

            {/* Big input with arrow */}
            <div style={{ position: 'relative' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => { setInput(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleCode()}
                placeholder="VEC-EDIFICIO1"
                style={{
                  width: '100%',
                  background: 'rgba(242,224,201,0.06)',
                  border: '1px solid rgba(217,203,176,0.15)',
                  borderRadius: 12,
                  padding: '18px 60px 18px 20px',
                  color: '#F2E0C9',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 22, fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  caretColor: '#D9CBB0',
                }}
              />
              <button
                onClick={handleCode}
                disabled={loading}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  width: 40, height: 40, borderRadius: 8,
                  background: input.trim() ? 'rgba(242,224,201,0.12)' : 'transparent',
                  border: '1px solid rgba(217,203,176,0.15)',
                  color: '#D9CBB0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                {loading
                  ? <span style={{ fontSize: 10 }}>...</span>
                  : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                }
              </button>
            </div>

            {error && (
              <p style={{ color: '#f87171', fontSize: 11, textAlign: 'center', marginTop: 10, opacity: 0.8 }}>{error}</p>
            )}

            {/* Helper pills */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
              {[['VEC-', 'Vecino', '#34d399'], ['ADM-', 'Admin', '#fbbf24'], ['PRO-', 'Proveedor', '#60a5fa']].map(([prefix, label, color]) => (
                <button key={prefix} onClick={() => setInput(prefix)} style={{
                  padding: '4px 12px', borderRadius: 20,
                  background: `${color}08`, border: `1px solid ${color}20`,
                  color: `${color}`, fontSize: 10, letterSpacing: '0.08em'
                }}>{prefix}</button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Edificio confirmed */}
            <div style={{
              textAlign: 'center', padding: '12px 16px',
              background: 'rgba(242,224,201,0.04)', border: '1px solid rgba(217,203,176,0.1)',
              borderRadius: 12, marginBottom: 4
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: rolColors[parsed.rol] }} />
                <span style={{ fontSize: 10, color: rolColors[parsed.rol], letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                  {rolLabels[parsed.rol]}
                </span>
              </div>
              <p className="font-cormorant" style={{ fontSize: 18, color: '#F2E0C9', fontWeight: 600 }}>{edificio.nombre}</p>
              <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.4)', marginTop: 2 }}>{edificio.direccion}</p>
            </div>

            <input
              ref={inputRef}
              value={nombre}
              onChange={e => { setNombre(e.target.value); setError('') }}
              placeholder={parsed.rol === 'admin' ? 'PIN de administrador' : 'Tu nombre completo'}
              type={parsed.rol === 'admin' ? 'password' : 'text'}
              style={{
                width: '100%', background: 'rgba(242,224,201,0.05)',
                border: '1px solid rgba(217,203,176,0.12)', borderRadius: 10,
                padding: '14px 16px', color: '#F2E0C9', fontSize: 15,
                letterSpacing: parsed.rol === 'admin' ? '0.2em' : '0.02em',
              }}
            />

            {parsed.rol === 'vecino' && (
              <input
                value={depto}
                onChange={e => { setDepto(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleEnter()}
                placeholder="Departamento (ej: 4B)"
                style={{
                  width: '100%', background: 'rgba(242,224,201,0.05)',
                  border: '1px solid rgba(217,203,176,0.12)', borderRadius: 10,
                  padding: '14px 16px', color: '#F2E0C9', fontSize: 15,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}
              />
            )}

            {error && (
              <p style={{ color: '#f87171', fontSize: 11, textAlign: 'center', opacity: 0.8 }}>{error}</p>
            )}

            <div style={{ marginTop: 4 }}>
              <button
                onClick={handleEnter}
                disabled={loading}
                style={{
                  width: '100%', background: 'rgba(242,224,201,0.92)', border: 'none',
                  borderRadius: 10, padding: '15px',
                  fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 700,
                  color: '#071020', letterSpacing: '0.06em',
                  opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s'
                }}
              >
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </div>
            <button onClick={() => { setStep(1); setError(''); setParsed(null); setEdificio(null) }}
              style={{ color: 'rgba(160,174,192,0.3)', fontSize: 12, textAlign: 'center', padding: '8px', letterSpacing: '0.06em' }}>
              ← Volver
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fade-up-3" style={{ paddingBottom: 32, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 16, opacity: 0.2 }}>
          {[
            ['M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', 'Protegido'],
            ['M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', '24 / 7'],
            ['M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0', 'En vivo'],
          ].map(([d, label]) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <svg width="18" height="18" fill="none" stroke="rgba(217,203,176,0.8)" strokeWidth="1.3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={d} />
              </svg>
              <span style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#D9CBB0' }}>{label}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 8, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(217,203,176,0.12)' }}>
          — FixHub · 2026 —
        </p>
      </div>
    </div>
  )
}
