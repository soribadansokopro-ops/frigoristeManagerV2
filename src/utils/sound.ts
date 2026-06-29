import { readUiPreferences } from './uiPreferences'

type SoundName = 'click' | 'relay' | 'contactor' | 'alarm' | 'fan' | 'compressor'

let audioContext: AudioContext | null = null

const getContext = () => {
  if (typeof window === 'undefined') {
    return null
  }

  if (!audioContext) {
    const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) {
      return null
    }
    audioContext = new Ctx()
  }

  return audioContext
}

const shapeFor = (name: SoundName) => {
  if (name === 'click') return { freq: 680, duration: 0.03, type: 'square' as const }
  if (name === 'relay') return { freq: 420, duration: 0.05, type: 'triangle' as const }
  if (name === 'contactor') return { freq: 300, duration: 0.08, type: 'sawtooth' as const }
  if (name === 'alarm') return { freq: 980, duration: 0.14, type: 'square' as const }
  if (name === 'fan') return { freq: 180, duration: 0.08, type: 'sine' as const }
  return { freq: 120, duration: 0.08, type: 'sine' as const }
}

/**
 * Plays a subtle synthetic UI sound honoring user settings.
 */
export const playUiSound = (name: SoundName) => {
  const prefs = readUiPreferences()
  if (!prefs.soundEnabled || prefs.soundVolume <= 0) {
    return
  }

  const context = getContext()
  if (!context) {
    return
  }

  if (context.state === 'suspended') {
    void context.resume()
  }

  const now = context.currentTime
  const shape = shapeFor(name)
  const osc = context.createOscillator()
  const gain = context.createGain()

  osc.type = shape.type
  osc.frequency.setValueAtTime(shape.freq, now)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, prefs.soundVolume * 0.08), now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + shape.duration)

  osc.connect(gain)
  gain.connect(context.destination)
  osc.start(now)
  osc.stop(now + shape.duration)
}
