import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home, Plus, ClipboardList, Wrench, Settings,
  LayoutDashboard, BarChart3, MoreHorizontal,
  MessageSquare, Calendar, History,
  ChevronLeft, ChevronRight, X, Send,
  Check, Bell, Phone, LogOut,
  Building2, Users, Trash2, Shield,
  Sun, Moon, BellOff, Info
} from 'lucide-react'

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
  <div onClick={onClick} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(217,203,176,0.09)',borderRadius:18,padding:'15px 16px',cursor:onClick?'pointer':'default',...style}}>{children}</div>
)

export const AccentCard = ({children,style={},onClick,accentColor='rgba(224,176,94,0.4)'}) => (
  <div onClick={onClick} style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(217,203,176,0.08)',borderLeft:`3px solid ${accentColor}`,borderRadius:16,padding:'13px 16px',cursor:onClick?'pointer':'default',...style}}>{children}</div>
)

export const PrimaryBtn = ({children,onClick,disabled,style={}}) => (
  <button onClick={onClick} disabled={disabled} style={{width:'100%',background:disabled?'rgba(224,176,94,0.25)':'linear-gradient(135deg,#E0B05E 0%,#C9923A 100%)',border:'none',borderRadius:999,padding:'15px',fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:700,color:'#0A1428',letterSpacing:'0.02em',boxShadow:disabled?'none':'0 4px 18px rgba(224,176,94,0.28)',opacity:disabled?0.6:1,...style}}>{children}</button>
)

export const GhostBtn = ({children,onClick,style={}}) => (
  <button onClick={onClick} style={{width:'100%',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(217,203,176,0.15)',borderRadius:999,padding:'13px',fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:'rgba(242,224,201,0.55)',...style}}>{children}</button>
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
    let start=0;const end=parseInt(value)||0
    if(end===0){setDisplay(0);return}
    const step=Math.ceil(end/20)
    const timer=setInterval(()=>{start+=step;if(start>=end){setDisplay(end);clearInterval(timer)}else setDisplay(start)},40)
    return ()=>clearInterval(timer)
  },[value])
  return <p className="font-serif" style={{fontSize:size,color,lineHeight:1}}>{display}</p>
}

