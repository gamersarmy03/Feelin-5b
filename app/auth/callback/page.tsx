"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function AuthCallback() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Wait a moment for auth state to update, then redirect
    const timer = setTimeout(() => {
      router.push("/")
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">Signing you in...</h2>
        <p className="text-gray-600 mt-2">Please wait while we complete your authentication.</p>
      </div>
    </div>
  )
}
