"use client"

import { useState } from "react"

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
}

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showSetupGuide, setShowSetupGuide] = useState(false)

  const generateImage = async ({ prompt, style, aspectRatio }: GenerationParams) => {
    if (!prompt.trim()) {
      setError("Please enter a prompt")
      return null
    }

    setIsGenerating(true)
    setError(null)
    setShowSetupGuide(false)

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

        // Handle specific error types
        if (errorData.isBillingError) {
          setError(`${errorData.provider} requires billing setup. Please set up billing or use Fal AI instead.`)
        } else if (errorData.isConfigurationError) {
          setError("API configuration required. Click 'Setup Guide' for instructions.")
        } else {
          setError(errorData.error || `HTTP ${response.status}: Failed to generate image`)
        }

        if (errorData.showSetupGuide) {
          setShowSetupGuide(true)
        }

        return null
      }

      const data = await response.json()

      if (!data.success) {
        setError(data.error || "Failed to generate image")
        return null
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
      }

      setGeneratedImages((prev) => [newImage, ...prev])

      // Show appropriate message based on response type
      if (data.isPlaceholder) {
        setError("Using placeholder image - API setup required for AI generation")
        setShowSetupGuide(true)
      } else if (data.note && data.provider !== "Pollinations AI (Free)") {
        // Only show notes as errors if they're not from successful free generation
        console.log("Generation note:", data.note)
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
    showSetupGuide,
    clearError: () => {
      setError(null)
      setShowSetupGuide(false)
    },
  }
}
