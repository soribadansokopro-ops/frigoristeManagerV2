const STORAGE_KEY = 'fm-ui-preferences'

export interface UiPreferences {
  focusMode: boolean
  reducedMotion: boolean
  soundEnabled: boolean
  soundVolume: number
}

const defaultPreferences: UiPreferences = {
  focusMode: false,
  reducedMotion: false,
  soundEnabled: true,
  soundVolume: 0.45,
}

export const readUiPreferences = (): UiPreferences => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return defaultPreferences
    }

    const parsed = JSON.parse(raw) as Partial<UiPreferences>
    const safeVolume = Math.max(0, Math.min(1, Number(parsed.soundVolume ?? defaultPreferences.soundVolume)))
    return {
      focusMode: Boolean(parsed.focusMode),
      reducedMotion: Boolean(parsed.reducedMotion),
      soundEnabled: parsed.soundEnabled ?? defaultPreferences.soundEnabled,
      soundVolume: Number.isFinite(safeVolume) ? safeVolume : defaultPreferences.soundVolume,
    }
  } catch {
    return defaultPreferences
  }
}

export const writeUiPreferences = (preferences: UiPreferences) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  window.dispatchEvent(new CustomEvent('fm-ui-preferences-changed'))
}
