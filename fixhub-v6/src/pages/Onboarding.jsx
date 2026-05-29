import React, { useState } from 'react'

const pasos = [
  {
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    titulo: 'Bienvenido a FixHub',
    desc: 'La plataforma de gestión de tu edificio. Todo lo que necesitás, en un solo lugar.',
  },
  {
    icon: 'M12 4v16m8-8H4',
    titulo: 'Reportá problemas',
    desc: 'Creá un aviso cuando algo no funcione. Asigná un proveedor y seguí el estado en tiempo real.',
  },
  {
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    titulo: 'Reservá espacios',
    desc: 'SUM, gimnasio, laundry y terraza disponibles para reservar desde la app con fecha y hora.',
  },
]

export default function Onboarding({ onFinish }) {
  const [paso, setPaso] = useState(0)
  const actual = pasos[paso]

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '48px 32px 36px', background: '#071020', maxWidth: 430, margin: '0 auto' }}>

      {/* Skip */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onFinish} style={{ fontSize: 10, color: 'rgba(160,174,192,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Saltar</button>
      </div>

      {/* Content */}
      <div key={paso} className="fade-up" style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Ornamental icon */}
        <div style={{ position: 'relative', marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, border: '1px solid rgba(217,203,176,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(242,224,201,0.03)' }}>
            <svg width="28" height="28" fill="none" stroke="rgba(217,203,176,0.55)" strokeWidth="1.1" strokeLinecap="round" viewBox="0 0 24 24">
              <path d={actual.icon} />
            </svg>
          </div>
          {/* corner accents */}
          {[{top:-4,left:-4,borderTop:'1px solid rgba(217,203,176,0.35)',borderLeft:'1px solid rgba(217,203,176,0.35)'},
            {top:-4,right:-4,borderTop:'1px solid rgba(217,203,176,0.35)',borderRight:'1px solid rgba(217,203,176,0.35)'},
            {bottom:-4,left:-4,borderBottom:'1px solid rgba(217,203,176,0.35)',borderLeft:'1px solid rgba(217,203,176,0.35)'},
            {bottom:-4,right:-4,borderBottom:'1px solid rgba(217,203,176,0.35)',borderRight:'1px solid rgba(217,203,176,0.35)'},
          ].map((s,i) => <div key={i} style={{ position:'absolute', width:10, height:10, ...s }} />)}
        </div>

        <p className="font-cormorant animate-ornament" style={{ fontSize: 9, letterSpacing: '0.5em', color: '#D9CBB0', marginBottom: 14 }}>✦ ✦ ✦</p>
        <h2 className="font-cormorant" style={{ fontSize: 28, fontWeight: 700, color: '#F2E0C9', marginBottom: 12, lineHeight: 1.1 }}>{actual.titulo}</h2>
        <p style={{ fontSize: 13, color: 'rgba(160,174,192,0.45)', lineHeight: 1.7, maxWidth: 280 }}>{actual.desc}</p>
      </div>

      {/* Controls */}
      <div style={{ width: '100%' }}>
        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
          {pasos.map((_, i) => (
            <div key={i} style={{ width: 5, height: 5, border: `1px solid rgba(217,203,176,${i === paso ? '0.7' : '0.2'})`, transform: 'rotate(45deg)', background: i === paso ? 'rgba(217,203,176,0.3)' : 'transparent', transition: 'all 0.3s' }} />
          ))}
        </div>

        {paso < pasos.length - 1 ? (
          <button onClick={() => setPaso(p => p + 1)} style={{ width: '100%', background: 'rgba(242,224,201,0.88)', border: 'none', borderRadius: 4, padding: '13px', fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: '#071020', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Siguiente
          </button>
        ) : (
          <button onClick={onFinish} style={{ width: '100%', background: 'rgba(242,224,201,0.88)', border: 'none', borderRadius: 4, padding: '13px', fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: '#071020', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Ingresar a FixHub
          </button>
        )}
      </div>
    </div>
  )
}
