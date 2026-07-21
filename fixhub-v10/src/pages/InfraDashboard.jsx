import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { Card, AccentCard, OrnamentLine, SectionLabel, AnimCounter, PrimaryBtn } from '../components/Palace'
import { Building2, Users, Wrench, ClipboardList, Trash2, LogOut, X } from 'lucide-react'

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(6px)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:24, maxWidth:430, margin:'0 auto' }}>
      <div style={{ background:'#11203B', border:'1px solid rgba(248,113,113,0.25)', borderRadius:20, padding:24, width:'100%' }}>
        <p style={{ fontSize:14, color:'#F2E0C9', fontWeight:700, marginBottom:8, textAlign:'center' }}>¿Estás seguro?</p>
        <p style={{ fontSize:12, color:'rgba(180,190,205,0.5)', textAlign:'center', marginBottom:20, lineHeight:1.5 }}>{message}</p>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, padding:'12px', borderRadius:999, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(217,203,176,0.15)', color:'rgba(242,224,201,0.6)', fontWeight:600, fontSize:13 }}>Cancelar</button>
          <button onClick={onConfirm} style={{ flex:1, padding:'12px', borderRadius:999, background:'rgba(248,113,113,0.12)', border:'1px solid rgba(248,113,113,0.3)', color:'#f87171', fontWeight:700, fontSize:13 }}>Eliminar</button>
        </div>
      </div>
    </div>
  )
}

