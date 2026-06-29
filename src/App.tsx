import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useGameStore } from './store/gameStore'

const HomeScreen = lazy(async () => import('./screens/HomeScreen').then((module) => ({ default: module.HomeScreen })))
const LevelScreen = lazy(async () => import('./screens/LevelScreen').then((module) => ({ default: module.LevelScreen })))
const ZoneScreen = lazy(async () => import('./screens/ZoneScreen').then((module) => ({ default: module.ZoneScreen })))

function App() {
  const loadInstallations = useGameStore((state) => state.loadInstallations)

  useEffect(() => {
    void loadInstallations()
  }, [loadInstallations])

  return (
    <Suspense fallback={<main className="loading-shell"><p>Chargement...</p></main>}>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/level/:levelId" element={<LevelScreen />} />
        <Route path="/level/:levelId/zone/:zoneId" element={<ZoneScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App