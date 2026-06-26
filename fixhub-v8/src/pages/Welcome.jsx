import React, { useEffect, useState } from 'react'

export default function Welcome({ onContinue }) {
  const [phase, setPhase] = useState(0)
  // phase 0: drawing, phase 1: text appears, phase 2: button appears

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1800)
    const t2 = setTimeout(() => setPhase(2), 2600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div style={{ height:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-between', padding:'60px 32px 44px', background:'#0A1428', maxWidth:430, margin:'0 auto', position:'relative', overflow:'hidden' }}>

      {/* Animated blobs */}
      <div style={{position:'absolute',top:'-10%',right:'-20%',width:'70%',height:'40%',background:'radial-gradient(circle,rgba(224,176,94,0.07) 0%,transparent 70%)',borderRadius:'50%',animation:'blobFloat 12s ease-in-out infinite'}}/>
      <div style={{position:'absolute',bottom:'-10%',left:'-20%',width:'65%',height:'40%',background:'radial-gradient(circle,rgba(96,165,250,0.04) 0%,transparent 70%)',borderRadius:'50%',animation:'blobFloat 12s ease-in-out infinite',animationDelay:'-5s'}}/>

      <div/>

      {/* SVG Building animation */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <svg width="200" height="210" viewBox="0 0 200 210" fill="none">
          {/* Base building */}
          <path d="M55 190 L55 75 L145 75 L145 190"
            stroke="#E0B05E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            style={{strokeDasharray:500,strokeDashoffset:500,animation:'drawPath 1.6s cubic-bezier(.65,0,.35,1) 0.2s forwards'}}/>
          {/* Roof */}
          <path d="M45 75 L100 42 L155 75"
            stroke="#E0B05E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            style={{strokeDasharray:160,strokeDashoffset:160,animation:'drawPath 0.9s cubic-bezier(.65,0,.35,1) 1.4s forwards'}}/>
          {/* Windows row 1 */}
          <path d="M68 100 L80 100 L80 112 L68 112 Z M120 100 L132 100 L132 112 L120 112 Z"
            stroke="#E0B05E" strokeWidth="1.4" strokeLinecap="round"
            style={{strokeDasharray:100,strokeDashoffset:100,animation:'drawPath 0.7s ease 2s forwards',opacity:0.7}}/>
          {/* Windows row 2 */}
          <path d="M68 126 L80 126 L80 138 L68 138 Z M120 126 L132 126 L132 138 L120 138 Z"
            stroke="#E0B05E" strokeWidth="1.4" strokeLinecap="round"
            style={{strokeDasharray:100,strokeDashoffset:100,animation:'drawPath 0.7s ease 2.3s forwards',opacity:0.7}}/>
          {/* Windows row 3 */}
          <path d="M68 152 L80 152 L80 164 L68 164 Z M120 152 L132 152 L132 164 L120 164 Z"
            stroke="#E0B05E" strokeWidth="1.4" strokeLinecap="round"
            style={{strokeDasharray:100,strokeDashoffset:100,animation:'drawPath 0.7s ease 2.5s forwards',opacity:0.7}}/>
          {/* Door */}
          <path d="M88 190 L88 168 L112 168 L112 190"
            stroke="#E0B05E" strokeWidth="1.6" strokeLinecap="round"
            style={{strokeDasharray:90,strokeDashoffset:90,animation:'drawPath 0.6s ease 2.7s forwards'}}/>
          {/* Ground */}
          <path d="M30 190 L170 190"
            stroke="#E0B05E" strokeWidth="1.5" strokeLinecap="round"
            style={{strokeDasharray:150,strokeDashoffset:150,animation:'drawPath 0.7s ease 3s forwards',opacity:0.5}}/>
          {/* Roof accent */}
          <path d="M100 42 L100 32"
            stroke="#E0B05E" strokeWidth="1.4" strokeLinecap="round"
            style={{strokeDasharray:20,strokeDashoffset:20,animation:'drawPath 0.4s ease 3.3s forwards',opacity:0.6}}/>
          {/* Glow dot top */}
          <circle cx="100" cy="30" r="3" fill="#E0B05E"
            style={{opacity:0,animation:'fadeIn 0.5s ease 3.5s forwards'}}/>
        </svg>
      </div>

      {/* Text */}
      <div style={{textAlign:'center',width:'100%',opacity:phase>=1?1:0,transition:'opacity 0.7s ease, transform 0.7s ease',transform:phase>=1?'translateY(0)':'translateY(12px)'}}>
        <p style={{fontSize:9,letterSpacing:'0.45em',color:'rgba(224,176,94,0.5)',textTransform:'uppercase',marginBottom:12,fontWeight:600}}>✦ &nbsp; ✦ &nbsp; ✦</p>
        <h1 className="font-serif" style={{fontSize:34,color:'#F2E0C9',lineHeight:1.05,marginBottom:8}}>
          Residencia<br/><em style={{color:'rgba(224,176,94,0.75)',fontStyle:'italic'}}>&amp; Confort.</em>
        </h1>
        <p style={{fontSize:12,color:'rgba(180,190,205,0.38)',letterSpacing:'0.1em',marginBottom:36}}>
          La gestión de tu edificio, simplificada.
        </p>

        <div style={{opacity:phase>=2?1:0,transition:'opacity 0.5s ease',transform:phase>=2?'translateY(0)':'translateY(8px)'}}>
          <button onClick={onContinue} style={{
            width:'100%',background:'linear-gradient(135deg,#E0B05E 0%,#C9923A 100%)',
            border:'none',borderRadius:999,padding:'16px',
            fontSize:15,fontWeight:700,color:'#0A1428',letterSpacing:'0.02em',
            boxShadow:'0 4px 22px rgba(224,176,94,0.32)'
          }}>
            Ingresar a FixHub
          </button>
        </div>
      </div>
    </div>
  )
}