export default function InfraDashboard({ onExit }) {
  const [data, setData] = useState({ edificios:[], vecinos:[], proveedores:[], avisos:[] })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [newEdificio, setNewEdificio] = useState({ nombre:'', direccion:'', codigo_acceso:'' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [confirm, setConfirm] = useState(null) // { type, id, nombre }

  const fetchAll = async () => {
    const [edRes, vRes, pRes, avRes] = await Promise.all([
      supabase.from('edificios').select('*').order('created_at', { ascending:false }),
      supabase.from('vecinos').select('*, edificios(nombre)').order('created_at', { ascending:false }),
      supabase.from('proveedores').select('*, edificios(nombre)').order('ranking', { ascending:false }),
      supabase.from('avisos').select('*, edificios(nombre), vecinos(nombre,departamento)').order('created_at', { ascending:false }),
    ])
    setData({ edificios:edRes.data||[], vecinos:vRes.data||[], proveedores:pRes.data||[], avisos:avRes.data||[] })
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const addEdificio = async () => {
    if (!newEdificio.nombre || !newEdificio.codigo_acceso) return
    setSaving(true)
    const { data:ed, error } = await supabase.from('edificios').insert(newEdificio).select().single()
    if (!error && ed) {
      setData(prev => ({ ...prev, edificios:[ed,...prev.edificios] }))
      setNewEdificio({ nombre:'', direccion:'', codigo_acceso:'' })
      setMsg('Edificio agregado.'); setTimeout(() => setMsg(''), 3000)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm) return
    if (confirm.type === 'vecino') {
      await supabase.from('vecinos').delete().eq('id', confirm.id)
      setData(prev => ({ ...prev, vecinos:prev.vecinos.filter(v => v.id !== confirm.id) }))
    } else if (confirm.type === 'proveedor') {
      await supabase.from('proveedores').delete().eq('id', confirm.id)
      setData(prev => ({ ...prev, proveedores:prev.proveedores.filter(p => p.id !== confirm.id) }))
    } else if (confirm.type === 'edificio') {
      await supabase.from('edificios').delete().eq('id', confirm.id)
      setData(prev => ({ ...prev, edificios:prev.edificios.filter(e => e.id !== confirm.id) }))
    }
    setConfirm(null)
  }

  const avisosPorEdificio = data.edificios.map(e => ({
    nombre:e.nombre, total:data.avisos.filter(a=>a.edificio_id===e.id).length,
    resueltos:data.avisos.filter(a=>a.edificio_id===e.id&&a.estado==='resuelto').length
  })).sort((a,b)=>b.total-a.total)

  const tabs = [
    { id:'overview', label:'Resumen', Icon:ClipboardList },
    { id:'edificios', label:'Edificios', Icon:Building2 },
    { id:'vecinos', label:'Vecinos', Icon:Users },
    { id:'proveedores', label:'Proveedores', Icon:Wrench },
    { id:'stats', label:'Stats', Icon:ClipboardList },
  ]

  const inputStyle = { width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(217,203,176,0.1)', borderRadius:12, padding:'10px 14px', color:'#F2E0C9', fontSize:13, fontFamily:"'DM Sans',sans-serif", marginBottom:8 }

  return (
    <div style={{ minHeight:'100vh', background:'#060D1C', fontFamily:"'DM Sans',sans-serif", maxWidth:430, margin:'0 auto', position:'relative' }}>
      {confirm && (
        <ConfirmModal
          message={`Vas a eliminar a "${confirm.nombre}". Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Header */}
      <div style={{ padding:'48px 20px 16px', textAlign:'center', borderBottom:'1px solid rgba(224,176,94,0.1)' }}>
        <p style={{ fontSize:8, letterSpacing:'0.6em', color:'rgba(224,176,94,0.35)', textTransform:'uppercase', fontWeight:700, marginBottom:6 }}>MODO INFRAESTRUCTURA</p>
        <h1 className="font-serif" style={{ fontSize:22, color:'#F2E0C9' }}>Panel Global</h1>
        <p style={{ fontSize:9.5, color:'rgba(180,190,205,0.28)', marginTop:3, fontWeight:500 }}>Acceso total al sistema FixHub</p>
        <button onClick={onExit} style={{ marginTop:10, fontSize:9, color:'rgba(248,113,113,0.55)', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:700, padding:'6px 16px', border:'1px solid rgba(248,113,113,0.2)', borderRadius:999, display:'inline-flex', alignItems:'center', gap:6 }}>
          <LogOut size={11}/> Salir del modo INFRA
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid rgba(217,203,176,0.08)', overflowX:'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:'12px 8px', fontSize:9.5, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', whiteSpace:'nowrap', color:tab===t.id?'#E0B05E':'rgba(180,190,205,0.3)', borderBottom:`2px solid ${tab===t.id?'#E0B05E':'transparent'}`, transition:'all 0.2s', background:'none', border:'none', borderBottom:`2px solid ${tab===t.id?'#E0B05E':'transparent'}`, cursor:'pointer' }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding:'20px', paddingBottom:60 }}>
        {loading && <p style={{ textAlign:'center', color:'rgba(180,190,205,0.2)', fontSize:12, padding:'40px 0' }}>Cargando...</p>}

        {/* OVERVIEW */}
        {!loading && tab === 'overview' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[{label:'Edificios',value:data.edificios.length,color:'#E0B05E'},{label:'Vecinos',value:data.vecinos.length,color:'#60a5fa'},{label:'Proveedores',value:data.proveedores.length,color:'#34d399'},{label:'Avisos',value:data.avisos.length,color:'#fbbf24'}].map(s=>(
                <div key={s.label} style={{ background:`${s.color}06`, border:`1px solid ${s.color}18`, borderTop:`3px solid ${s.color}40`, borderRadius:16, padding:'14px 12px', textAlign:'center' }}>
                  <AnimCounter value={s.value} color={s.color} size={30}/>
                  <p style={{ fontSize:8.5, color:'rgba(180,190,205,0.3)', marginTop:5, textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:700 }}>{s.label}</p>
                </div>
              ))}
            </div>
            <OrnamentLine opacity={0.1}/>
            <SectionLabel style={{ marginBottom:8 }}>Avisos recientes</SectionLabel>
            {data.avisos.slice(0,5).map(a=>(
              <AccentCard key={a.id} accentColor={a.estado==='nuevo'?'#f87171':a.estado==='en_curso'?'#fbbf24':'#34d399'} style={{ marginBottom:7 }}>
                <p style={{ fontSize:12, color:'rgba(242,224,201,0.85)', fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.titulo}</p>
                <p style={{ fontSize:9.5, color:'rgba(180,190,205,0.3)', marginTop:2, fontWeight:500 }}>{a.edificios?.nombre} · {a.vecinos?.nombre} · Depto {a.vecinos?.departamento}</p>
              </AccentCard>
            ))}
          </div>
        )}

        {/* EDIFICIOS */}
        {!loading && tab === 'edificios' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <Card style={{ padding:'16px' }}>
              <SectionLabel style={{ marginBottom:12 }}>Agregar edificio</SectionLabel>
              {['nombre','direccion','codigo_acceso'].map(field=>(
                <input key={field} value={newEdificio[field]} onChange={e=>setNewEdificio(prev=>({...prev,[field]:e.target.value}))}
                  placeholder={field==='nombre'?'Nombre del edificio':field==='direccion'?'Dirección':'Código de acceso (ej: EDIF01)'}
                  style={{...inputStyle,letterSpacing:field==='codigo_acceso'?'0.08em':0,textTransform:field==='codigo_acceso'?'uppercase':'none'}}/>
              ))}
              {msg && <p style={{ color:'#34d399', fontSize:11, marginBottom:8, fontWeight:600 }}>{msg}</p>}
              <PrimaryBtn onClick={addEdificio} disabled={saving}>{saving?'Guardando...':'Agregar edificio'}</PrimaryBtn>
            </Card>
            <OrnamentLine opacity={0.08}/>
            <SectionLabel style={{ marginBottom:8 }}>{data.edificios.length} edificios</SectionLabel>
            {data.edificios.map(e=>{
              const vecinosCount = data.vecinos.filter(v=>v.edificio_id===e.id).length
              const avisosCount = data.avisos.filter(a=>a.edificio_id===e.id).length
              return (
                <AccentCard key={e.id} accentColor="rgba(224,176,94,0.3)">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13, color:'#F2E0C9', fontWeight:700 }}>{e.nombre}</p>
                      <p style={{ fontSize:10, color:'rgba(180,190,205,0.35)', marginTop:2, fontWeight:500 }}>{e.direccion}</p>
                      <div style={{ display:'flex', gap:12, marginTop:6 }}>
                        <span style={{ fontSize:9.5, color:'rgba(224,176,94,0.55)', fontWeight:700 }}>{vecinosCount} vecinos</span>
                        <span style={{ fontSize:9.5, color:'rgba(180,190,205,0.35)', fontWeight:700 }}>{avisosCount} avisos</span>
                        <span style={{ fontSize:9.5, color:'rgba(224,176,94,0.6)', fontWeight:700, fontFamily:"'DM Serif Display',serif" }}>{e.codigo_acceso}</span>
                      </div>
                    </div>
                    <button onClick={() => setConfirm({type:'edificio',id:e.id,nombre:e.nombre})} style={{ padding:'6px', color:'rgba(248,113,113,0.4)', background:'none', border:'none', cursor:'pointer', flexShrink:0, marginLeft:8 }}>
                      <Trash2 size={14} strokeWidth={1.8}/>
                    </button>
                  </div>
                </AccentCard>
              )
            })}
          </div>
        )}

        {/* VECINOS */}
        {!loading && tab === 'vecinos' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <SectionLabel style={{ marginBottom:8 }}>{data.vecinos.length} vecinos registrados</SectionLabel>
            {data.vecinos.map(v=>(
              <AccentCard key={v.id} accentColor="rgba(96,165,250,0.3)">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <p style={{ fontSize:13, color:'rgba(242,224,201,0.88)', fontWeight:700 }}>{v.nombre}</p>
                    <p style={{ fontSize:9.5, color:'rgba(180,190,205,0.32)', marginTop:2, fontWeight:500 }}>{v.edificios?.nombre} · Depto {v.departamento}</p>
                  </div>
                  <button onClick={() => setConfirm({type:'vecino',id:v.id,nombre:v.nombre})} style={{ padding:'6px', color:'rgba(248,113,113,0.4)', background:'none', border:'none', cursor:'pointer', flexShrink:0 }}>
                    <Trash2 size={14} strokeWidth={1.8}/>
                  </button>
                </div>
              </AccentCard>
            ))}
          </div>
        )}

        {/* PROVEEDORES */}
        {!loading && tab === 'proveedores' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <SectionLabel style={{ marginBottom:8 }}>{data.proveedores.length} proveedores</SectionLabel>
            {data.proveedores.map(p=>(
              <AccentCard key={p.id} accentColor="rgba(52,211,153,0.3)">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <p style={{ fontSize:13, color:'rgba(242,224,201,0.88)', fontWeight:700 }}>{p.nombre}</p>
                    <p style={{ fontSize:9.5, color:'rgba(180,190,205,0.32)', marginTop:2, fontWeight:500 }}>{p.especialidad} · {p.edificios?.nombre}</p>
                    <p style={{ fontSize:9, color:'rgba(52,211,153,0.5)', marginTop:2, fontWeight:600 }}>Ranking: {p.ranking}</p>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                    <span style={{ fontSize:8.5, fontWeight:700, color:p.disponible?'#34d399':'#f87171', letterSpacing:'0.06em', textTransform:'uppercase' }}>{p.disponible?'Disponible':'Ocupado'}</span>
                    <button onClick={() => setConfirm({type:'proveedor',id:p.id,nombre:p.nombre})} style={{ padding:'4px', color:'rgba(248,113,113,0.4)', background:'none', border:'none', cursor:'pointer' }}>
                      <Trash2 size={13} strokeWidth={1.8}/>
                    </button>
                  </div>
                </div>
              </AccentCard>
            ))}
          </div>
        )}

        {/* STATS */}
        {!loading && tab === 'stats' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <SectionLabel style={{ marginBottom:8 }}>Avisos por edificio</SectionLabel>
            {avisosPorEdificio.map(e=>(
              <Card key={e.nombre} style={{ padding:'12px 14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <p style={{ fontSize:12, color:'rgba(242,224,201,0.82)', fontWeight:700 }}>{e.nombre}</p>
                  <p style={{ fontSize:11, color:'rgba(180,190,205,0.4)', fontWeight:600 }}>{e.total} avisos</p>
                </div>
                <div style={{ height:5, background:'rgba(255,255,255,0.05)', borderRadius:999 }}>
                  <div style={{ width:`${Math.min((e.total/(avisosPorEdificio[0]?.total||1))*100,100)}%`, height:'100%', background:'linear-gradient(90deg,#E0B05E,#C9923A)', borderRadius:999, transition:'width 0.6s' }}/>
                </div>
                <p style={{ fontSize:9, color:'rgba(52,211,153,0.55)', marginTop:4, fontWeight:700 }}>{e.resueltos} resueltos · {Math.round((e.resueltos/(e.total||1))*100)}% tasa</p>
              </Card>
            ))}
            <OrnamentLine opacity={0.08}/>
            <SectionLabel style={{ marginBottom:8 }}>Resumen global</SectionLabel>
            <Card>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  ['Total edificios',data.edificios.length],
                  ['Total vecinos',data.vecinos.length],
                  ['Total proveedores',data.proveedores.length],
                  ['Total avisos',data.avisos.length],
                  ['Avisos resueltos',data.avisos.filter(a=>a.estado==='resuelto').length],
                  ['Avisos pendientes',data.avisos.filter(a=>a.estado!=='resuelto').length],
                  ['Tasa de resolución',`${data.avisos.length>0?Math.round((data.avisos.filter(a=>a.estado==='resuelto').length/data.avisos.length)*100):0}%`],
                ].map(([label,val])=>(
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <p style={{ fontSize:12, color:'rgba(180,190,205,0.38)', fontWeight:500 }}>{label}</p>
                    <p style={{ fontSize:13, color:'#E0B05E', fontWeight:700 }}>{val}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
