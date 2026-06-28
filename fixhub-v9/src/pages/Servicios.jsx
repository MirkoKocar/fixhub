import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PalaceFrame, PageHeader, Card, AccentCard, PrimaryBtn, GhostBtn, OrnamentLine, BottomNav, SectionLabel } from '../components/Palace'

const SERVICIOS = [
  {
    id: 'Plomería',
    emoji: '🔧',
    desc: 'Caños, pérdidas de agua, desagotes, instalaciones sanitarias.',
    ejemplos: ['Pérdida de agua en canilla o inodoro', 'Caño roto o con goteras', 'Desagüe tapado', 'Presión baja de agua', 'Pérdida bajo mesada', 'Filtraciones en paredes'],
  },
  {
    id: 'Electricidad',
    emoji: '⚡',
    desc: 'Cortes, instalaciones eléctricas, tableros y luces.',
    ejemplos: ['Corte de luz en departamento', 'Tomacorriente que no funciona', 'Luz parpadeante', 'Tablero disparado', 'Instalación de artefactos', 'Cortocircuito'],
  },
  {
    id: 'Gas',
    emoji: '🔥',
    desc: 'Pérdidas de gas, calefones, calderas y hornos.',
    ejemplos: ['Olor a gas en el departamento', 'Calefón que no enciende', 'Caldera sin presión', 'Cocina sin llama', 'Revisión de instalación de gas'],
  },
  {
    id: 'Ascensor',
    emoji: '🛗',
    desc: 'Fallas, mantenimiento y emergencias del ascensor.',
    ejemplos: ['Ascensor trabado entre pisos', 'Puertas que no cierran', 'Botones sin respuesta', 'Ruidos extraños', 'Luz interior apagada'],
  },
  {
    id: 'Limpieza',
    emoji: '🧹',
    desc: 'Limpieza de áreas comunes, pasillos y espacios del edificio.',
    ejemplos: ['Pasillo sucio o con basura', 'Ascensor sin limpiar', 'Patio en mal estado', 'Cochera con residuos', 'Terraza sucia'],
  },
  {
    id: 'Seguridad',
    emoji: '🔒',
    desc: 'Portones, cerraduras, cámaras e intercomunicadores.',
    ejemplos: ['Portón roto o sin cierre', 'Intercomunicador sin sonido', 'Cámara de seguridad caída', 'Cerradura del edificio dañada', 'Llave de ingreso que no funciona'],
  },
  {
    id: 'Estructura',
    emoji: '🏗️',
    desc: 'Grietas, humedad, pintura y estructura edilicia.',
    ejemplos: ['Grietas en pared o techo', 'Humedad en paredes', 'Pintura descascarada', 'Piso roto en zona común', 'Filtraciones de lluvia'],
  },
  {
    id: 'Internet',
    emoji: '📡',
    desc: 'Problemas con la conexión o instalación de fibra óptica.',
    ejemplos: ['Sin conexión a internet', 'Señal muy débil', 'Router sin luz', 'Instalación de fibra óptica', 'Cable de red cortado'],
  },
  {
    id: 'Otro',
    emoji: '📋',
    desc: 'Cualquier problema que no entra en las categorías anteriores.',
    ejemplos: [],
    esOtro: true,
  },
]

export default function Servicios({ user }) {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)

  if (selected) {
    return (
      <div className="page page-enter">
        <PalaceFrame />
        <PageHeader title={selected.id} subtitle={selected.desc} onBack={() => setSelected(null)} />

        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!selected.esOtro && (
            <div>
              <SectionLabel style={{ marginBottom: 12 }}>Problemas frecuentes</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selected.ejemplos.map((ej, i) => (
                  <AccentCard key={i} accentColor="rgba(224,176,94,0.3)" onClick={() => navigate('/aviso', { state: { categoria: selected.id, tituloSugerido: ej } })}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: 13, color: 'rgba(242,224,201,0.82)', fontWeight: 500 }}>{ej}</p>
                      <svg width="14" height="14" fill="none" stroke="rgba(224,176,94,0.4)" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                    </div>
                  </AccentCard>
                ))}
              </div>
            </div>
          )}

          {selected.esOtro && (
            <Card style={{ padding: '16px' }}>
              <p style={{ fontSize: 13, color: 'rgba(180,190,205,0.55)', lineHeight: 1.6, fontWeight: 400 }}>
                Si tu problema no corresponde a ninguna categoría, podés describirlo en el aviso. El administrador se encargará de encontrar el servicio adecuado para resolverlo.
              </p>
            </Card>
          )}

          <OrnamentLine opacity={0.08} />

          <PrimaryBtn onClick={() => navigate('/aviso', { state: { categoria: selected.esOtro ? 'Otro' : selected.id } })}>
            {selected.esOtro ? 'Avisar al administrador' : `Reportar problema de ${selected.id}`}
          </PrimaryBtn>
        </div>
        <BottomNav rol="vecino" />
      </div>
    )
  }

  return (
    <div className="page page-enter">
      <PalaceFrame />
      <PageHeader title="Servicios" subtitle="¿Qué necesitás resolver?" />

      <div style={{ padding: '0 20px' }}>
        <SectionLabel style={{ marginBottom: 14 }}>Seleccioná una categoría</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {SERVICIOS.map(s => (
            <div key={s.id} onClick={() => setSelected(s)} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(217,203,176,0.1)',
              borderRadius: 18, padding: '18px 14px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: 8,
              position: 'relative', overflow: 'hidden',
              transition: 'border-color 0.2s, background 0.2s'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 14, right: 14, height: 1, background: 'linear-gradient(to right,transparent,rgba(224,176,94,0.14),transparent)' }}/>
              <p style={{ fontSize: 22 }}>{s.emoji}</p>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(242,224,201,0.9)', lineHeight: 1.2 }}>{s.id}</p>
                <p style={{ fontSize: 9.5, color: 'rgba(180,190,205,0.3)', marginTop: 3, fontWeight: 500, lineHeight: 1.4 }}>{s.desc.split('.')[0]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav rol="vecino" />
    </div>
  )
}
