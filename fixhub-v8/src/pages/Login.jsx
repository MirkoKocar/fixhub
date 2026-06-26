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
const rolColors = { vecino: '#34d399', admin: '#fbbf24', proveedor: '#60a5fa' }

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

  const inputStyle = { width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(217,203,176,0.15)', borderRadius:999, padding:'13px 20px', color:'#F2E0C9', fontSize:14, fontFamily:"'DM Sans',sans-serif", fontWeight:500 }

  return (
    <div style={{ height:'100dvh', display:'flex', flexDirection:'column', padding:'0 26px', overflow:'hidden', position:'relative' }}>
      <div style={{position:'absolute',top:'5%',right:'-15%',width:'60%',height:'30%',background:'radial-gradient(circle,rgba(224,176,94,0.06) 0%,transparent 70%)',borderRadius:'50%',pointerEvents:'none'}}/>

      {/* Brand */}
      <div style={{paddingTop:44,textAlign:'center',flexShrink:0}} className="fade-up">
        <p style={{fontSize:9,letterSpacing:'0.45em',color:'rgba(224,176,94,0.45)',marginBottom:10,fontWeight:600}}>✦ &nbsp; ✦ &nbsp; ✦</p>
        <h1 className="font-serif" style={{fontSize:30,color:'#F2E0C9',lineHeight:1.0,marginBottom:6}}>
          Residencia<br/><em style={{color:'rgba(224,176,94,0.65)',fontStyle:'italic'}}>&amp; Confort.</em>
        </h1>
        <p style={{fontSize:10,color:'rgba(180,190,205,0.3)',letterSpacing:'0.14em',fontStyle:'italic'}}>Tu espacio. Tu tranquilidad.</p>
        <div style={{margin:'16px 0',display:'flex',alignItems:'center',gap:10,opacity:0.13}}>
          <div style={{flex:1,height:1,background:'linear-gradient(to right,transparent,rgba(224,176,94,0.7))'}}/>
          {[0,1,2].map(i=><div key={i} style={{width:4,height:4,border:'1px solid rgba(224,176,94,0.9)',transform:'rotate(45deg)'}}/>)}
          <div style={{flex:1,height:1,background:'linear-gradient(to left,transparent,rgba(224,176,94,0.7))'}}/>
        </div>
      </div>

      {/* Form */}
      <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center'}} className="fade-up-2">
        {step === 1 && (
          <div>
            <p style={{fontSize:9,letterSpacing:'0.22em',color:'rgba(180,190,205,0.28)',textTransform:'uppercase',marginBottom:14,textAlign:'center',fontWeight:600}}>
              VEC · ADM · PRO — código del edificio
            </p>
            {/* Input compacto */}
            <div style={{position:'relative',marginBottom:10}}>
              <input ref={inputRef} value={input}
                onChange={e=>{setInput(e.target.value);setError('')}}
                onKeyDown={e=>e.key==='Enter'&&handleCode()}
                placeholder="VEC-EDIFICIO1"
                style={{...inputStyle,padding:'12px 48px 12px 20px',fontSize:17,fontWeight:700,letterSpacing:'0.07em',textTransform:'uppercase',caretColor:'#E0B05E'}}
              />
              <button onClick={handleCode} disabled={loading} style={{
                position:'absolute',right:5,top:'50%',transform:'translateY(-50%)',
                width:36,height:36,borderRadius:'50%',
                background:input.trim()?'linear-gradient(135deg,#E0B05E,#C9923A)':'rgba(255,255,255,0.05)',
                border:'none',color:input.trim()?'#0A1428':'rgba(180,190,205,0.3)',
                display:'flex',alignItems:'center',justifyContent:'center',boxShadow:input.trim()?'0 2px 10px rgba(224,176,94,0.3)':'none'
              }}>
                {loading?<span style={{fontSize:9}}>···</span>:<svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>}
              </button>
            </div>
            {error&&<p style={{color:'#f87171',fontSize:11,textAlign:'center',marginBottom:10,fontWeight:500}}>{error}</p>}
            {/* Prefijos compactos */}
            <div style={{display:'flex',gap:7,justifyContent:'center',marginTop:10}}>
              {[['VEC-','#34d399'],['ADM-','#fbbf24'],['PRO-','#60a5fa']].map(([p,c])=>(
                <button key={p} onClick={()=>setInput(p)} style={{padding:'5px 13px',borderRadius:999,background:`${c}0C`,border:`1px solid ${c}28`,color:c,fontSize:9.5,fontWeight:700,letterSpacing:'0.08em'}}>{p}</button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{display:'flex',flexDirection:'column',gap:10}} className="scale-in">
            <div style={{padding:'13px 16px',background:`linear-gradient(135deg,${rolColors[parsed?.rol]}0D,transparent)`,border:`1px solid ${rolColors[parsed?.rol]}22`,borderRadius:18,textAlign:'center',marginBottom:2}}>
              <p style={{fontSize:9,letterSpacing:'0.24em',color:rolColors[parsed?.rol],textTransform:'uppercase',marginBottom:4,fontWeight:700}}>{rolLabels[parsed?.rol]}</p>
              <p className="font-serif" style={{fontSize:19,color:'#F2E0C9'}}>{edificio?.nombre}</p>
              <p style={{fontSize:10,color:'rgba(180,190,205,0.32)',marginTop:2}}>{edificio?.direccion}</p>
            </div>
            <input ref={inputRef} value={nombre} onChange={e=>{setNombre(e.target.value);setError('')}} onKeyDown={e=>e.key==='Enter'&&!depto&&handleEnter()} placeholder={parsed?.rol==='admin'?'PIN de administrador':'Nombre completo'} type={parsed?.rol==='admin'?'password':'text'} style={inputStyle}/>
            {parsed?.rol==='vecino'&&(
              <input value={depto} onChange={e=>{setDepto(e.target.value);setError('')}} onKeyDown={e=>e.key==='Enter'&&handleEnter()} placeholder="Departamento (ej: 4B)" style={{...inputStyle,letterSpacing:'0.07em',textTransform:'uppercase'}}/>
            )}
            {error&&<p style={{color:'#f87171',fontSize:11,textAlign:'center',fontWeight:500}}>{error}</p>}
            <button onClick={handleEnter} disabled={loading} style={{width:'100%',background:'linear-gradient(135deg,#E0B05E,#C9923A)',border:'none',borderRadius:999,padding:'14px',fontSize:15,fontWeight:700,color:'#0A1428',letterSpacing:'0.02em',boxShadow:'0 4px 18px rgba(224,176,94,0.28)',opacity:loading?0.6:1,marginTop:2}}>
              {loading?'Ingresando...':'Ingresar'}
            </button>
            <button onClick={()=>{setStep(1);setError('');setParsed(null);setEdificio(null)}} style={{color:'rgba(180,190,205,0.22)',fontSize:10,padding:'6px',letterSpacing:'0.1em',textTransform:'uppercase',textAlign:'center',fontWeight:600}}>← Volver</button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{paddingBottom:22,textAlign:'center',flexShrink:0}} className="fade-up-3">
        <div style={{display:'flex',justifyContent:'center',gap:24,marginBottom:10,opacity:0.15}}>
          {[['M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z','Protegido'],['M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z','24/7'],['M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0','En vivo']].map(([d,label])=>(
            <div key={label} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
              <svg width="15" height="15" fill="none" stroke="#E0B05E" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={d}/></svg>
              <span style={{fontSize:7,textTransform:'uppercase',letterSpacing:'0.25em',color:'#E0B05E',fontWeight:600}}>{label}</span>
            </div>
          ))}
        </div>
        <p style={{fontSize:7.5,letterSpacing:'0.38em',textTransform:'uppercase',color:'rgba(224,176,94,0.12)',fontWeight:600}}>— FixHub · 2026 —</p>
      </div>
    </div>
  )
}
