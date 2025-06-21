// Client-side storage service (no sensitive credentials)
export interface UploadResult {
  url: string
  archiveUrl: string
  identifier: string
}

export const storageService = {
  // Upload image to Internet Archive via server API
  async uploadToInternetArchive(
    imageBlob: Blob,
    filename: string,
    metadata: {
      title: string
      description: string
      creator: string
      subject: string
    },
  ): Promise<UploadResult> {
    try {
      // Convert blob to base64 for API transmission
      const imageData = await blobToBase64(imageBlob)

      // Call server-side API to handle the upload
      const response = await fetch("/api/upload-to-archive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename,
          metadata,
          imageData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Upload failed" }))
        throw new Error(errorData.error || "Failed to upload to Internet Archive")
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Upload failed")
      }

      return {
        url: result.url,
        archiveUrl: result.archiveUrl,
        identifier: result.identifier,
      }
    } catch (error) {
      console.error("Error uploading to Internet Archive:", error)
      throw error
    }
  },

  // Download image from URL as blob
  async downloadImageAsBlob(imageUrl: string): Promise<Blob> {
    try {
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error("Failed to download image")
      }
      return await response.blob()
    } catch (error) {
      console.error("Error downloading image:", error)
      throw error
    }
  },
}

// Helper function to convert blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(",")[1]) // Remove data:image/...;base64, prefix
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
