"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, Sparkles, AlertCircle } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, loading, login, configError } = useAuth()
  const [loginError, setLoginError] = useState<string | null>(null)

  // Show loading state during SSR and initial client load
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  // Show configuration error if present
  if (configError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">Configuration Error</CardTitle>
            <p className="text-gray-600">{configError}</p>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 space-y-2">
              <p>Please ensure these environment variables are set:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>NEXT_PUBLIC_APPWRITE_ENDPOINT</li>
                <li>NEXT_PUBLIC_APPWRITE_PROJECT_ID</li>
                <li>NEXT_PUBLIC_APPWRITE_DATABASE_ID</li>
                <li>NEXT_PUBLIC_APPWRITE_IMAGES_COLLECTION_ID</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleLogin = async () => {
    try {
      setLoginError(null)
      await login()
    } catch (error) {
      console.error("Login failed:", error)
      setLoginError(error instanceof Error ? error.message : "Login failed")
    }
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Welcome to Ideogram</CardTitle>
              <p className="text-gray-600">Sign in to start creating amazing AI-generated images</p>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign in with Google
              </Button>

              {loginError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{loginError}</p>
                </div>
              )}

              <p className="text-xs text-gray-500 text-center mt-4">
                Your images will be stored securely and backed up to Internet Archive
              </p>
            </CardContent>
          </Card>
        </div>
      )
    )
  }

  return <>{children}</>
}
