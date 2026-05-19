import React, { useState } from 'react'
import { supabase } from '../supabase'

export default function Login({ onLogin }) {
  const [codigo, setCodigo] = useState('')
  const [depto, setDepto] = useState('')
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [edificio, setEdificio] = useState(null)

  const buscarEdificio = async () => {
    setLoading(true); setError('')
    const { data, error } = await supabase.from('edificios').select('*').eq('codigo_acceso', codigo.trim().toUpperCase()).single()
    if (error || !data) { setError('Código incorrecto. Consultá a tu administrador.') }
    else { setEdificio(data); setStep(2) }
    setLoading(false)
  }

  const entrar = async () => {
    if (!nombre.trim() || !depto.trim()) { setError('Completá todos los campos.'); return }
    setLoading(true)
    let { data: v } = await supabase.from('vecinos').select('*').eq('edificio_id', edificio.id).eq('departamento', depto.trim().toUpperCase()).single()
    if (!v) {
      const { data: nuevo, error: e } = await supabase.from('vecinos').insert({ nombre: nombre.trim(), departamento: depto.trim().toUpperCase(), edificio_id: edificio.id, email: '' }).select().single()
      if (e) { setError('No se pudo registrar. Intentá de nuevo.'); setLoading(false); return }
      v = nuevo
    }
    onLogin({ ...v, edificio })
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', background: 'var(--surface2)',
    border: '1px solid var(--border2)', borderRadius: 'var(--radius)',
    padding: '14px 16px', color: 'var(--text)',
    fontSize: 15, transition: 'border-color 0.2s',
  }
  const labelStyle = { fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, display: 'block' }
  const btnStyle = {
    width: '100%', background: 'var(--accent)', color: '#fff',
    borderRadius: 'var(--radius)', padding: '15px',
    fontSize: 14, fontWeight: 600, letterSpacing: '0.02em',
    transition: 'opacity 0.2s, transform 0.1s',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '28px 24px' }}>
      
      {/* Logo area */}
      <div style={{ marginBottom: 52 }}>
        <div style={{ width: 48, height: 48, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          FixHub
        </h1>
        <p style={{ color: 'var(--text2)', marginTop: 8, fontSize: 15, fontWeight: 400 }}>Gestión de edificios simplificada.</p>
      </div>

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={labelStyle}>Código del edificio</label>
          <input value={codigo} onChange={e => setCodigo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscarEdificio()}
            placeholder="Ej: EDIF01" style={{ ...inputStyle, letterSpacing: '0.12em', textTransform: 'uppercase' }} />
          {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 4 }}>{error}</p>}
          <div style={{ height: 8 }} />
          <button onClick={buscarEdificio} disabled={loading || !codigo.trim()} style={{ ...btnStyle, opacity: loading || !codigo.trim() ? 0.5 : 1 }}>
            {loading ? 'Verificando...' : 'Continuar'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--success-dim)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: 4 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Edificio verificado</p>
            <p style={{ fontWeight: 600, fontSize: 16 }}>{edificio.nombre}</p>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{edificio.direccion}</p>
          </div>

          <div>
            <label style={labelStyle}>Tu nombre completo</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Martín García" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Número de departamento</label>
            <input value={depto} onChange={e => setDepto(e.target.value)} placeholder="Ej: 4B"
              onKeyDown={e => e.key === 'Enter' && entrar()}
              style={{ ...inputStyle, textTransform: 'uppercase' }} />
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}
          <button onClick={entrar} disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.5 : 1, marginTop: 4 }}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
          <button onClick={() => { setStep(1); setError('') }} style={{ background: 'none', color: 'var(--text3)', padding: '10px', fontSize: 13, fontWeight: 500 }}>
            ← Cambiar código
          </button>
        </div>
      )}

      <p style={{ position: 'fixed', bottom: 24, left: 0, right: 0, textAlign: 'center', fontSize: 11, color: 'var(--text3)' }}>
        FixHub · Gestión profesional de edificios
      </p>
    </div>
  )
}
