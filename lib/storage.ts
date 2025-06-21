// Internet Archive S3 storage service
export interface UploadResult {
  url: string
  archiveUrl: string
  identifier: string
}

export const storageService = {
  // Upload image to Internet Archive
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
      const accessKey = process.env.NEXT_PUBLIC_INTERNET_ARCHIVE_ACCESS_KEY
      const secretKey = process.env.NEXT_PUBLIC_INTERNET_ARCHIVE_SECRET_KEY

      if (!accessKey || !secretKey) {
        throw new Error("Internet Archive credentials not configured")
      }

      // Generate unique identifier for Internet Archive
      const timestamp = Date.now()
      const identifier = `ai-generated-image-${timestamp}`

      // Create form data for upload
      const formData = new FormData()
      formData.append("file", imageBlob, filename)

      // Add metadata
      formData.append("name", identifier)
      formData.append("title", metadata.title)
      formData.append("description", metadata.description)
      formData.append("creator", metadata.creator)
      formData.append("subject", metadata.subject)
      formData.append("mediatype", "image")
      formData.append("collection", "opensource_media")

      // Upload to Internet Archive
      const uploadUrl = `https://s3.us.archive.org/${identifier}/${filename}`

      const response = await fetch(`/api/upload-to-archive`, {
        method: "POST",
        body: JSON.stringify({
          identifier,
          filename,
          metadata,
          imageData: await blobToBase64(imageBlob),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to upload to Internet Archive")
      }

      const result = await response.json()

      return {
        url: uploadUrl,
        archiveUrl: `https://archive.org/details/${identifier}`,
        identifier,
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
