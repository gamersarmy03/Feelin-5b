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
  loginError: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [configError, setConfigError] = useState<string | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)

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
      setLoginError(null)

      if (configError) {
        throw new Error("Cannot login: " + configError)
      }

      // Check if we're in the browser
      if (typeof window === "undefined") {
        throw new Error("Login must be called from the browser")
      }

      // Validate environment variables
      const appUrl = process.env.NEXT_PUBLIC_APP_URL
      if (!appUrl) {
        // Try to construct from window.location
        const currentUrl = `${window.location.protocol}//${window.location.host}`
        console.warn("NEXT_PUBLIC_APP_URL not set, using current URL:", currentUrl)
      }

      await authService.loginWithGoogle()
      // The OAuth flow will redirect the user, so we don't need to do anything else here
    } catch (error) {
      console.error("Login error:", error)
      const errorMessage = error instanceof Error ? error.message : "Login failed"
      setLoginError(errorMessage)

      // Only throw if it's not a redirect-related error
      if (!errorMessage.includes("redirect") && !errorMessage.includes("OAuth")) {
        throw error
      }
    }
  }

  const logout = async () => {
    try {
      setLoginError(null)
      await authService.logout()
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
      const errorMessage = error instanceof Error ? error.message : "Logout failed"
      setLoginError(errorMessage)
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
    loginError,
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
