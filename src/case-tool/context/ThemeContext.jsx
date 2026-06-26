import { createContext, useContext, useState, useEffect } from 'react'

const LIGHT = {
  primary: '#3776A1',
  sidebar: '#003A6B',
  mainBg: '#F4FAFE',
  cardBg: '#FFFFFF',
  border: '#CFE2F1',
  textPrimary: '#12324A',
  textSecondary: '#5F7E95',
  danger: '#E24B4A',
  warning: '#EF9F27',
  success: '#639922',
  sidebarActive: '#1B5886',
  sidebarText: 'rgba(255,255,255,0.72)',
  topbarGradient: 'linear-gradient(90deg, rgba(0,58,107,0.96), rgba(27,88,134,0.94) 45%, rgba(55,118,161,0.92) 100%)',
  inputBg: '#FFFFFF',
}

const DARK = {
  primary: '#5B9BD5',
  sidebar: '#0B1826',
  mainBg: '#0E1621',
  cardBg: '#152030',
  border: '#1E3248',
  textPrimary: '#D8E8F2',
  textSecondary: '#7A9BB5',
  danger: '#FF6464',
  warning: '#F5B842',
  success: '#5BBF40',
  sidebarActive: '#1A3550',
  sidebarText: 'rgba(255,255,255,0.60)',
  topbarGradient: 'linear-gradient(90deg, rgba(5,18,42,0.98), rgba(12,35,70,0.97) 45%, rgba(18,50,95,0.96) 100%)',
  inputBg: '#1A2A3A',
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('aspm_dark') === 'true')

  useEffect(() => {
    localStorage.setItem('aspm_dark', String(isDark))
  }, [isDark])

  const toggleDark = () => setIsDark(d => !d)

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark, colors: isDark ? DARK : LIGHT }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
export const useThemeColors = () => useContext(ThemeContext)?.colors ?? LIGHT
