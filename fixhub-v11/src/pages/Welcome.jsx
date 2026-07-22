import React, { useEffect, useState } from 'react'

export default function Welcome({ onContinue }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2400)
    const t2 = setTimeout(() => setPhase(2), 3400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div style={{ height:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-between', padding:'60px 32px 44px', background:'#0A1428', maxWidth:430, margin:'0 auto', position:'relative', overflow:'hidden' }}>

      <div style={{position:'absolute',top:'-10%',right:'-20%',width:'70%',height:'40%',background:'radial-gradient(circle,rgba(224,176,94,0.08) 0%,transparent 70%)',borderRadius:'50%',animation:'blobTravel 18s ease-in-out infinite'}}/>
      <div style={{position:'absolute',bottom:'-10%',left:'-20%',width:'65%',height:'40%',background:'radial-gradient(circle,rgba(96,165,250,0.05) 0%,transparent 70%)',borderRadius:'50%',animation:'blobTravel 18s ease-in-out infinite',animationDelay:'-6s'}}/>
      <div style={{position:'absolute',top:'30%',left:'-10%',width:'50%',height:'30%',background:'radial-gradient(circle,rgba(224,176,94,0.05) 0%,transparent 70%)',borderRadius:'50%',animation:'blobTravel 22s ease-in-out infinite',animationDelay:'-12s'}}/>

      <div/>

      {/* SVG building — más lento y dinámico */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <svg width="200" height="220" viewBox="0 0 200 220" fill="none" style={{filter:'drop-shadow(0 0 4px rgba(224,176,94,0.2))'}}>
          {/* Main walls */}
          <path d="M55 195 L55 78 L145 78 L145 195"
            stroke="#E0B05E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            style={{strokeDasharray:520,strokeDashoffset:520,animation:'drawPath 2.2s cubic-bezier(.65,0,.35,1) 0.3s forwards'}}/>
          {/* Roof */}
          <path d="M44 78 L100 44 L156 78"
            stroke="#E0B05E" strokeWidth="1.8" strokeLinecap="round"
            style={{strokeDasharray:170,strokeDashoffset:170,animation:'drawPath 1.1s cubic-bezier(.65,0,.35,1) 2s forwards'}}/>
          {/* Floor dividers */}
          <path d="M55 118 L145 118 M55 158 L145 158"
            stroke="#E0B05E" strokeWidth="0.8" strokeLinecap="round" strokeDasharray="4 4"
            style={{strokeDasharray:200,strokeDashoffset:200,animation:'drawPath 1s ease 2.8s forwards',opacity:0.4}}/>
          {/* Windows row 1 */}
          <path d="M68 96 L82 96 L82 110 L68 110 Z"
            stroke="#E0B05E" strokeWidth="1.3"
            style={{strokeDasharray:56,strokeDashoffset:56,animation:'drawPath 0.6s ease 3s forwards',opacity:0.75}}/>
          <path d="M118 96 L132 96 L132 110 L118 110 Z"
            stroke="#E0B05E" strokeWidth="1.3"
            style={{strokeDasharray:56,strokeDashoffset:56,animation:'drawPath 0.6s ease 3.2s forwards',opacity:0.75}}/>
          {/* Windows row 2 */}
          <path d="M68 132 L82 132 L82 146 L68 146 Z"
            stroke="#E0B05E" strokeWidth="1.3"
            style={{strokeDasharray:56,strokeDashoffset:56,animation:'drawPath 0.6s ease 3.4s forwards',opacity:0.75}}/>
          <path d="M118 132 L132 132 L132 146 L118 146 Z"
            stroke="#E0B05E" strokeWidth="1.3"
            style={{strokeDasharray:56,strokeDashoffset:56,animation:'drawPath 0.6s ease 3.6s forwards',opacity:0.75}}/>
          {/* Door */}
          <path d="M87 195 L87 170 Q87 165 100 165 Q113 165 113 170 L113 195"
            stroke="#E0B05E" strokeWidth="1.5" strokeLinecap="round"
            style={{strokeDasharray:90,strokeDashoffset:90,animation:'drawPath 0.7s ease 3.8s forwards'}}/>
          {/* Door handle */}
          <circle cx="109" cy="181" r="2"
            fill="none" stroke="#E0B05E" strokeWidth="1.2"
            style={{opacity:0,animation:'fadeIn 0.4s ease 4.3s forwards'}}/>
          {/* Ground */}
          <path d="M25 195 L175 195"
            stroke="#E0B05E" strokeWidth="1.4" strokeLinecap="round"
            style={{strokeDasharray:160,strokeDashoffset:160,animation:'drawPath 0.8s ease 4s forwards',opacity:0.45}}/>
          {/* Flagpole on top */}
          <path d="M100 44 L100 28 M100 28 L112 33 L100 38"
            stroke="#E0B05E" strokeWidth="1.2" strokeLinecap="round"
            style={{strokeDasharray:40,strokeDashoffset:40,animation:'drawPath 0.5s ease 4.4s forwards',opacity:0.6}}/>
          {/* Stars flanking */}
          <circle cx="40" cy="90" r="1.5" fill="#E0B05E" style={{opacity:0,animation:'fadeIn 0.4s ease 4.6s forwards'}}/>
          <circle cx="160" cy="90" r="1.5" fill="#E0B05E" style={{opacity:0,animation:'fadeIn 0.4s ease 4.7s forwards'}}/>
          <circle cx="100" cy="26" r="2.5" fill="#E0B05E" style={{opacity:0,animation:'fadeIn 0.5s ease 4.5s forwards'}}/>
        </svg>
      </div>

      {/* Text & Button */}
      <div style={{textAlign:'center',width:'100%',opacity:phase>=1?1:0,transition:'opacity 0.8s ease, transform 0.8s ease',transform:phase>=1?'translateY(0)':'translateY(14px)'}}>
        <p style={{fontSize:9,letterSpacing:'0.45em',color:'rgba(224,176,94,0.45)',textTransform:'uppercase',marginBottom:12,fontWeight:600}}>✦ &nbsp; ✦ &nbsp; ✦</p>
        <h1 className="font-serif" style={{fontSize:34,color:'#F2E0C9',lineHeight:1.05,marginBottom:8}}>
          Residencia<br/><em style={{color:'rgba(224,176,94,0.72)',fontStyle:'italic'}}>&amp; Confort.</em>
        </h1>
        <p style={{fontSize:12,color:'rgba(180,190,205,0.36)',letterSpacing:'0.1em',marginBottom:36,fontWeight:400}}>
          La gestión de tu edificio, simplificada.
        </p>
        <div style={{opacity:phase>=2?1:0,transition:'opacity 0.5s ease, transform 0.5s ease',transform:phase>=2?'translateY(0)':'translateY(8px)'}}>
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
