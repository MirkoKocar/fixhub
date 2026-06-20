import React, { useEffect, useState } from 'react'

export default function Welcome({ onContinue }) {
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '64px 32px 40px', background: '#0A1428', maxWidth: 430, margin: '0 auto', position: 'relative', overflow: 'hidden' }}>

      {/* ambient blobs */}
      <div style={{ position: 'absolute', top: '-10%', right: '-20%', width: '70%', height: '40%', background: 'radial-gradient(circle, rgba(224,176,94,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '-25%', width: '75%', height: '45%', background: 'radial-gradient(circle, rgba(96,165,250,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />

      <div /> {/* spacer */}

      {/* Drawing animation — building forming from a single line */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <svg width="220" height="220" viewBox="0 0 220 220" fill="none">
          {/* Building outline drawn with stroke-dashoffset animation */}
          <g stroke="#E0B05E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Main building structure */}
            <path d="M70 190 L70 70 L150 70 L150 190" 
              style={{ strokeDasharray: 400, strokeDashoffset: drawn ? 0 : 400, transition: 'stroke-dashoffset 1.8s cubic-bezier(.65,0,.35,1)' }} />
            {/* Roof line */}
            <path d="M60 70 L110 40 L160 70" 
              style={{ strokeDasharray: 150, strokeDashoffset: drawn ? 0 : 150, transition: 'stroke-dashoffset 1s cubic-bezier(.65,0,.35,1) 1.6s' }} />
            {/* Windows row 1 */}
            <path d="M82 95 L92 95 L92 105 L82 105 Z M128 95 L138 95 L138 105 L128 105 Z" 
              style={{ strokeDasharray: 90, strokeDashoffset: drawn ? 0 : 90, transition: 'stroke-dashoffset 0.8s ease 2.2s' }} />
            {/* Windows row 2 */}
            <path d="M82 120 L92 120 L92 130 L82 130 Z M128 120 L138 120 L138 130 L128 130 Z" 
              style={{ strokeDasharray: 90, strokeDashoffset: drawn ? 0 : 90, transition: 'stroke-dashoffset 0.8s ease 2.5s' }} />
            {/* Door */}
            <path d="M100 190 L100 155 L120 155 L120 190" 
              style={{ strokeDasharray: 90, strokeDashoffset: drawn ? 0 : 90, transition: 'stroke-dashoffset 0.8s ease 2.8s' }} />
            {/* Ground line extending */}
            <path d="M40 190 L180 190" 
              style={{ strokeDasharray: 150, strokeDashoffset: drawn ? 0 : 150, transition: 'stroke-dashoffset 0.9s ease 3.1s' }} />
            {/* Decorative flourish - small diamond on top */}
            <path d="M110 40 L110 30 M105 35 L115 35" 
              style={{ strokeDasharray: 30, strokeDashoffset: drawn ? 0 : 30, transition: 'stroke-dashoffset 0.5s ease 3.5s' }} />
          </g>
          {/* center dot accent */}
          <circle cx="110" cy="30" r="2.5" fill="#E0B05E" style={{ opacity: drawn ? 1 : 0, transition: 'opacity 0.5s ease 3.8s' }} />
        </svg>
      </div>

      {/* Brand text */}
      <div className="fade-up" style={{ textAlign: 'center', width: '100%' }}>
        <p className="font-cormorant animate-ornament" style={{ fontSize: 9, letterSpacing: '0.5em', color: '#E0B05E', marginBottom: 14 }}>✦ &nbsp; ✦ &nbsp; ✦</p>
        <h1 className="font-cormorant" style={{ fontSize: 32, fontWeight: 700, color: '#F2E0C9', letterSpacing: '-0.01em', lineHeight: 1.05, marginBottom: 8 }}>
          Residencia<br /><em style={{ fontWeight: 400, color: 'rgba(224,176,94,0.75)' }}>&amp; Confort.</em>
        </h1>
        <p style={{ fontSize: 11, color: 'rgba(180,190,205,0.4)', letterSpacing: '0.14em', fontStyle: 'italic', marginBottom: 32 }}>
          La gestión de tu edificio, simplificada.
        </p>

        <button onClick={onContinue} style={{
          width: '100%', background: 'linear-gradient(135deg, #E0B05E 0%, #D49A45 100%)',
          border: 'none', borderRadius: 999, padding: '15px',
          fontSize: 14, fontWeight: 700, color: '#0A1428', letterSpacing: '0.04em',
          boxShadow: '0 4px 20px rgba(224,176,94,0.3)'
        }}>
          Ingresar a FixHub
        </button>
      </div>
    </div>
  )
}
