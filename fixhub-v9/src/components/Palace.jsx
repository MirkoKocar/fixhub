import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export const PalaceFrame = () => (
  <div className="blob-container">
    <div className="blob blob-1"/>
    <div className="blob blob-2"/>
    <div className="blob blob-3"/>
    <div className="blob blob-4"/>
  </div>
)

export const OrnamentLine = ({opacity=0.15}) => (
  <div style={{display:'flex',alignItems:'center',gap:10,opacity}}>
    <div style={{height:1,flex:1,background:'linear-gradient(to right,transparent,rgba(224,176,94,0.6))'}}/>
    <span className="font-serif" style={{fontSize:8,color:'#E0B05E'}}>✦</span>
    <div style={{height:1,flex:1,background:'linear-gradient(to left,transparent,rgba(224,176,94,0.6))'}}/>
  </div>
)

export const DiamondRow = ({count=3,opacity=0.18}) => (
  <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,opacity,margin:'4px 0'}}>
    {Array.from({length:count}).map((_,i)=>(
      <div key={i} style={{width:5,height:5,border:'1px solid rgba(224,176,94,0.8)',transform:'rotate(45deg)'}}/>
    ))}
  </div>
)

export const SectionLabel = ({children,style={}}) => (
  <p style={{fontSize:9,letterSpacing:'0.22em',color:'rgba(180,190,205,0.32)',textTransform:'uppercase',fontWeight:600,...style}}>{children}</p>
)

export const Card = ({children,style={},onClick}) => (
  <div onClick={onClick} style={{
    background:'rgba(255,255,255,0.03)',border:'1px solid rgba(217,203,176,0.09)',
    borderRadius:18,padding:'15px 16px',cursor:onClick?'pointer':'default',...style
  }}>{children}</div>
)

export const AccentCard = ({children,style={},onClick,accentColor='rgba(224,176,94,0.4)'}) => (
  <div onClick={onClick} style={{
    background:'rgba(255,255,255,0.02)',border:'1px solid rgba(217,203,176,0.08)',
    borderLeft:`3px solid ${accentColor}`,borderRadius:16,padding:'13px 16px',
    cursor:onClick?'pointer':'default',...style
  }}>{children}</div>
)

export const PrimaryBtn = ({children,onClick,disabled,style={}}) => (
  <button onClick={onClick} disabled={disabled} style={{
    width:'100%',
    background:disabled?'rgba(224,176,94,0.25)':'linear-gradient(135deg,#E0B05E 0%,#C9923A 100%)',
    border:'none',borderRadius:999,padding:'15px',
    fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:700,
    color:'#0A1428',letterSpacing:'0.02em',
    boxShadow:disabled?'none':'0 4px 18px rgba(224,176,94,0.28)',
    opacity:disabled?0.6:1,...style
  }}>{children}</button>
)

export const GhostBtn = ({children,onClick,style={}}) => (
  <button onClick={onClick} style={{
    width:'100%',background:'rgba(255,255,255,0.03)',
    border:'1px solid rgba(217,203,176,0.15)',borderRadius:999,padding:'13px',
    fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,
    color:'rgba(242,224,201,0.55)',letterSpacing:'0.02em',...style
  }}>{children}</button>
)

export const StatusBadge = ({estado}) => {
  const map={nuevo:['#f87171','Nuevo'],en_curso:['#fbbf24','En curso'],resuelto:['#34d399','Resuelto']}
  const [c,label]=map[estado]||['#A0AEC0',estado]
  return <span style={{fontSize:9,fontWeight:700,padding:'4px 11px',borderRadius:999,background:`${c}15`,color:c,whiteSpace:'nowrap',letterSpacing:'0.04em',textTransform:'uppercase',border:`1px solid ${c}22`}}>{label}</span>
}

export const UrgenciaBadge = ({urgencia}) => {
  const map={baja:['#34d399','Baja'],media:['#fbbf24','Media'],alta:['#f87171','Alta']}
  const [c,label]=map[urgencia]||['#A0AEC0',urgencia]
  return <span style={{fontSize:9,fontWeight:700,padding:'4px 11px',borderRadius:999,background:`${c}12`,color:c,letterSpacing:'0.04em',textTransform:'uppercase'}}>{label}</span>
}

export const SkeletonCard = ({lines=2}) => (
  <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(217,203,176,0.07)',borderRadius:18,padding:'15px 16px'}}>
    {Array.from({length:lines}).map((_,i)=>(
      <div key={i} className="skeleton" style={{height:12,width:i===0?'70%':'45%',marginBottom:i<lines-1?8:0}}/>
    ))}
  </div>
)

export const AnimCounter = ({value,color='#F2E0C9',size=32}) => {
  const [display,setDisplay]=useState(0)
  useEffect(()=>{
    let start=0; const end=parseInt(value)||0
    if(end===0){setDisplay(0);return}
    const step=Math.ceil(end/20)
    const timer=setInterval(()=>{
      start+=step
      if(start>=end){setDisplay(end);clearInterval(timer)}
      else setDisplay(start)
    },40)
    return ()=>clearInterval(timer)
  },[value])
  return <p className="font-serif" style={{fontSize:size,color,lineHeight:1}}>{display}</p>
}

export const NotifBanner = ({message,onClose}) => (
  <div className="slide-down" style={{
    position:'fixed',top:0,left:'50%',transform:'translateX(-50%)',
    width:'100%',maxWidth:430,zIndex:200,
    padding:'12px 20px',background:'rgba(17,32,59,0.98)',backdropFilter:'blur(20px)',
    borderBottom:'1px solid rgba(224,176,94,0.2)',
    display:'flex',justifyContent:'space-between',alignItems:'center'
  }}>
    <div style={{display:'flex',alignItems:'center',gap:10}}>
      <div style={{width:8,height:8,borderRadius:'50%',background:'#E0B05E',flexShrink:0,boxShadow:'0 0 10px rgba(224,176,94,0.7)'}}/>
      <p style={{fontSize:13,color:'rgba(242,224,201,0.88)',fontWeight:500}}>{message}</p>
    </div>
    <button onClick={onClose} style={{fontSize:18,color:'rgba(180,190,205,0.4)',padding:'0 4px'}}>×</button>
  </div>
)

