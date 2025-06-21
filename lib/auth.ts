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
      // Use environment variable or fallback for redirect URLs
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")

      const successUrl = `${baseUrl}/auth/callback`
      const failureUrl = `${baseUrl}/auth/failure`

      console.log("OAuth URLs:", { successUrl, failureUrl })

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
