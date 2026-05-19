import React, { useState } from 'react'
import { supabase } from '../supabase'

export default function Login({ onLogin }) {
  const [codigo, setCodigo] = useState('')
  const [depto, setDepto] = useState('')
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: código edificio, 2: datos vecino
  const [edificio, setEdificio] = useState(null)

  const buscarEdificio = async () => {
    setLoading(true)
    setError('')
    const { data, error } = await supabase
      .from('edificios')
      .select('*')
      .eq('codigo_acceso', codigo.trim().toUpperCase())
      .single()

    if (error || !data) {
      setError('Código incorrecto. Pedíselo a tu administrador.')
    } else {
      setEdificio(data)
      setStep(2)
    }
    setLoading(false)
  }

  const entrar = async () => {
    if (!nombre.trim() || !depto.trim()) {
      setError('Completá todos los campos.')
      return
    }
    setLoading(true)

    // Buscar vecino existente o crear uno nuevo
    let { data: vecinoExistente } = await supabase
      .from('vecinos')
      .select('*')
      .eq('edificio_id', edificio.id)
      .eq('departamento', depto.trim().toUpperCase())
      .single()

    if (!vecinoExistente) {
      const { data: nuevo, error } = await supabase
        .from('vecinos')
        .insert({ nombre: nombre.trim(), departamento: depto.trim().toUpperCase(), edificio_id: edificio.id, email: '' })
        .select()
        .single()
      if (error) { setError('Error al registrar. Intentá de nuevo.'); setLoading(false); return }
      vecinoExistente = nuevo
    }

    onLogin({ ...vecinoExistente, edificio })
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 28 }}>
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏢</div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, lineHeight: 1.1 }}>
          Bienvenido a<br /><span style={{ color: 'var(--accent)' }}>FixHub</span>
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 8, fontSize: 15 }}>Tu edificio sin drama.</p>
      </div>

      {step === 1 && (
        <>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block' }}>
            Código de tu edificio
          </label>
          <input
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            placeholder="Ej: EDIF01"
            style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '14px 16px', color: 'var(--text)',
              fontFamily: 'DM Sans, sans-serif', fontSize: 16, width: '100%',
              marginBottom: 12, letterSpacing: '0.1em'
            }}
          />
          {error && <p style={{ color: 'var(--accent2)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button onClick={buscarEdificio} disabled={loading || !codigo.trim()} style={{
            background: 'var(--accent)', color: '#0f0f12', borderRadius: 14,
            padding: '15px', fontFamily: 'Syne, sans-serif', fontSize: 15,
            fontWeight: 800, width: '100%', opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Buscando...' : 'Continuar →'}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div style={{ background: 'var(--surface2)', borderRadius: 14, padding: '14px 16px', marginBottom: 20, border: '1px solid rgba(0,229,160,0.2)' }}>
            <p style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Edificio encontrado</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginTop: 2 }}>{edificio.nombre}</p>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>{edificio.direccion}</p>
          </div>

          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block' }}>Tu nombre</label>
          <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Martín García"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', fontSize: 15, width: '100%', marginBottom: 12 }} />

          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block' }}>Tu departamento</label>
          <input value={depto} onChange={e => setDepto(e.target.value)} placeholder="Ej: 4B"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', fontSize: 15, width: '100%', marginBottom: 12 }} />

          {error && <p style={{ color: 'var(--accent2)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button onClick={entrar} disabled={loading} style={{
            background: 'var(--accent)', color: '#0f0f12', borderRadius: 14,
            padding: '15px', fontFamily: 'Syne, sans-serif', fontSize: 15,
            fontWeight: 800, width: '100%', opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Entrando...' : 'Entrar →'}
          </button>
          <button onClick={() => { setStep(1); setError('') }} style={{ background: 'none', color: 'var(--muted)', marginTop: 12, width: '100%', padding: 10, fontSize: 13 }}>
            ← Cambiar código
          </button>
        </>
      )}
    </div>
  )
}
