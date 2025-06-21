import { account } from "./appwrite"
import { OAuthProvider } from "appwrite"

export interface User {
  $id: string
  name: string
  email: string
  avatar?: string
}

export const authService = {
  // Google OAuth login
  async loginWithGoogle() {
    try {
      // Get the base URL safely
      let baseUrl: string

      if (typeof window !== "undefined") {
        // Client-side: use window.location
        baseUrl = `${window.location.protocol}//${window.location.host}`
      } else {
        // Server-side: use environment variable or default
        baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }

      // Validate the base URL
      try {
        new URL(baseUrl)
      } catch (urlError) {
        console.error("Invalid base URL:", baseUrl)
        throw new Error("Invalid application URL configuration")
      }

      const successUrl = `${baseUrl}/auth/callback`
      const failureUrl = `${baseUrl}/auth/failure`

      console.log("OAuth URLs:", { baseUrl, successUrl, failureUrl })

      // Validate the constructed URLs
      try {
        new URL(successUrl)
        new URL(failureUrl)
      } catch (urlError) {
        console.error("Invalid OAuth URLs:", { successUrl, failureUrl })
        throw new Error("Failed to construct valid OAuth redirect URLs")
      }

      // Create the OAuth session
      await account.createOAuth2Session(OAuthProvider.Google, successUrl, failureUrl)
    } catch (error) {
      console.error("Google login error:", error)
      throw error
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await account.get()
      return {
        $id: user.$id,
        name: user.name,
        email: user.email,
        avatar: user.prefs?.avatar,
      }
    } catch (error) {
      return null
    }
  },

  // Logout
  async logout() {
    try {
      await account.deleteSession("current")
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  },

  // Check if user is logged in
  async isLoggedIn(): Promise<boolean> {
    try {
      await account.get()
      return true
    } catch {
      return false
    }
  },
}
