import { createContext, useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { TOKEN_KEY } from '../services/apiClient'
import { getMyProfile } from '../services/membershipService'
import type { UserProfile } from '../types/membership'

interface AuthContextValue {
  token: string | null
  isAuthenticated: boolean
  profile: UserProfile | null
  role: string | null
  profileLoaded: boolean
  setToken: (token: string | null) => void
  logout: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoaded, setProfileLoaded] = useState<boolean>(
    () => !localStorage.getItem(TOKEN_KEY),
  )

  const setToken = useCallback((next: string | null) => {
    if (next) {
      localStorage.setItem(TOKEN_KEY, next)
      setProfileLoaded(false)
    } else {
      localStorage.removeItem(TOKEN_KEY)
      setProfile(null)
      setProfileLoaded(true)
    }
    setTokenState(next)
  }, [])

  const logout = useCallback(() => setToken(null), [setToken])

  useEffect(() => {
    if (!token) return
    let cancelled = false
    getMyProfile()
      .then((p) => {
        if (!cancelled) setProfile(p)
      })
      .catch(() => {
        if (!cancelled) setProfile(null)
      })
      .finally(() => {
        if (!cancelled) setProfileLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: Boolean(token),
        profile,
        role: profile?.role ?? null,
        profileLoaded,
        setToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
