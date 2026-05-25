import React, { useState } from 'react'
import { supabase } from '../supabase'

const OrnamentLine = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: 0.25 }}>
    <div style={{ height: 1, width: 56, background: 'linear-gradient(to right, transparent, #D9CBB0)' }} />
    <span className="font-cormorant animate-ornament" style={{ fontSize: 10, color: '#D9CBB0' }}>✦</span>
    <div style={{ height: 1, width: 56, background: 'linear-gradient(to left, transparent, #D9CBB0)' }} />
  </div>
)

export default function Login({ onLogin }) {
  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [depto, setDepto] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [edificio, setEdificio] = useState(null)
  const [rol, setRol] = useState('vecino')

  const buscar = async () => {
    setLoading(true); setError('')
    const { data, error } = await supabase.from('edificios').select('*').eq('codigo_acceso', codigo.trim().toUpperCase()).single()
    if (error || !data) { setError('Código incorrecto.') }
    else { setEdificio(data); setStep(2) }
    setLoading(false)
  }

  const entrar = async () => {
    if (!nombre.trim()) { setError('Ingresá tu nombre.'); return }
    if (rol === 'vecino' && !depto.trim()) { setError('Ingresá tu departamento.'); return }
    setLoading(true)

    if (rol === 'vecino') {
      let { data: v } = await supabase.from('vecinos').select('*').eq('edificio_id', edificio.id).eq('departamento', depto.trim().toUpperCase()).single()
      if (!v) {
        const { data: nuevo, error: e } = await supabase.from('vecinos').insert({ nombre: nombre.trim(), departamento: depto.trim().toUpperCase(), edificio_id: edificio.id, email: '' }).select().single()
        if (e) { setError('Error al registrar.'); setLoading(false); return }
        v = nuevo
      }
      onLogin({ ...v, edificio, rol: 'vecino' })
    } else if (rol === 'admin') {
      onLogin({ nombre: nombre.trim(), edificio, rol: 'admin', id: edificio.id })
    } else {
      let { data: p } = await supabase.from('proveedores').select('*').eq('edificio_id', edificio.id).eq('nombre', nombre.trim()).single()
      if (!p) { setError('Proveedor no encontrado. Pedile al admin que te registre.'); setLoading(false); return }
      onLogin({ ...p, edificio, rol: 'proveedor' })
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', background: 'rgba(242,224,201,0.95)',
    border: '1px solid rgba(217,203,176,0.25)',
    color: '#000', fontFamily: "'Cormorant Garamond', serif",
    fontSize: 20, padding: '14px 20px', borderRadius: 8,
    textAlign: 'center', fontWeight: 700, letterSpacing: '0.1em',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: 32, position: 'relative' }}>

      {/* Top section */}
      <div style={{ textAlign: 'center', marginTop: 40, width: '100%' }}>
        <div className="font-cormorant animate-ornament" style={{ color: '#D9CBB0', fontSize: 12, letterSpacing: '0.5em', marginBottom: 20 }}>✦ ✦ ✦</div>

        <h1 className="font-cormorant" style={{ fontSize: 40, fontWeight: 700, color: '#F2E0C9', letterSpacing: '0.02em', marginBottom: 8 }}>
          Residencia <em style={{ fontWeight: 400, color: 'rgba(217,203,176,0.8)' }}>&</em> Confort.
        </h1>
        <p className="font-cormorant" style={{ fontStyle: 'italic', fontSize: 14, color: 'rgba(160,174,192,0.7)', letterSpacing: '0.05em', marginBottom: 24 }}>
          Tu espacio. Tu tranquilidad.
        </p>

        <OrnamentLine />

        <p style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.4em', color: 'rgba(160,174,192,0.8)', marginTop: 16 }}>
          Reportes <span style={{ color: 'rgba(217,203,176,0.3)', margin: '0 4px' }}>•</span>
          Proveedores <span style={{ color: 'rgba(217,203,176,0.3)', margin: '0 4px' }}>•</span>
          Avisos
        </p>
      </div>

      {/* Form */}
      <div style={{ width: '100%', maxWidth: 280, margin: '0 auto' }}>
        {step === 1 && (
          <>
            <input value={codigo} onChange={e => setCodigo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && buscar()}
              placeholder="Código de acceso" style={inputStyle} />
            {error && <p style={{ color: '#F2E0C9', fontSize: 12, textAlign: 'center', marginTop: 8, opacity: 0.7 }}>{error}</p>}
            <div className="animate-ornament" style={{ textAlign: 'center', color: '#D9CBB0', fontSize: 9, marginTop: 12, letterSpacing: '0.3em' }}>✦ ✦ ✦</div>
            <button onClick={buscar} disabled={loading} style={{ width: '100%', marginTop: 16, background: 'transparent', border: '1px solid rgba(217,203,176,0.2)', borderRadius: 8, padding: '12px', fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: 'rgba(242,224,201,0.7)', letterSpacing: '0.1em' }}>
              {loading ? 'Verificando...' : 'Continuar'}
            </button>
          </>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ textAlign: 'center', padding: '10px 16px', background: 'rgba(242,224,201,0.06)', border: '1px solid rgba(217,203,176,0.15)', borderRadius: 8 }}>
              <p className="font-cormorant" style={{ fontSize: 16, color: '#F2E0C9', fontWeight: 600 }}>{edificio.nombre}</p>
              <p style={{ fontSize: 11, color: 'rgba(160,174,192,0.6)', marginTop: 2 }}>{edificio.direccion}</p>
            </div>

            {/* Rol selector */}
            <div style={{ display: 'flex', gap: 6 }}>
              {['vecino', 'admin', 'proveedor'].map(r => (
                <button key={r} onClick={() => setRol(r)} style={{
                  flex: 1, padding: '8px 4px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                  background: rol === r ? 'rgba(242,224,201,0.12)' : 'transparent',
                  border: `1px solid ${rol === r ? 'rgba(217,203,176,0.3)' : 'rgba(217,203,176,0.1)'}`,
                  color: rol === r ? '#F2E0C9' : 'rgba(160,174,192,0.5)',
                  textTransform: 'capitalize', letterSpacing: '0.06em'
                }}>{r}</button>
              ))}
            </div>

            <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" style={{ ...inputStyle, fontSize: 16, letterSpacing: '0.04em' }} />
            {rol === 'vecino' && <input value={depto} onChange={e => setDepto(e.target.value)} placeholder="Depto (Ej: 4B)" style={{ ...inputStyle, fontSize: 16, letterSpacing: '0.08em' }} />}

            {error && <p style={{ color: '#F2E0C9', fontSize: 12, textAlign: 'center', opacity: 0.7 }}>{error}</p>}

            <button onClick={entrar} disabled={loading} style={{ width: '100%', background: 'rgba(242,224,201,0.92)', border: 'none', borderRadius: 8, padding: '14px', fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: '#071424', letterSpacing: '0.06em' }}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
            <button onClick={() => { setStep(1); setError('') }} style={{ background: 'none', color: 'rgba(160,174,192,0.4)', fontSize: 12, padding: 8, textAlign: 'center', width: '100%' }}>← Volver</button>
          </div>
        )}
      </div>

      {/* Bottom */}
      <div style={{ width: '100%', paddingBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16, opacity: 0.3 }}>
          <div style={{ height: 1, width: 64, background: 'linear-gradient(to right, transparent, rgba(217,203,176,0.4))' }} />
          <span style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.4em', color: '#D9CBB0', fontWeight: 600 }}>Acceso Seguro</span>
          <div style={{ height: 1, width: 64, background: 'linear-gradient(to left, transparent, rgba(217,203,176,0.4))' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, paddingBottom: 16, borderBottom: '1px solid rgba(217,203,176,0.1)' }}>
          {[
            { label: 'Protegido', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/> },
            { label: '24 / 7', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/> },
            { label: 'En Vivo', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/> },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 8, gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(217,203,176,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0AEC0' }}>
                <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
              </div>
              <span style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#A0AEC0' }}>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, opacity: 0.15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 8, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#D9CBB0' }}>
          <span>—</span><span>FixHub</span>
          <span className="font-cormorant animate-ornament" style={{ fontSize: 9 }}>✦</span>
          <span>2026</span><span>—</span>
        </div>
      </div>
    </div>
  )
}
