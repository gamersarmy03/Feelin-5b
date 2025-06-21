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
      // Get the current origin, with fallback for SSR
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"

      // Create the OAuth session with proper URL construction
      await account.createOAuth2Session(OAuthProvider.Google, `${origin}/auth/callback`, `${origin}/auth/failure`)
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
