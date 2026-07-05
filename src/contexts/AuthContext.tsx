import { createContext, useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { TOKEN_KEY } from '../services/apiClient'

interface AuthContextValue {
  token: string | null
  isAuthenticated: boolean
  setToken: (token: string | null) => void
  logout: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))

  const setToken = useCallback((next: string | null) => {
    if (next) {
      localStorage.setItem(TOKEN_KEY, next)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
    setTokenState(next)
  }, [])

  const logout = useCallback(() => setToken(null), [setToken])

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: Boolean(token), setToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
