"use client"

import { useState } from "react"
import { useAuth } from "./use-auth"
import { databaseService } from "@/lib/database"
import { storageService } from "@/lib/storage"

interface GenerationParams {
  prompt: string
  style: string
  aspectRatio: string
}

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  style: string
  aspectRatio: string
  timestamp: number
  isPlaceholder?: boolean
  note?: string
  provider?: string
  archiveUrl?: string
  likes?: number
}

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [error, setError] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuth()

  const generateImage = async ({ prompt, style, aspectRatio }: GenerationParams) => {
    if (!prompt.trim()) {
      setError("Please enter a prompt")
      return null
    }

    if (!isAuthenticated) {
      setError("Please sign in with Google to generate images")
      return null
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
          aspectRatio,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Network error occurred" }))
        setError(errorData.error || `HTTP ${response.status}: Failed to generate image`)
        return null
      }

      const data = await response.json()

      if (!data.success) {
        setError(data.error || "Failed to generate image")
        return null
      }

      // Upload to Internet Archive if it's a real generated image
      let archiveUrl = ""
      if (!data.isPlaceholder && user) {
        try {
          console.log("Uploading to Internet Archive...")

          // Download the image as blob
          const imageBlob = await storageService.downloadImageAsBlob(data.imageUrl)

          // Upload to Internet Archive via server API
          const uploadResult = await storageService.uploadToInternetArchive(imageBlob, `${data.id}.png`, {
            title: `AI Generated Image: ${prompt.slice(0, 50)}`,
            description: `Generated with prompt: "${prompt}" using ${data.provider}`,
            creator: user.name || user.email,
            subject: `AI Art, ${style}, Generated Image`,
          })

          archiveUrl = uploadResult.archiveUrl
          console.log("Successfully uploaded to Internet Archive:", archiveUrl)
        } catch (uploadError) {
          console.error("Failed to upload to Internet Archive:", uploadError)
          // Continue without archive URL - don't fail the entire generation
        }
      }

      // Save to database
      if (user) {
        try {
          await databaseService.createImageRecord({
            userId: user.$id,
            prompt: data.prompt || prompt,
            style: data.style || style,
            aspectRatio: data.aspectRatio || aspectRatio,
            imageUrl: data.imageUrl,
            archiveUrl,
            provider: data.provider || "Unknown",
            isPlaceholder: data.isPlaceholder || false,
            note: data.note,
          })
        } catch (dbError) {
          console.error("Failed to save to database:", dbError)
          // Continue without saving to database - don't fail the entire generation
        }
      }

      const newImage: GeneratedImage = {
        id: data.id || Date.now().toString(),
        url: data.imageUrl,
        prompt: data.prompt || prompt,
        style: data.style || style,
        aspectRatio: data.aspectRatio || aspectRatio,
        timestamp: Date.now(),
        isPlaceholder: data.isPlaceholder || false,
        note: data.note,
        provider: data.provider,
        archiveUrl,
        likes: 0,
      }

      setGeneratedImages((prev) => [newImage, ...prev])

      if (data.isPlaceholder) {
        setError("Please sign in with Google to access AI image generation")
      }

      return newImage
    } catch (err) {
      console.error("Generation error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to generate image"
      setError(`Network error: ${errorMessage}`)
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    generateImage,
    isGenerating,
    generatedImages,
    error,
    clearError: () => setError(null),
  }
}
