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

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80) }, [step])

  const handleCode = async () => {
    const p = parseInput(input)
    if (!p) { setError('Usá VEC-, ADM- o PRO- seguido del código'); return }
    setLoading(true); setError('')
    const { data } = await supabase.from('edificios').select('*').eq('codigo_acceso', p.codigo).limit(1)
    if (!data || data.length === 0) { setError('Código no encontrado.'); setLoading(false); return }
    setParsed(p); setEdificio(data[0]); setStep(2); setLoading(false)
  }

  const handleEnter = async () => {
    if (!nombre.trim()) { setError('Ingresá tu nombre.'); return }
    if (parsed.rol === 'vecino' && !depto.trim()) { setError('Ingresá tu departamento.'); return }
    setLoading(true); setError('')
    if (parsed.rol === 'vecino') {
      let { data: v } = await supabase.from('vecinos').select('*').eq('edificio_id', edificio.id).eq('departamento', depto.trim().toUpperCase()).limit(1)
      let vecino = v?.[0]
      if (!vecino) {
        const { data: nuevo, error: e } = await supabase.from('vecinos').insert({ nombre: nombre.trim(), departamento: depto.trim().toUpperCase(), edificio_id: edificio.id, email: '' }).select().single()
        if (e) { setError('Error al registrar.'); setLoading(false); return }
        vecino = nuevo
      }
      onLogin({ ...vecino, edificio, rol: 'vecino' })
    } else if (parsed.rol === 'admin') {
      if (edificio.admin_pin && nombre.trim() !== edificio.admin_pin) { setError('PIN incorrecto.'); setLoading(false); return }
      onLogin({ nombre: nombre.trim(), edificio, rol: 'admin', id: edificio.id })
    } else {
      let { data: prov } = await supabase.from('proveedores').select('*').eq('edificio_id', edificio.id).eq('nombre', nombre.trim()).limit(1)
      if (!prov?.[0]) { setError('Proveedor no encontrado.'); setLoading(false); return }
      onLogin({ ...prov[0], edificio, rol: 'proveedor' })
    }
    setLoading(false)
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', padding: '0 28px', overflow: 'hidden' }}>

      {/* Brand — compacto */}
      <div style={{ paddingTop: 48, textAlign: 'center', flexShrink: 0 }} className="fade-up">
        <p className="font-cormorant animate-ornament" style={{ fontSize: 9, letterSpacing: '0.5em', color: '#D9CBB0', marginBottom: 12 }}>✦ &nbsp; ✦ &nbsp; ✦</p>
        <h1 className="font-cormorant" style={{ fontSize: 34, fontWeight: 700, color: '#F2E0C9', letterSpacing: '-0.01em', lineHeight: 1.0, marginBottom: 6 }}>
          Residencia<br /><em style={{ fontWeight: 400, color: 'rgba(217,203,176,0.6)' }}>&amp; Confort.</em>
        </h1>
        <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.32)', letterSpacing: '0.16em', fontStyle: 'italic' }}>
          Tu espacio. Tu tranquilidad.
        </p>
        <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: 10, opacity: 0.12 }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right,transparent,rgba(217,203,176,0.6))' }} />
          {[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, border: '1px solid rgba(217,203,176,0.8)', transform: 'rotate(45deg)' }} />)}
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left,transparent,rgba(217,203,176,0.6))' }} />
        </div>
      </div>

      {/* Form — flex grow para centrar */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="fade-up-2">
        {step === 1 && (
          <div>
            <p style={{ fontSize: 9, letterSpacing: '0.26em', color: 'rgba(160,174,192,0.25)', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              VEC · ADM · PRO — código del edificio
            </p>
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => { setInput(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleCode()}
                placeholder="VEC-EDIFICIO1"
                style={{ width: '100%', background: 'rgba(242,224,201,0.04)', border: '1px solid rgba(217,203,176,0.12)', borderRadius: 4, padding: '12px 46px 12px 16px', color: '#F2E0C9', fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', caretColor: '#D9CBB0' }}
              />
              <button onClick={handleCode} disabled={loading} style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: 3, background: input.trim() ? 'rgba(242,224,201,0.1)' : 'transparent', border: '1px solid rgba(217,203,176,0.1)', color: '#D9CBB0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {loading ? <span style={{ fontSize: 9 }}>···</span> : <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>}
              </button>
            </div>
            {error && <p style={{ color: '#f87171', fontSize: 11, textAlign: 'center', marginBottom: 8, opacity: 0.8 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10 }}>
              {[['VEC-'],['ADM-'],['PRO-']].map(([p]) => (
                <button key={p} onClick={() => setInput(p)} style={{ padding: '4px 11px', borderRadius: 2, background: 'rgba(217,203,176,0.03)', border: '1px solid rgba(217,203,176,0.09)', color: 'rgba(217,203,176,0.35)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{p}</button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ padding: '10px 14px', background: 'rgba(242,224,201,0.03)', border: '1px solid rgba(217,203,176,0.08)', borderRadius: 4, textAlign: 'center', marginBottom: 4 }}>
              <p style={{ fontSize: 8.5, letterSpacing: '0.28em', color: 'rgba(160,174,192,0.35)', textTransform: 'uppercase', marginBottom: 4 }}>{rolLabels[parsed?.rol]}</p>
              <p className="font-cormorant" style={{ fontSize: 18, color: '#F2E0C9', fontWeight: 600 }}>{edificio?.nombre}</p>
              <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.3)', marginTop: 2 }}>{edificio?.direccion}</p>
            </div>
            <input ref={inputRef} value={nombre} onChange={e => { setNombre(e.target.value); setError('') }} onKeyDown={e => e.key === 'Enter' && !depto && handleEnter()} placeholder={parsed?.rol === 'admin' ? 'PIN de administrador' : 'Nombre completo'} type={parsed?.rol === 'admin' ? 'password' : 'text'}
              style={{ width: '100%', background: 'rgba(242,224,201,0.04)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 4, padding: '12px 14px', color: '#F2E0C9', fontSize: 14 }} />
            {parsed?.rol === 'vecino' && (
              <input value={depto} onChange={e => { setDepto(e.target.value); setError('') }} onKeyDown={e => e.key === 'Enter' && handleEnter()} placeholder="Departamento (ej: 4B)"
                style={{ width: '100%', background: 'rgba(242,224,201,0.04)', border: '1px solid rgba(217,203,176,0.1)', borderRadius: 4, padding: '12px 14px', color: '#F2E0C9', fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }} />
            )}
            {error && <p style={{ color: '#f87171', fontSize: 11, textAlign: 'center', opacity: 0.8 }}>{error}</p>}
            <button onClick={handleEnter} disabled={loading} style={{ width: '100%', background: 'rgba(242,224,201,0.9)', border: 'none', borderRadius: 4, padding: '13px', fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: '#071020', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: loading ? 0.6 : 1, marginTop: 2 }}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
            <button onClick={() => { setStep(1); setError(''); setParsed(null); setEdificio(null) }} style={{ color: 'rgba(160,174,192,0.22)', fontSize: 10, padding: '6px', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center' }}>← Volver</button>
          </div>
        )}
      </div>

      {/* Footer compacto */}
      <div style={{ paddingBottom: 24, textAlign: 'center', flexShrink: 0 }} className="fade-up-3">
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 10, opacity: 0.13 }}>
          {[['M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z','Protegido'],['M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z','24/7'],['M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0','En vivo']].map(([d,label]) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <svg width="15" height="15" fill="none" stroke="rgba(217,203,176,0.9)" strokeWidth="1.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={d}/></svg>
              <span style={{ fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#D9CBB0' }}>{label}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 7.5, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(217,203,176,0.09)' }}>— FixHub · 2026 —</p>
      </div>
    </div>
  )
}
