import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PalaceFrame, PageHeader, Card, BottomNav, SectionLabel } from '../components/Palace'

function MenuItem({ label, sub, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(217,203,176,0.09)',
      borderRadius: 16, padding: '15px 16px', cursor: 'pointer',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: 0, left: 14, right: 14, height: 1, background: 'linear-gradient(to right,transparent,rgba(224,176,94,0.12),transparent)' }}/>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(242,224,201,0.85)' }}>{label}</p>
        {sub && <p style={{ fontSize: 10, color: 'rgba(180,190,205,0.28)', marginTop: 2, fontWeight: 500 }}>{sub}</p>}
      </div>
      <svg width="14" height="14" fill="none" stroke="rgba(224,176,94,0.3)" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
      </svg>
    </div>
  )
}

export default function AdminMas({ user }) {
  const navigate = useNavigate()
  const items = [
    { label: 'Tablón de anuncios', sub: 'Publicar comunicados', path: '/admin/tablon' },
    { label: 'Votaciones', sub: 'Decisiones del consorcio', path: '/admin/votaciones' },
    { label: 'Encuestas', sub: 'Satisfacción de vecinos', path: '/admin/encuestas' },
    { label: 'Recordatorios', sub: 'Mantenimiento preventivo', path: '/admin/recordatorios' },
    { label: 'Vecinos registrados', sub: 'Listado del edificio', path: '/admin/vecinos' },
    { label: 'Emergencias', sub: 'Contactos del edificio', path: '/admin/emergencias' },
    { label: 'Visitas autorizadas', sub: 'Registro de accesos', path: '/admin/visitas' },
    { label: 'Actividad del edificio', sub: 'Timeline cronológico', path: '/admin/actividad' },
    { label: 'Estadísticas', sub: 'Métricas detalladas', path: '/admin/stats' },
    { label: 'Configuración', sub: 'Ajustes y sesión', path: '/config' },
  ]
  return (
    <div className="page">
      <PalaceFrame />
      <PageHeader title="Más opciones" subtitle="Herramientas de gestión" />
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(item => (
          <MenuItem key={item.path} label={item.label} sub={item.sub} onClick={() => navigate(item.path)} />
        ))}
      </div>
      <BottomNav rol="admin" />
    </div>
  )
}
