import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"

export const metadata: Metadata = {
  title: "Ideogram - AI Image Generator",
  description: "Create amazing AI-generated images with advanced prompts and styles",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
