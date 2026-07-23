import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { supabase } from '../supabase'
import { Card, AccentCard, OrnamentLine, SectionLabel, AnimCounter, PrimaryBtn } from '../components/Palace'
import { Building2, Users, Wrench, ClipboardList, Trash2, LogOut, AlertCircle, RefreshCw } from 'lucide-react'

function ConfirmModal({ message, onConfirm, onCancel }) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return ReactDOM.createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.82)', backdropFilter:'blur(8px)', zIndex:99999, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
    >
      <div style={{ background:'#11203B', border:'1px solid rgba(248,113,113,0.3)', borderRadius:20, padding:28, width:'100%', maxWidth:360 }}>
        <p style={{ fontSize:15, color:'#F2E0C9', fontWeight:700, marginBottom:10, textAlign:'center' }}>¿Estás seguro?</p>
        <p style={{ fontSize:12, color:'rgba(200,210,225,0.7)', textAlign:'center', marginBottom:24, lineHeight:1.6 }}>{message}</p>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, padding:'13px', borderRadius:999, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(242,224,201,0.7)', fontWeight:600, fontSize:13, cursor:'pointer' }}>Cancelar</button>
          <button onClick={onConfirm} style={{ flex:1, padding:'13px', borderRadius:999, background:'rgba(248,113,113,0.15)', border:'1px solid rgba(248,113,113,0.4)', color:'#f87171', fontWeight:700, fontSize:13, cursor:'pointer' }}>Eliminar</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function InfraDashboard({ onExit }) {
  const [data, setData]       = useState({ edificios:[], vecinos:[], proveedores:[], avisos:[] })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tab, setTab]         = useState('overview')
  const [newEdificio, setNewEdificio] = useState({ nombre:'', direccion:'', codigo_acceso:'' })
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState({ text:'', ok:true })
  const [pendingDelete, setPendingDelete] = useState(null) // { type, id, nombre, extra }

  const fetchAll = async (silent=false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)

    const [edRes, vRes, pRes, avRes] = await Promise.all([
      supabase.from('edificios').select('*').order('created_at', { ascending:false }),
      supabase.from('vecinos').select('id, nombre, departamento, edificio_id, edificios(nombre)').order('created_at', { ascending:false }),
      supabase.from('proveedores').select('id, nombre, especialidad, disponible, ranking, edificio_id, edificios(nombre)').order('ranking', { ascending:false }),
      supabase.from('avisos').select('id, titulo, estado, edificio_id, vecino_id, proveedor_id, edificios(nombre), vecinos(nombre,departamento)').order('created_at', { ascending:false }).limit(200),
    ])

    setData({
      edificios:  edRes.data  || [],
      vecinos:    vRes.data   || [],
      proveedores:pRes.data   || [],
      avisos:     avRes.data  || [],
    })
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { fetchAll() }, [])

  const addEdificio = async () => {
    const nombre    = newEdificio.nombre.trim()
    const direccion = newEdificio.direccion.trim()
    const codigo    = newEdificio.codigo_acceso.trim().toUpperCase()

    if (!nombre || !codigo) {
      setMsg({ text:'Completá el nombre y el código de acceso.', ok:false })
      return
    }

    setSaving(true)
    setMsg({ text:'', ok:true })

    const { data: ed, error } = await supabase
      .from('edificios')
      .insert({ nombre, direccion, codigo_acceso: codigo })
      .select()
      .single()

    if (error) {
      const isDupe = error.code === '23505' || error.message?.includes('unique')
      setMsg({ text: isDupe ? 'Ese código ya existe. Usá otro.' : `Error: ${error.message}`, ok:false })
      setSaving(false)
      return
    }

    if (ed) {
      // Refrescar desde Supabase para asegurar consistencia
      await fetchAll(true)
      setNewEdificio({ nombre:'', direccion:'', codigo_acceso:'' })
      setMsg({ text:`"${ed.nombre}" agregado con código ${ed.codigo_acceso}.`, ok:true })
      setTimeout(() => setMsg({ text:'', ok:true }), 4000)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!pendingDelete) return
    const { type, id } = pendingDelete
    let error = null

    if (type === 'vecino') {
      // 1. Borrar mensajes donde el vecino es autor
      await supabase.from('mensajes').delete().eq('vecino_id', id)
      // 2. Obtener avisos del vecino para borrar sus mensajes también
      const { data: avisosVecino } = await supabase.from('avisos').select('id').eq('vecino_id', id)
      if (avisosVecino?.length) {
        const avisoIds = avisosVecino.map(a => a.id)
        await supabase.from('mensajes').delete().in('aviso_id', avisoIds)
        await supabase.from('avisos').delete().in('id', avisoIds)
      }
      // 3. Borrar visitas del vecino
      await supabase.from('visitas').delete().eq('vecino_id', id)
      // 4. Borrar votos del vecino
      await supabase.from('votos').delete().eq('vecino_id', id)
      // 5. Borrar respuestas de encuesta
      await supabase.from('respuestas_encuesta').delete().eq('vecino_id', id)
      // 6. Finalmente borrar el vecino
      const res = await supabase.from('vecinos').delete().eq('id', id)
      error = res.error

    } else if (type === 'proveedor') {
      // 1. Borrar mensajes del proveedor
      await supabase.from('mensajes').delete().eq('proveedor_id', id)
      // 2. Desvincular avisos (poner proveedor_id en null en vez de borrarlos)
      await supabase.from('avisos').update({ proveedor_id: null }).eq('proveedor_id', id)
      // 3. Borrar agenda del proveedor
      await supabase.from('agenda_proveedor').delete().eq('proveedor_id', id)
      // 4. Finalmente borrar el proveedor
      const res = await supabase.from('proveedores').delete().eq('id', id)
      error = res.error

    } else if (type === 'edificio') {
      // 1. Obtener todos los avisos del edificio
      const { data: avisosEdif } = await supabase.from('avisos').select('id').eq('edificio_id', id)
      if (avisosEdif?.length) {
        const avisoIds = avisosEdif.map(a => a.id)
        await supabase.from('mensajes').delete().in('aviso_id', avisoIds)
        await supabase.from('avisos').delete().in('id', avisoIds)
      }
      // 2. Obtener todos los vecinos del edificio para borrar sus dependencias
      const { data: vecinosEdif } = await supabase.from('vecinos').select('id').eq('edificio_id', id)
      if (vecinosEdif?.length) {
        const vecinoIds = vecinosEdif.map(v => v.id)
        await supabase.from('mensajes').delete().in('vecino_id', vecinoIds)
        await supabase.from('votos').delete().in('vecino_id', vecinoIds).catch(()=>{})
        await supabase.from('respuestas_encuesta').delete().in('vecino_id', vecinoIds).catch(()=>{})
        await supabase.from('visitas').delete().in('vecino_id', vecinoIds).catch(()=>{})
      }
      // 3. Obtener todos los proveedores del edificio para borrar sus dependencias
      const { data: provsEdif } = await supabase.from('proveedores').select('id').eq('edificio_id', id)
      if (provsEdif?.length) {
        const provIds = provsEdif.map(p => p.id)
        await supabase.from('mensajes').delete().in('proveedor_id', provIds)
        await supabase.from('agenda_proveedor').delete().in('proveedor_id', provIds).catch(()=>{})
      }
      // 4. Borrar tablas del edificio
      await supabase.from('anuncios').delete().eq('edificio_id', id).catch(()=>{})
      await supabase.from('recordatorios').delete().eq('edificio_id', id).catch(()=>{})
      await supabase.from('emergencias').delete().eq('edificio_id', id).catch(()=>{})
      await supabase.from('votaciones').delete().eq('edificio_id', id).catch(()=>{})
      await supabase.from('encuestas').delete().eq('edificio_id', id).catch(()=>{})
      await supabase.from('visitas').delete().eq('edificio_id', id).catch(()=>{})
      await supabase.from('agenda_proveedor').delete().eq('edificio_id', id).catch(()=>{})
      // 5. Borrar vecinos y proveedores
      await supabase.from('proveedores').delete().eq('edificio_id', id)
      await supabase.from('vecinos').delete().eq('edificio_id', id)
      // 6. Finalmente el edificio
      const res = await supabase.from('edificios').delete().eq('id', id)
      error = res.error

    } else if (type === 'aviso') {
      await supabase.from('mensajes').delete().eq('aviso_id', id)
      const res = await supabase.from('avisos').delete().eq('id', id)
      error = res.error
    }

    if (error) {
      console.error('Error al eliminar:', error)
      setMsg({ text:`Error al eliminar: ${error.message}`, ok:false })
      setPendingDelete(null)
      return
    }

    await fetchAll(true)
    setPendingDelete(null)
  }

  const avisosPorEdificio = data.edificios.map(e => ({
    id:e.id, nombre:e.nombre,
    total:    data.avisos.filter(a=>a.edificio_id===e.id).length,
    resueltos:data.avisos.filter(a=>a.edificio_id===e.id&&a.estado==='resuelto').length
  })).sort((a,b)=>b.total-a.total)

  const tabs = [
    { id:'overview',    label:'Resumen',     Icon:ClipboardList },
    { id:'edificios',   label:'Edificios',   Icon:Building2 },
    { id:'vecinos',     label:'Vecinos',     Icon:Users },
    { id:'proveedores', label:'Proveedores', Icon:Wrench },
    { id:'avisos',      label:'Avisos',      Icon:ClipboardList },
    { id:'stats',       label:'Stats',       Icon:ClipboardList },
  ]

  const inputStyle = {
    width:'100%', background:'var(--bg-card)',
    border:'1px solid var(--border)', borderRadius:12,
    padding:'11px 14px', color:'var(--text-primary)', fontSize:13,
    fontFamily:"'DM Sans',sans-serif", marginBottom:8, outline:'none',
  }

  const estadoColor = { nuevo:'#f87171', en_curso:'#fbbf24', resuelto:'#34d399' }

  return (
    <div style={{ minHeight:'100vh', background:'#060D1C', fontFamily:"'DM Sans',sans-serif", position:'relative' }}>
      {pendingDelete && (
        <ConfirmModal
          message={`Vas a eliminar "${pendingDelete.nombre}". Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {/* Header */}
      <div style={{ padding:'48px 20px 16px', textAlign:'center', borderBottom:'1px solid rgba(224,176,94,0.1)' }}>
        <p style={{ fontSize:8, letterSpacing:'0.6em', color:'rgba(224,176,94,0.35)', textTransform:'uppercase', fontWeight:700, marginBottom:6 }}>MODO INFRAESTRUCTURA</p>
        <h1 className="font-serif" style={{ fontSize:22, color:'var(--text-primary)' }}>Panel Global</h1>
        <p style={{ fontSize:9.5, color:'var(--text-faint)', marginTop:3, fontWeight:500 }}>Acceso total al sistema FixHub</p>
        <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:10 }}>
          <button onClick={() => fetchAll(true)} disabled={refreshing} style={{ fontSize:9, color:'rgba(52,211,153,0.55)', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:700, padding:'6px 14px', border:'1px solid rgba(52,211,153,0.2)', borderRadius:999, display:'inline-flex', alignItems:'center', gap:5, cursor:'pointer', background:'none', opacity:refreshing?0.5:1 }}>
            <RefreshCw size={10} style={{ animation:refreshing?'spin 1s linear infinite':undefined }}/> {refreshing?'Actualizando...':'Actualizar'}
          </button>
          <button onClick={onExit} style={{ fontSize:9, color:'rgba(248,113,113,0.55)', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:700, padding:'6px 16px', border:'1px solid rgba(248,113,113,0.2)', borderRadius:999, display:'inline-flex', alignItems:'center', gap:5, cursor:'pointer', background:'none' }}>
            <LogOut size={10}/> Salir INFRA
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', overflowX:'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:'0 0 auto', padding:'12px 14px', fontSize:9, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', whiteSpace:'nowrap', color:tab===t.id?'#E0B05E':'var(--text-muted)', borderBottom:`2px solid ${tab===t.id?'#E0B05E':'transparent'}`, background:'none', border:'none', borderBottom:`2px solid ${tab===t.id?'#E0B05E':'transparent'}`, cursor:'pointer' }}>{t.label}</button>
        ))}
      </div>

      {msg.text && (
        <div style={{ margin:'12px 20px 0', display:'flex', alignItems:'center', gap:6 }}>
          {!msg.ok && <AlertCircle size={13} color="#f87171"/>}
          <p style={{ color:msg.ok?'#34d399':'#f87171', fontSize:11, fontWeight:600 }}>{msg.text}</p>
        </div>
      )}

      <div style={{ padding:'20px', paddingBottom:40 }}>
        {loading && (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <div style={{ display:'flex', gap:6, justifyContent:'center' }}>
              {[0,1,2].map(i=>(
                <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:'rgba(224,176,94,0.5)', animation:`bounce 1.1s ${i*0.18}s ease-in-out infinite` }}/>
              ))}
            </div>
            <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-10px)}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* OVERVIEW */}
        {!loading && tab === 'overview' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                {label:'Edificios',   value:data.edificios.length,   color:'#E0B05E'},
                {label:'Vecinos',     value:data.vecinos.length,     color:'#60a5fa'},
                {label:'Proveedores', value:data.proveedores.length, color:'#34d399'},
                {label:'Avisos',      value:data.avisos.length,      color:'#fbbf24'},
              ].map(s=>(
                <div key={s.label} style={{ background:`${s.color}06`, border:`1px solid ${s.color}18`, borderTop:`3px solid ${s.color}40`, borderRadius:16, padding:'14px 12px', textAlign:'center' }}>
                  <AnimCounter value={s.value} color={s.color} size={30}/>
                  <p style={{ fontSize:8.5, color:'var(--text-muted)', marginTop:5, textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:700 }}>{s.label}</p>
                </div>
              ))}
            </div>
            <OrnamentLine opacity={0.1}/>
            <SectionLabel style={{ marginBottom:8 }}>Avisos recientes</SectionLabel>
            {data.avisos.slice(0,5).map(a=>(
              <AccentCard key={a.id} accentColor={estadoColor[a.estado]||'#E0B05E'} style={{ marginBottom:7 }}>
                <p style={{ fontSize:12, color:'var(--text-primary)', fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.titulo}</p>
                <p style={{ fontSize:9.5, color:'var(--text-muted)', marginTop:2 }}>{a.edificios?.nombre} · {a.vecinos?.nombre} · Depto {a.vecinos?.departamento}</p>
              </AccentCard>
            ))}
            {data.avisos.length===0 && <p style={{ fontSize:12, color:'var(--text-faint)', textAlign:'center', padding:'20px 0' }}>Sin avisos todavía.</p>}
          </div>
        )}

        {/* EDIFICIOS */}
        {!loading && tab === 'edificios' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <Card style={{ padding:'16px' }}>
              <SectionLabel style={{ marginBottom:12 }}>Agregar edificio</SectionLabel>
              <input value={newEdificio.nombre} onChange={e=>setNewEdificio(p=>({...p,nombre:e.target.value}))} placeholder="Nombre del edificio *" style={inputStyle}/>
              <input value={newEdificio.direccion} onChange={e=>setNewEdificio(p=>({...p,direccion:e.target.value}))} placeholder="Dirección (opcional)" style={inputStyle}/>
              <input value={newEdificio.codigo_acceso} onChange={e=>setNewEdificio(p=>({...p,codigo_acceso:e.target.value.toUpperCase()}))} placeholder="Código de acceso * (ej: EDIF02)" style={{...inputStyle, letterSpacing:'0.08em', textTransform:'uppercase'}}/>
              <PrimaryBtn onClick={addEdificio} disabled={saving}>{saving?'Guardando...':'Agregar edificio'}</PrimaryBtn>
            </Card>
            <OrnamentLine opacity={0.08}/>
            <SectionLabel style={{ marginBottom:8 }}>{data.edificios.length} edificio{data.edificios.length!==1?'s':''}</SectionLabel>
            {data.edificios.length===0 && <p style={{ fontSize:12, color:'var(--text-faint)', textAlign:'center', padding:'20px 0' }}>Sin edificios todavía.</p>}
            {data.edificios.map(e=>{
              const vecinosCount=data.vecinos.filter(v=>v.edificio_id===e.id).length
              const avisosCount=data.avisos.filter(a=>a.edificio_id===e.id).length
              return (
                <AccentCard key={e.id} accentColor="rgba(224,176,94,0.3)">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13, color:'var(--text-primary)', fontWeight:700 }}>{e.nombre}</p>
                      {e.direccion&&<p style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>{e.direccion}</p>}
                      <div style={{ display:'flex', gap:12, marginTop:6 }}>
                        <span style={{ fontSize:9.5, color:'rgba(224,176,94,0.55)', fontWeight:700 }}>{vecinosCount} vecinos</span>
                        <span style={{ fontSize:9.5, color:'var(--text-muted)', fontWeight:700 }}>{avisosCount} avisos</span>
                        <span style={{ fontSize:9.5, color:'rgba(224,176,94,0.7)', fontWeight:700, letterSpacing:'0.05em' }}>{e.codigo_acceso}</span>
                      </div>
                    </div>
                    <button onClick={()=>setPendingDelete({type:'edificio',id:e.id,nombre:e.nombre})} style={{ padding:'6px', color:'rgba(248,113,113,0.4)', cursor:'pointer', flexShrink:0, marginLeft:8 }}>
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
            {data.vecinos.length===0 && <p style={{ fontSize:12, color:'var(--text-faint)', textAlign:'center', padding:'20px 0' }}>Sin vecinos todavía.</p>}
            {data.vecinos.map(v=>(
              <AccentCard key={v.id} accentColor="rgba(96,165,250,0.3)">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <p style={{ fontSize:13, color:'var(--text-primary)', fontWeight:700 }}>{v.nombre}</p>
                    <p style={{ fontSize:9.5, color:'var(--text-muted)', marginTop:2 }}>{v.edificios?.nombre} · Depto {v.departamento}</p>
                  </div>
                  <button onClick={()=>setPendingDelete({type:'vecino',id:v.id,nombre:v.nombre})} style={{ padding:'6px', color:'rgba(248,113,113,0.4)', cursor:'pointer', flexShrink:0 }}>
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
            {data.proveedores.length===0 && <p style={{ fontSize:12, color:'var(--text-faint)', textAlign:'center', padding:'20px 0' }}>Sin proveedores todavía.</p>}
            {data.proveedores.map(p=>(
              <AccentCard key={p.id} accentColor="rgba(52,211,153,0.3)">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <p style={{ fontSize:13, color:'var(--text-primary)', fontWeight:700 }}>{p.nombre}</p>
                    <p style={{ fontSize:9.5, color:'var(--text-muted)', marginTop:2 }}>{p.especialidad} · {p.edificios?.nombre}</p>
                    <p style={{ fontSize:9, color:'rgba(52,211,153,0.5)', marginTop:2, fontWeight:600 }}>Ranking {p.ranking} · <span style={{ color:p.disponible?'#34d399':'#f87171' }}>{p.disponible?'Disponible':'Ocupado'}</span></p>
                  </div>
                  <button onClick={()=>setPendingDelete({type:'proveedor',id:p.id,nombre:p.nombre})} style={{ padding:'6px', color:'rgba(248,113,113,0.4)', cursor:'pointer', flexShrink:0 }}>
                    <Trash2 size={14} strokeWidth={1.8}/>
                  </button>
                </div>
              </AccentCard>
            ))}
          </div>
        )}

        {/* AVISOS */}
        {!loading && tab === 'avisos' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.15)', borderRadius:12, padding:'10px 14px', marginBottom:4 }}>
              <p style={{ fontSize:10, color:'rgba(248,113,113,0.7)', fontWeight:600, lineHeight:1.5 }}>
                ⚠ Borrar un aviso lo elimina para todos: el vecino, el admin y el proveedor dejan de verlo. Usalo solo para eliminar avisos de prueba.
              </p>
            </div>
            <SectionLabel style={{ marginBottom:8 }}>{data.avisos.length} avisos</SectionLabel>
            {data.avisos.length===0 && <p style={{ fontSize:12, color:'var(--text-faint)', textAlign:'center', padding:'20px 0' }}>Sin avisos todavía.</p>}
            {data.avisos.map(a=>(
              <AccentCard key={a.id} accentColor={estadoColor[a.estado]||'#E0B05E'}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ flex:1, minWidth:0, marginRight:10 }}>
                    <p style={{ fontSize:12, color:'var(--text-primary)', fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.titulo}</p>
                    <p style={{ fontSize:9.5, color:'var(--text-muted)', marginTop:2 }}>{a.edificios?.nombre} · {a.vecinos?.nombre}</p>
                    <span style={{ fontSize:8.5, fontWeight:700, color:estadoColor[a.estado]||'#E0B05E', textTransform:'uppercase', letterSpacing:'0.06em' }}>{a.estado?.replace('_',' ')}</span>
                  </div>
                  <button onClick={()=>setPendingDelete({type:'aviso',id:a.id,nombre:a.titulo})} style={{ padding:'6px', color:'rgba(248,113,113,0.4)', cursor:'pointer', flexShrink:0 }}>
                    <Trash2 size={14} strokeWidth={1.8}/>
                  </button>
                </div>
              </AccentCard>
            ))}
          </div>
        )}

        {/* STATS */}
        {!loading && tab === 'stats' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <SectionLabel style={{ marginBottom:8 }}>Avisos por edificio</SectionLabel>
            {avisosPorEdificio.length===0 && <p style={{ fontSize:12, color:'var(--text-faint)', textAlign:'center', padding:'20px 0' }}>Sin datos todavía.</p>}
            {avisosPorEdificio.map(e=>(
              <Card key={e.nombre} style={{ padding:'12px 14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <p style={{ fontSize:12, color:'var(--text-secondary)', fontWeight:700 }}>{e.nombre}</p>
                  <p style={{ fontSize:11, color:'rgba(180,190,205,0.4)', fontWeight:600 }}>{e.total} avisos</p>
                </div>
                <div style={{ height:5, background:'var(--bg-card)', borderRadius:999 }}>
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
                  ['Total edificios',   data.edificios.length],
                  ['Total vecinos',     data.vecinos.length],
                  ['Total proveedores', data.proveedores.length],
                  ['Total avisos',      data.avisos.length],
                  ['Avisos resueltos',  data.avisos.filter(a=>a.estado==='resuelto').length],
                  ['Avisos pendientes', data.avisos.filter(a=>a.estado!=='resuelto').length],
                  ['Tasa resolución',   `${data.avisos.length>0?Math.round((data.avisos.filter(a=>a.estado==='resuelto').length/data.avisos.length)*100):0}%`],
                ].map(([label,val])=>(
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <p style={{ fontSize:12, color:'var(--text-muted)', fontWeight:500 }}>{label}</p>
                    <p style={{ fontSize:13, color:'#E0B05E', fontWeight:700 }}>{val}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-10px)}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
