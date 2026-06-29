import { useEffect } from 'react'

export const useSimulationTick = (tick: (dtSeconds: number) => void, enabled: boolean) => {
  useEffect(() => {
    if (!enabled) {
      return
    }

    const intervalId = window.setInterval(() => {
      tick(0.1)
    }, 100)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [enabled, tick])
}
