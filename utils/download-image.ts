export async function downloadImage(imageUrl: string, filename?: string) {
  try {
    // Generate a meaningful filename if not provided
    if (!filename) {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
      filename = `generated-image-${timestamp}.png`
    }

    // Handle different types of image URLs
    let blob: Blob

    if (imageUrl.startsWith("data:")) {
      // Handle base64 data URLs
      const response = await fetch(imageUrl)
      blob = await response.blob()
    } else {
      // Handle regular URLs with CORS handling
      try {
        const response = await fetch(imageUrl, {
          mode: "cors",
          headers: {
            Origin: window.location.origin,
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        blob = await response.blob()
      } catch (corsError) {
        // If CORS fails, try using a proxy approach
        console.log("Direct fetch failed, trying proxy approach...")

        // Create a canvas to convert the image
        const img = new Image()
        img.crossOrigin = "anonymous"

        return new Promise((resolve, reject) => {
          img.onload = () => {
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")

            canvas.width = img.width
            canvas.height = img.height

            ctx?.drawImage(img, 0, 0)

            canvas.toBlob(
              (canvasBlob) => {
                if (canvasBlob) {
                  const url = window.URL.createObjectURL(canvasBlob)
                  const link = document.createElement("a")
                  link.href = url
                  link.download = filename!
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                  window.URL.revokeObjectURL(url)
                  resolve(undefined)
                } else {
                  reject(new Error("Failed to create blob from canvas"))
                }
              },
              "image/png",
              1.0,
            )
          }

          img.onerror = () => {
            reject(new Error("Failed to load image for download"))
          }

          img.src = imageUrl
        })
      }
    }

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    console.log("Image downloaded successfully:", filename)
  } catch (error) {
    console.error("Failed to download image:", error)

    // Fallback: open image in new tab
    try {
      window.open(imageUrl, "_blank")
    } catch (fallbackError) {
      console.error("Fallback download method also failed:", fallbackError)
      throw new Error("Unable to download image. Please try right-clicking and saving the image manually.")
    }
  }
}

export async function shareImage(imageUrl: string, prompt: string) {
  try {
    // Check if Web Share API is supported
    if (navigator.share) {
      // For data URLs, we need to convert to blob first
      if (imageUrl.startsWith("data:")) {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const file = new File([blob], "generated-image.png", { type: "image/png" })

        await navigator.share({
          title: "AI Generated Image",
          text: `Check out this AI-generated image: "${prompt}"`,
          files: [file],
        })
      } else {
        // For regular URLs, share the URL
        await navigator.share({
          title: "AI Generated Image",
          text: `Check out this AI-generated image: "${prompt}"`,
          url: imageUrl,
        })
      }
    } else {
      // Fallback: copy to clipboard
      await copyImageToClipboard(imageUrl, prompt)
    }
  } catch (error) {
    console.error("Failed to share image:", error)

    // Final fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(imageUrl)
      alert("Image URL copied to clipboard!")
    } catch (clipboardError) {
      console.error("Clipboard access failed:", clipboardError)
      throw new Error("Unable to share image. Please copy the image URL manually.")
    }
  }
}

async function copyImageToClipboard(imageUrl: string, prompt: string) {
  try {
    if (imageUrl.startsWith("data:")) {
      // Handle base64 data URLs
      const response = await fetch(imageUrl)
      const blob = await response.blob()

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ])

      alert("Image copied to clipboard!")
    } else {
      // For regular URLs, copy the URL with description
      const textToCopy = `AI Generated Image: "${prompt}"\n${imageUrl}`
      await navigator.clipboard.writeText(textToCopy)
      alert("Image URL and description copied to clipboard!")
    }
  } catch (error) {
    console.error("Failed to copy to clipboard:", error)
    throw error
  }
}
