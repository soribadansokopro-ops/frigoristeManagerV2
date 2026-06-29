import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useGameStore } from './store/gameStore'
import { AppErrorBoundary } from './ui/AppErrorBoundary'
import { readUiPreferences } from './utils/uiPreferences'

const HomeScreen = lazy(async () => import('./screens/HomeScreen').then((module) => ({ default: module.HomeScreen })))
const MissionsScreen = lazy(async () => import('./screens/MissionsScreen').then((module) => ({ default: module.MissionsScreen })))
const TrainingScreen = lazy(async () => import('./screens/TrainingScreen').then((module) => ({ default: module.TrainingScreen })))
const SettingsScreen = lazy(async () => import('./screens/SettingsScreen').then((module) => ({ default: module.SettingsScreen })))
const HistoryScreen = lazy(async () => import('./screens/HistoryScreen').then((module) => ({ default: module.HistoryScreen })))
const FaultSelectionScreen = lazy(async () => import('./screens/FaultSelectionScreen').then((module) => ({ default: module.FaultSelectionScreen })))
const LevelScreen = lazy(async () => import('./screens/LevelScreen').then((module) => ({ default: module.LevelScreen })))
const ZoneScreen = lazy(async () => import('./screens/ZoneScreen').then((module) => ({ default: module.ZoneScreen })))

function App() {
  const loadInstallations = useGameStore((state) => state.loadInstallations)

  useEffect(() => {
    void loadInstallations()
  }, [loadInstallations])

  useEffect(() => {
    const applyPreferences = () => {
      const prefs = readUiPreferences()
      document.body.classList.toggle('ui-focus-mode', prefs.focusMode)
      document.body.classList.toggle('ui-reduced-motion', prefs.reducedMotion)
    }

    applyPreferences()
    window.addEventListener('fm-ui-preferences-changed', applyPreferences)
    window.addEventListener('storage', applyPreferences)

    return () => {
      window.removeEventListener('fm-ui-preferences-changed', applyPreferences)
      window.removeEventListener('storage', applyPreferences)
    }
  }, [])

  return (
    <AppErrorBoundary>
      <Suspense fallback={<main className="loading-shell"><p>Chargement...</p></main>}>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/missions" element={<MissionsScreen />} />
          <Route path="/formation" element={<TrainingScreen />} />
          <Route path="/historique" element={<HistoryScreen />} />
          <Route path="/parametres" element={<SettingsScreen />} />
          <Route path="/level/:levelId/faults" element={<FaultSelectionScreen />} />
          <Route path="/level/:levelId" element={<LevelScreen />} />
          <Route path="/level/:levelId/zone/:zoneId" element={<ZoneScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppErrorBoundary>
  )
}

export default App