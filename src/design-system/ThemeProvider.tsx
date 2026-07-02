import { createContext, useContext, useEffect, type ReactNode } from 'react'

type ThemeMode = 'game'

interface ThemeContextValue {
  mode: ThemeMode
}

const ThemeContext = createContext<ThemeContextValue>({ mode: 'game' })

interface ThemeProviderProps {
  children: ReactNode
  mode?: ThemeMode
}

export function DsThemeProvider({ children, mode = 'game' }: ThemeProviderProps) {
  useEffect(() => {
    document.body.dataset.fmTheme = mode
    return () => {
      delete document.body.dataset.fmTheme
    }
  }, [mode])

  return <ThemeContext.Provider value={{ mode }}>{children}</ThemeContext.Provider>
}

export function useDsTheme() {
  return useContext(ThemeContext)
}
