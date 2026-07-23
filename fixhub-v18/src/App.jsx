import React, { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { BottomNav } from './components/Palace'

import Welcome from './pages/Welcome'
import Login from './pages/Login'
import { PalaceFrame } from './components/Palace'

const Onboarding         = lazy(() => import('./pages/Onboarding'))
const HomeVecino         = lazy(() => import('./pages/HomeVecino'))
const HomeAdmin          = lazy(() => import('./pages/HomeAdmin'))
const HomeProveedor      = lazy(() => import('./pages/HomeProveedor'))
const NuevoAviso         = lazy(() => import('./pages/NuevoAviso'))
const Avisos             = lazy(() => import('./pages/Avisos'))
const Servicios          = lazy(() => import('./pages/Servicios'))
const Chat               = lazy(() => import('./pages/Chat'))
const VotacionVecino     = lazy(() => import('./pages/VotacionVecino'))
const EncuestaVecino     = lazy(() => import('./pages/EncuestaVecino'))
const VisitaVecino       = lazy(() => import('./pages/VisitaVecino'))
const Configuracion      = lazy(() => import('./pages/Configuracion'))
const AdminAvisos        = lazy(() => import('./pages/AdminAvisos'))
const AdminProveedores   = lazy(() => import('./pages/AdminProveedores'))
const AdminStats         = lazy(() => import('./pages/AdminStats'))
const AdminTablon        = lazy(() => import('./pages/AdminTablon'))
const AdminRecordatorios = lazy(() => import('./pages/AdminRecordatorios'))
const AdminVecinos       = lazy(() => import('./pages/AdminVecinos'))
const AdminVotaciones    = lazy(() => import('./pages/AdminVotaciones'))
const AdminEncuestas     = lazy(() => import('./pages/AdminEncuestas'))
const AdminEmergencias   = lazy(() => import('./pages/AdminEmergencias'))
const AdminVisitas       = lazy(() => import('./pages/AdminVisitas'))
const AdminMas           = lazy(() => import('./pages/AdminMas'))
const ActivityLog        = lazy(() => import('./pages/ActivityLog'))
const ProveedorAgenda    = lazy(() => import('./pages/ProveedorAgenda'))
const ProveedorHistorial = lazy(() => import('./pages/ProveedorHistorial'))
const InfraDashboard     = lazy(() => import('./pages/InfraDashboard'))

const SESSION_KEY    = 'fixhub_session_v9'
const ONBOARDING_KEY = 'fixhub_onboarding_done'

function PageLoader() {
  return (
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{display:'flex',gap:6}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{width:7,height:7,borderRadius:'50%',background:'rgba(224,176,94,0.6)',animation:`bounce 1.1s ${i*0.18}s ease-in-out infinite`}}/>
        ))}
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-10px)}}`}</style>
    </div>
  )
}

// Wrapper que da scroll al contenido + pone el nav debajo
function AppShell({ rol, children }) {
  return (
    <>
      <div className="scroll-content">
        <PalaceFrame />
        <Suspense fallback={<PageLoader />}>
          {children}
        </Suspense>
      </div>
      <BottomNav rol={rol} />
    </>
  )
}

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true)
  const [infraMode, setInfraMode]     = useState(false)
  const [session, setSession]         = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) } catch { return null }
  })
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const light      = localStorage.getItem('fixhub_lightmode') === 'true'
    const brightness = localStorage.getItem('fixhub_brightness') || '100'
    if (light) document.body.classList.add('light-mode')
    document.body.style.filter = `brightness(${brightness}%)`
  }, [])

  const handleLogin = (userData) => {
    if (userData._infra) { setInfraMode(true); return }
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData))
    setSession(userData)
    if (userData.rol === 'vecino' && !localStorage.getItem(ONBOARDING_KEY)) setShowOnboarding(true)
  }

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
    setInfraMode(false)
    setShowWelcome(true)
  }

  // INFRA — sin nav, sin scroll-content wrapper
  if (infraMode) return (
    <div className="scroll-content">
      <Suspense fallback={<PageLoader />}>
        <InfraDashboard onExit={() => { setInfraMode(false); setShowWelcome(true) }} />
      </Suspense>
    </div>
  )

  // Welcome
  if (showWelcome) return (
    <div className="scroll-content">
      <Welcome onContinue={() => setShowWelcome(false)} />
    </div>
  )

  // Login
  if (!session) return (
    <div className="scroll-content">
      <PalaceFrame />
      <Login onLogin={handleLogin} />
    </div>
  )

  // Onboarding
  if (showOnboarding) return (
    <div className="scroll-content">
      <Suspense fallback={<PageLoader />}>
        <Onboarding onFinish={() => { localStorage.setItem(ONBOARDING_KEY,'done'); setShowOnboarding(false) }} />
      </Suspense>
    </div>
  )

  const { rol } = session

  if (rol === 'vecino') return (
    <AppShell rol="vecino">
      <Routes>
        <Route path="/"           element={<HomeVecino user={session} />} />
        <Route path="/aviso"      element={<NuevoAviso user={session} />} />
        <Route path="/avisos"     element={<Avisos user={session} />} />
        <Route path="/servicios"  element={<Servicios user={session} />} />
        <Route path="/chat/:avisoId" element={<Chat user={session} />} />
        <Route path="/votaciones" element={<VotacionVecino user={session} />} />
        <Route path="/encuesta/:encuestaId" element={<EncuestaVecino user={session} />} />
        <Route path="/visitas"    element={<VisitaVecino user={session} />} />
        <Route path="/config"     element={<Configuracion user={session} onLogout={handleLogout} />} />
        <Route path="/guia"       element={<Onboarding onFinish={() => window.history.back()} />} />
        <Route path="*"           element={<Navigate to="/" />} />
      </Routes>
    </AppShell>
  )

  if (rol === 'admin') return (
    <AppShell rol="admin">
      <Routes>
        <Route path="/"                    element={<HomeAdmin user={session} />} />
        <Route path="/admin/avisos"        element={<AdminAvisos user={session} />} />
        <Route path="/admin/proveedores"   element={<AdminProveedores user={session} />} />
        <Route path="/admin/stats"         element={<AdminStats user={session} />} />
        <Route path="/admin/tablon"        element={<AdminTablon user={session} />} />
        <Route path="/admin/recordatorios" element={<AdminRecordatorios user={session} />} />
        <Route path="/admin/vecinos"       element={<AdminVecinos user={session} />} />
        <Route path="/admin/votaciones"    element={<AdminVotaciones user={session} />} />
        <Route path="/admin/encuestas"     element={<AdminEncuestas user={session} />} />
        <Route path="/admin/emergencias"   element={<AdminEmergencias user={session} />} />
        <Route path="/admin/visitas"       element={<AdminVisitas user={session} />} />
        <Route path="/admin/actividad"     element={<ActivityLog user={session} />} />
        <Route path="/admin/mas"           element={<AdminMas user={session} />} />
        <Route path="/admin/aviso/:avisoId" element={<Chat user={session} />} />
        <Route path="/config"              element={<Configuracion user={session} onLogout={handleLogout} />} />
        <Route path="*"                    element={<Navigate to="/" />} />
      </Routes>
    </AppShell>
  )

  if (rol === 'proveedor') return (
    <AppShell rol="proveedor">
      <Routes>
        <Route path="/"                      element={<HomeProveedor user={session} />} />
        <Route path="/proveedor/mensajes"    element={<HomeProveedor user={session} />} />
        <Route path="/proveedor/chat/:avisoId" element={<Chat user={session} />} />
        <Route path="/proveedor/agenda"      element={<ProveedorAgenda user={session} />} />
        <Route path="/proveedor/historial"   element={<ProveedorHistorial user={session} />} />
        <Route path="/config"                element={<Configuracion user={session} onLogout={handleLogout} />} />
        <Route path="*"                      element={<Navigate to="/" />} />
      </Routes>
    </AppShell>
  )

  return <Navigate to="/" />
}
