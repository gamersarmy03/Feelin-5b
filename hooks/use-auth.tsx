"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { authService, type User } from "@/lib/auth"
import { isAppwriteConfigured } from "@/lib/appwrite"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  configError: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [configError, setConfigError] = useState<string | null>(null)

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") {
      setLoading(false)
      return
    }

    // Check configuration first
    if (!isAppwriteConfigured()) {
      setConfigError("Appwrite configuration is incomplete. Please check your environment variables.")
      setLoading(false)
      return
    }

    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Auth check error:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async () => {
    try {
      if (configError) {
        throw new Error("Cannot login: " + configError)
      }

      // Check if we're in the browser
      if (typeof window === "undefined") {
        throw new Error("Login must be called from the browser")
      }

      await authService.loginWithGoogle()
      // The OAuth flow will redirect the user
    } catch (error) {
      console.error("Login error:", error)
      // Only throw if it's not a redirect-related error
      if (error instanceof Error && !error.message?.includes("redirect") && !error.message?.includes("OAuth")) {
        throw error
      }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    configError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
