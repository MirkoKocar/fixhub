import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PalaceFrame, PageHeader, Card, OrnIcon, BottomNav, SectionLabel } from '../components/Palace'

export default function AdminMas({ user }) {
  const navigate = useNavigate()
  const items = [
    { label: 'Tablón de anuncios', sub: 'Publicar comunicados', path: '/admin/tablon', d: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.952 9.168-5' },
    { label: 'Votaciones', sub: 'Decisiones del consorcio', path: '/admin/votaciones', d: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
    { label: 'Encuestas', sub: 'Satisfacción de vecinos', path: '/admin/encuestas', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { label: 'Recordatorios', sub: 'Mantenimiento preventivo', path: '/admin/recordatorios', d: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { label: 'Vecinos registrados', sub: 'Listado del edificio', path: '/admin/vecinos', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'Emergencias', sub: 'Contactos del edificio', path: '/admin/emergencias', d: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'Visitas autorizadas', sub: 'Registro de accesos', path: '/admin/visitas', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { label: 'Estadísticas', sub: 'Métricas del edificio', path: '/admin/stats', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ]
  return (
    <div className="page">
      <PalaceFrame />
      <PageHeader title="Más opciones" subtitle="Herramientas de gestión" />
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(item => (
          <Card key={item.path} onClick={() => navigate(item.path)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 14px' }}>
            <OrnIcon path={item.d} size={15} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(242,224,201,0.82)' }}>{item.label}</p>
              <p style={{ fontSize: 10, color: 'rgba(160,174,192,0.28)', marginTop: 2 }}>{item.sub}</p>
            </div>
          </Card>
        ))}
      </div>
      <BottomNav rol="admin" />
    </div>
  )
}
