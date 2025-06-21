"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Sparkles,
  Download,
  Heart,
  Share2,
  MoreHorizontal,
  User,
  Settings,
  LogOut,
  ImageIcon,
  Palette,
  ExternalLink,
} from "lucide-react"
import Image from "next/image"
import { useImageGeneration } from "@/hooks/use-image-generation"
import { useAuth } from "@/hooks/use-auth"
import { AuthGuard } from "@/components/auth-guard"
import { downloadImage, shareImage } from "@/utils/download-image"
import { databaseService } from "@/lib/database"

// Custom Image component with error handling
function SafeImage({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  if (error) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`}>
        <div className="text-center text-gray-500">
          <ImageIcon className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Image failed to load</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {loading && (
        <div className={`${className} bg-gray-200 flex items-center justify-center absolute inset-0`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      )}
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
        unoptimized={
          src.startsWith("data:") ||
          src.includes("picsum.photos") ||
          src.includes("pollinations") ||
          src.includes("huggingface")
        }
      />
    </div>
  )
}

function IdeogramApp() {
  const [prompt, setPrompt] = useState("")
  const { generateImage, isGenerating, generatedImages, error, clearError } = useImageGeneration()
  const { user, logout } = useAuth()
  const [selectedStyle, setSelectedStyle] = useState("auto")
  const [aspectRatio, setAspectRatio] = useState("1:1")
  const [publicImages, setPublicImages] = useState<any[]>([])
  const [loadingPublicImages, setLoadingPublicImages] = useState(true)

  // Load public images on component mount
  useEffect(() => {
    loadPublicImages()
  }, [])

  const loadPublicImages = async () => {
    try {
      const images = await databaseService.getPublicImages(12)
      setPublicImages(images)
    } catch (error) {
      console.error("Failed to load public images:", error)
    } finally {
      setLoadingPublicImages(false)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    const result = await generateImage({
      prompt,
      style: selectedStyle,
      aspectRatio,
    })

    if (result && !result.isPlaceholder) {
      // Refresh public images to show the new one
      loadPublicImages()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleGenerate()
    }
  }

  const handleLike = async (imageId: string, currentLikes: number) => {
    try {
      const newLikes = currentLikes + 1
      await databaseService.updateImageLikes(imageId, newLikes)

      // Update local state
      setPublicImages((prev) => prev.map((img) => (img.$id === imageId ? { ...img, likes: newLikes } : img)))
    } catch (error) {
      console.error("Failed to update likes:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Ideogram</span>
              </div>
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">
                  Generate
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700">
                  Explore
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700">
                  Community
                </a>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{user.name?.[0] || user.email[0]}</AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline">{user.name || user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generation Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Image</h2>
                    <Textarea
                      placeholder="Describe the image you want to create... (Ctrl+Enter to generate)"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="min-h-[100px] resize-none"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Style</label>
                      <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto</SelectItem>
                          <SelectItem value="realistic">Realistic</SelectItem>
                          <SelectItem value="digital-art">Digital Art</SelectItem>
                          <SelectItem value="painting">Painting</SelectItem>
                          <SelectItem value="anime">Anime</SelectItem>
                          <SelectItem value="3d-render">3D Render</SelectItem>
                          <SelectItem value="minimalist">Minimalist</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Aspect Ratio</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["1:1", "16:9", "9:16"].map((ratio) => (
                          <Button
                            key={ratio}
                            variant={aspectRatio === ratio ? "default" : "outline"}
                            size="sm"
                            onClick={() => setAspectRatio(ratio)}
                            className="text-xs"
                          >
                            {ratio}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>

                  {error && (
                    <div className="p-3 border rounded-md bg-red-50 border-red-200">
                      <p className="text-sm text-red-600">{error}</p>
                      <Button variant="ghost" size="sm" onClick={clearError} className="h-6 px-2 text-xs mt-2">
                        Dismiss
                      </Button>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 text-center">
                    <p>Free AI Image Generation</p>
                    <p className="mt-1">Powered by Pollinations AI • Backed up to Internet Archive</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Image Gallery */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Creations</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Palette className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User's generated images */}
              {generatedImages.map((image) => (
                <Card key={image.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <SafeImage
                      src={image.url || "/placeholder.svg"}
                      alt={image.prompt}
                      width={400}
                      height={400}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-green-500 hover:bg-green-600">New</Badge>
                    </div>
                    {image.provider && (
                      <div className="absolute bottom-3 left-3">
                        <Badge variant="secondary" className="text-xs">
                          {image.provider}
                        </Badge>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={async () => {
                              try {
                                const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
                                const filename = `${image.prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "-")}-${timestamp}.png`
                                await downloadImage(image.url, filename)
                              } catch (error) {
                                alert(`Download failed: ${error instanceof Error ? error.message : "Unknown error"}`)
                              }
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async () => {
                              try {
                                await shareImage(image.url, image.prompt)
                              } catch (error) {
                                alert(`Share failed: ${error instanceof Error ? error.message : "Unknown error"}`)
                              }
                            }}
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          {image.archiveUrl && (
                            <DropdownMenuItem onClick={() => window.open(image.archiveUrl, "_blank")}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View on Archive
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{image.prompt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{user?.name?.[0] || "Y"}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-700">You</span>
                        <Badge variant="secondary" className="text-xs">
                          {image.style}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <Heart className="w-4 h-4 mr-1" />
                        {image.likes || 0}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Public images from database */}
              {!loadingPublicImages &&
                publicImages.map((image) => (
                  <Card key={image.$id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <SafeImage
                        src={image.imageUrl || "/placeholder.svg"}
                        alt={image.prompt}
                        width={400}
                        height={400}
                        className="w-full h-64 object-cover"
                      />
                      {image.provider && (
                        <div className="absolute bottom-3 left-3">
                          <Badge variant="secondary" className="text-xs">
                            {image.provider}
                          </Badge>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={async () => {
                                try {
                                  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
                                  const filename = `${image.prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "-")}-${timestamp}.png`
                                  await downloadImage(image.imageUrl, filename)
                                } catch (error) {
                                  alert(`Download failed: ${error instanceof Error ? error.message : "Unknown error"}`)
                                }
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                try {
                                  await shareImage(image.imageUrl, image.prompt)
                                } catch (error) {
                                  alert(`Share failed: ${error instanceof Error ? error.message : "Unknown error"}`)
                                }
                              }}
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            {image.archiveUrl && (
                              <DropdownMenuItem onClick={() => window.open(image.archiveUrl, "_blank")}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View on Archive
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{image.prompt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-700">Community</span>
                          <Badge variant="secondary" className="text-xs">
                            {image.style}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => handleLike(image.$id, image.likes || 0)}
                        >
                          <Heart className="w-4 h-4 mr-1" />
                          {image.likes || 0}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

              {loadingPublicImages && (
                <div className="col-span-2 text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading community images...</p>
                </div>
              )}
            </div>

            <div className="mt-8 text-center">
              <Button variant="outline" onClick={loadPublicImages}>
                Load More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function IdeogramClone() {
  return (
    <AuthGuard>
      <IdeogramApp />
    </AuthGuard>
  )
}
