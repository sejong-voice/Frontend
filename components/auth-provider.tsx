"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"

interface AuthState {
  isLoggedIn: boolean
  studentId: string | null
  name: string | null
}

interface AuthContextValue extends AuthState {
  login: (studentId: string, name: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    isLoggedIn: false,
    studentId: null,
    name: null,
  })

  const login = useCallback((studentId: string, name: string) => {
    setAuth({ isLoggedIn: true, studentId, name })
  }, [])

  const logout = useCallback(() => {
    setAuth({ isLoggedIn: false, studentId: null, name: null })
  }, [])

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