export const PageHeader = ({title,subtitle,onBack,extra}) => (
  <div style={{padding:'44px 20px 18px',textAlign:'center',position:'relative'}}>
    {onBack&&(
      <button onClick={onBack} style={{position:'absolute',left:16,top:48,color:'rgba(180,190,205,0.4)',fontSize:11,letterSpacing:'0.06em',display:'flex',alignItems:'center',gap:5,background:'rgba(255,255,255,0.04)',padding:'7px 14px',borderRadius:999,border:'1px solid rgba(217,203,176,0.1)',fontWeight:600}}>
        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        Volver
      </button>
    )}
    <p className="animate-ornament" style={{color:'#E0B05E',fontSize:9,letterSpacing:'0.5em',marginBottom:10,opacity:0.55}}>✦ ✦ ✦</p>
    <h1 className="font-serif" style={{fontSize:26,color:'#F2E0C9',lineHeight:1.1,marginBottom:subtitle?4:0}}>{title}</h1>
    {subtitle&&<p style={{fontSize:10,color:'rgba(180,190,205,0.35)',letterSpacing:'0.07em',fontWeight:500}}>{subtitle}</p>}
    {extra&&<div style={{marginTop:10}}>{extra}</div>}
    <div style={{marginTop:12}}><OrnamentLine/></div>
  </div>
)

// Action button — tipográfico, sin iconos
export const ActionBtn = ({label,sub,onClick,accent=false}) => (
  <div onClick={onClick} style={{
    background: accent ? 'rgba(224,176,94,0.07)' : 'rgba(255,255,255,0.03)',
    border: `1px solid ${accent ? 'rgba(224,176,94,0.2)' : 'rgba(217,203,176,0.09)'}`,
    borderRadius:16,padding:'16px 15px',cursor:'pointer',
    display:'flex',flexDirection:'column',gap:4,position:'relative',overflow:'hidden'
  }}>
    <div style={{position:'absolute',top:0,left:14,right:14,height:1,background:'linear-gradient(to right,transparent,rgba(224,176,94,0.15),transparent)'}}/>
    <p style={{fontSize:13,fontWeight:700,color: accent ? '#E0B05E' : 'rgba(242,224,201,0.88)',lineHeight:1.2}}>{label}</p>
    {sub && <p style={{fontSize:9.5,color:'rgba(180,190,205,0.3)',fontWeight:500}}>{sub}</p>}
  </div>
)

const navConfigs = {
  vecino:[
    {path:'/',label:'Inicio',d:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'},
    {path:'/aviso',label:'Reportar',d:'M12 4v16m8-8H4'},
    {path:'/avisos',label:'Avisos',d:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'},
    {path:'/servicios',label:'Servicios',d:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0'},
    {path:'/config',label:'Ajustes',d:'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'},
  ],
  admin:[
    {path:'/',label:'Panel',d:'M4 6h16M4 10h16M4 14h16M4 18h16'},
    {path:'/admin/avisos',label:'Avisos',d:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'},
    {path:'/admin/proveedores',label:'Servicios',d:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0'},
    {path:'/admin/stats',label:'Métricas',d:'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'},
    {path:'/admin/mas',label:'Más',d:'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z'},
  ],
  proveedor:[
    {path:'/',label:'Inicio',d:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'},
    {path:'/proveedor/mensajes',label:'Mensajes',d:'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'},
    {path:'/proveedor/agenda',label:'Agenda',d:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'},
    {path:'/config',label:'Ajustes',d:'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'},
  ]
}

export const BottomNav = ({rol='vecino'}) => {
  const navigate=useNavigate()
  const location=useLocation()
  const items=navConfigs[rol]||navConfigs.vecino
  const containerRef=useRef(null)
  const [indStyle,setIndStyle]=useState({left:0,width:0,opacity:0})
  const activeIndex=items.findIndex(i=>i.path===location.pathname)

  useEffect(()=>{
    if(!containerRef.current||activeIndex===-1)return
    const btn=containerRef.current.children[activeIndex]
    if(btn) setIndStyle({left:btn.offsetLeft+btn.offsetWidth/2-18,width:36,opacity:1})
  },[activeIndex,location.pathname])

  return (
    <nav style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:430,background:'rgba(10,20,40,0.97)',backdropFilter:'blur(28px)',borderTop:'1px solid rgba(217,203,176,0.07)',padding:'10px 0 26px',zIndex:40}}>
      <div style={{position:'absolute',top:5,height:3,borderRadius:999,background:'linear-gradient(90deg,#E0B05E,#C9923A)',boxShadow:'0 0 10px rgba(224,176,94,0.5)',transition:'left 0.38s cubic-bezier(.22,1,.36,1),width 0.38s',...indStyle}}/>
      <div ref={containerRef} style={{display:'flex',justifyContent:'space-around'}}>
        {items.map(item=>{
          const active=location.pathname===item.path
          return (
            <button key={item.path} onClick={()=>navigate(item.path)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,color:active?'#F2E0C9':'rgba(180,190,205,0.25)',padding:'4px 8px',minWidth:44}}>
              <div style={{width:32,height:32,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',background:active?'rgba(224,176,94,0.1)':'transparent',transition:'background 0.2s'}}>
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={item.d}/></svg>
              </div>
              <span style={{fontSize:7.5,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase'}}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