export const NotifBanner = ({message,onClose}) => (
  <div className="slide-down" style={{position:'fixed',top:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:430,zIndex:200,padding:'12px 20px',background:'rgba(17,32,59,0.98)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(224,176,94,0.2)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
    <div style={{display:'flex',alignItems:'center',gap:10}}>
      <div style={{width:8,height:8,borderRadius:'50%',background:'#E0B05E',flexShrink:0,boxShadow:'0 0 10px rgba(224,176,94,0.7)'}}/>
      <p style={{fontSize:13,color:'rgba(242,224,201,0.88)',fontWeight:500}}>{message}</p>
    </div>
    <button onClick={onClose} style={{color:'rgba(180,190,205,0.4)',padding:'0 4px',background:'none',border:'none'}}><X size={16}/></button>
  </div>
)

export const PageHeader = ({title,subtitle,onBack,extra}) => (
  <div style={{padding:'44px 20px 18px',textAlign:'center',position:'relative'}}>
    {onBack&&(
      <button onClick={onBack} style={{position:'absolute',left:16,top:48,color:'rgba(180,190,205,0.4)',fontSize:11,letterSpacing:'0.06em',display:'flex',alignItems:'center',gap:5,background:'rgba(255,255,255,0.04)',padding:'7px 14px',borderRadius:999,border:'1px solid rgba(217,203,176,0.1)',fontWeight:600}}>
        <ChevronLeft size={13}/> Volver
      </button>
    )}
    <p className="animate-ornament" style={{color:'#E0B05E',fontSize:9,letterSpacing:'0.5em',marginBottom:10,opacity:0.55}}>✦ ✦ ✦</p>
    <h1 className="font-serif" style={{fontSize:26,color:'#F2E0C9',lineHeight:1.1,marginBottom:subtitle?4:0}}>{title}</h1>
    {subtitle&&<p style={{fontSize:10,color:'rgba(180,190,205,0.35)',letterSpacing:'0.07em',fontWeight:500}}>{subtitle}</p>}
    {extra&&<div style={{marginTop:10}}>{extra}</div>}
    <div style={{marginTop:12}}><OrnamentLine/></div>
  </div>
)

export const ActionBtn = ({label,sub,onClick,accent=false}) => (
  <div onClick={onClick} style={{background:accent?'rgba(224,176,94,0.07)':'rgba(255,255,255,0.03)',border:`1px solid ${accent?'rgba(224,176,94,0.2)':'rgba(217,203,176,0.09)'}`,borderRadius:16,padding:'16px 15px',cursor:'pointer',display:'flex',flexDirection:'column',gap:4,position:'relative',overflow:'hidden'}}>
    <div style={{position:'absolute',top:0,left:14,right:14,height:1,background:'linear-gradient(to right,transparent,rgba(224,176,94,0.15),transparent)'}}/>
    <p style={{fontSize:13,fontWeight:700,color:accent?'#E0B05E':'rgba(242,224,201,0.88)',lineHeight:1.2}}>{label}</p>
    {sub&&<p style={{fontSize:9.5,color:'rgba(180,190,205,0.3)',fontWeight:500}}>{sub}</p>}
  </div>
)

const navConfigs = {
  vecino:[
    {path:'/',label:'Inicio',Icon:Home},
    {path:'/aviso',label:'Reportar',Icon:Plus},
    {path:'/avisos',label:'Avisos',Icon:ClipboardList},
    {path:'/servicios',label:'Servicios',Icon:Wrench},
    {path:'/config',label:'Ajustes',Icon:Settings},
  ],
  admin:[
    {path:'/',label:'Panel',Icon:LayoutDashboard},
    {path:'/admin/avisos',label:'Avisos',Icon:ClipboardList},
    {path:'/admin/proveedores',label:'Servicios',Icon:Wrench},
    {path:'/admin/stats',label:'Métricas',Icon:BarChart3},
    {path:'/admin/mas',label:'Más',Icon:MoreHorizontal},
  ],
  proveedor:[
    {path:'/',label:'Inicio',Icon:Home},
    {path:'/proveedor/mensajes',label:'Mensajes',Icon:MessageSquare},
    {path:'/proveedor/agenda',label:'Agenda',Icon:Calendar},
    {path:'/proveedor/historial',label:'Historial',Icon:History},
    {path:'/config',label:'Ajustes',Icon:Settings},
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
    <nav style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:430,background:'rgba(10,20,40,0.97)',backdropFilter:'blur(28px)',borderTop:'1px solid rgba(217,203,176,0.07)',paddingTop:10,paddingBottom:'max(20px, env(safe-area-inset-bottom))',zIndex:40}}>
      <div style={{position:'absolute',top:5,height:3,borderRadius:999,background:'linear-gradient(90deg,#E0B05E,#C9923A)',boxShadow:'0 0 10px rgba(224,176,94,0.5)',transition:'left 0.38s cubic-bezier(.22,1,.36,1),width 0.38s',...indStyle}}/>
      <div ref={containerRef} style={{display:'flex',justifyContent:'space-around',alignItems:'center'}}>
        {items.map(({path,label,Icon})=>{
          const active=location.pathname===path
          return (
            <button key={path} onClick={()=>navigate(path)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,color:active?'#F2E0C9':'rgba(180,190,205,0.25)',padding:'4px 8px',minWidth:44,background:'none',border:'none',cursor:'pointer'}}>
              <div style={{width:32,height:32,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',background:active?'rgba(224,176,94,0.1)':'transparent',transition:'background 0.2s'}}>
                <Icon size={17} strokeWidth={active?2:1.5}/>
              </div>
              <span style={{fontSize:7.5,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase'}}>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export { Home, Plus, ClipboardList, Wrench, Settings, LayoutDashboard, BarChart3, MoreHorizontal, MessageSquare, Calendar, History, ChevronLeft, ChevronRight, X, Send, Check, Bell, Phone, LogOut, Building2, Users, Trash2, Shield, Sun, Moon, BellOff, Info }
