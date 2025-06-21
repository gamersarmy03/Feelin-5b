import { type NextRequest, NextResponse } from "next/server"

// Get API keys from environment variables
const FAL_KEY = process.env.FAL_KEY
const LIGHTX_API_KEY =
  process.env.LIGHTX_API_KEY || "935f53b486ce4f94aba9544fd17931be_2e70ae7a8daa4985b1cee05d688f8453_andoraitools"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { prompt, style, aspectRatio } = body

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt is required and must be a non-empty string",
        },
        { status: 400 },
      )
    }

    // Validate other parameters
    const validStyles = ["auto", "realistic", "digital-art", "painting", "anime", "3d-render", "minimalist"]
    const validAspectRatios = ["1:1", "16:9", "9:16"]

    if (style && !validStyles.includes(style)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid style. Must be one of: ${validStyles.join(", ")}`,
        },
        { status: 400 },
      )
    }

    if (aspectRatio && !validAspectRatios.includes(aspectRatio)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid aspect ratio. Must be one of: ${validAspectRatios.join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Map aspect ratios to dimensions
    const dimensionMap: { [key: string]: { width: number; height: number } } = {
      "1:1": { width: 512, height: 512 },
      "16:9": { width: 768, height: 432 },
      "9:16": { width: 432, height: 768 },
    }

    // Enhance prompt based on style
    let enhancedPrompt = prompt.trim()
    if (style && style !== "auto") {
      const stylePrompts: { [key: string]: string } = {
        realistic: "photorealistic, high quality, detailed, 8k",
        "digital-art": "digital art, concept art, artstation trending",
        painting: "oil painting, artistic, painterly, fine art",
        anime: "anime style, manga, japanese animation style",
        "3d-render": "3D render, CGI, octane render, unreal engine",
        minimalist: "minimalist, clean, simple design, geometric",
      }

      if (stylePrompts[style]) {
        enhancedPrompt = `${prompt.trim()}, ${stylePrompts[style]}`
      }
    }

    const dimensions = dimensionMap[aspectRatio || "1:1"]

    console.log("Generating image with enhanced prompt:", enhancedPrompt)
    console.log("Available APIs:", {
      fal: !!FAL_KEY,
      lightx: !!LIGHTX_API_KEY,
    })

    // Try Fal AI first if API key is available
    if (FAL_KEY) {
      try {
        console.log("Attempting Fal AI generation...")

        const falResponse = await fetch("https://fal.run/fal-ai/flux/schnell", {
          method: "POST",
          headers: {
            Authorization: `Key ${FAL_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: enhancedPrompt,
            image_size: aspectRatio === "16:9" ? "landscape" : aspectRatio === "9:16" ? "portrait" : "square",
            num_inference_steps: 4,
            guidance_scale: 3.5,
            num_images: 1,
            enable_safety_checker: true,
          }),
        })

        if (falResponse.ok) {
          const falData = await falResponse.json()

          if (falData.images && falData.images.length > 0) {
            return NextResponse.json({
              success: true,
              imageUrl: falData.images[0].url,
              id: Date.now().toString(),
              prompt: prompt,
              style: style || "auto",
              aspectRatio: aspectRatio || "1:1",
              provider: "Fal AI",
            })
          }
        } else {
          const errorText = await falResponse.text()
          console.error("Fal AI error:", falResponse.status, errorText)
        }
      } catch (falError) {
        console.error("Fal AI error:", falError)
      }
    }

    // Try LightX API if Fal AI failed or isn't configured
    if (LIGHTX_API_KEY) {
      try {
        console.log("Attempting LightX generation...")

        // Try different LightX API configurations
        const lightxConfigs = [
          {
            url: "https://api.lightx.ai/api/v1/text-to-image",
            headers: {
              Authorization: `Bearer ${LIGHTX_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: {
              prompt: enhancedPrompt,
              width: dimensions.width,
              height: dimensions.height,
              num_inference_steps: 20,
              guidance_scale: 7.5,
            },
          },
          {
            url: "https://lightx.ai/api/generate",
            headers: {
              "X-API-Key": LIGHTX_API_KEY,
              "Content-Type": "application/json",
            },
            body: {
              text: enhancedPrompt,
              size: `${dimensions.width}x${dimensions.height}`,
              style: style !== "auto" ? style : "realistic",
            },
          },
          {
            url: "https://api.lightx.ai/generate",
            headers: {
              Authorization: `Key ${LIGHTX_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: {
              prompt: enhancedPrompt,
              image_size: aspectRatio === "16:9" ? "landscape" : aspectRatio === "9:16" ? "portrait" : "square",
              model: "stable-diffusion-xl",
            },
          },
        ]

        for (const config of lightxConfigs) {
          try {
            console.log(`Trying LightX endpoint: ${config.url}`)

            const lightxResponse = await fetch(config.url, {
              method: "POST",
              headers: config.headers,
              body: JSON.stringify(config.body),
            })

            if (lightxResponse.ok) {
              const responseText = await lightxResponse.text()

              try {
                const lightxData = JSON.parse(responseText)

                // Handle different possible response formats
                let imageUrl = null
                if (lightxData.image_url) {
                  imageUrl = lightxData.image_url
                } else if (lightxData.url) {
                  imageUrl = lightxData.url
                } else if (lightxData.images && lightxData.images.length > 0) {
                  imageUrl = lightxData.images[0].url || lightxData.images[0]
                } else if (lightxData.data && lightxData.data.url) {
                  imageUrl = lightxData.data.url
                } else if (lightxData.result && lightxData.result.url) {
                  imageUrl = lightxData.result.url
                }

                if (imageUrl) {
                  return NextResponse.json({
                    success: true,
                    imageUrl: imageUrl,
                    id: Date.now().toString(),
                    prompt: prompt,
                    style: style || "auto",
                    aspectRatio: aspectRatio || "1:1",
                    provider: "LightX AI",
                  })
                }
              } catch (parseError) {
                console.error(`Failed to parse LightX response from ${config.url}:`, parseError)
                console.log("Raw response:", responseText.substring(0, 200))
              }
            } else {
              const errorText = await lightxResponse.text()
              console.log(
                `LightX endpoint ${config.url} returned status ${lightxResponse.status}: ${errorText.substring(0, 100)}`,
              )
            }
          } catch (endpointError) {
            console.error(`LightX endpoint ${config.url} error:`, endpointError)
          }
        }

        console.log("All LightX endpoints failed or returned invalid responses")
      } catch (lightxError) {
        console.error("LightX general error:", lightxError)
      }
    }

    // Try Pollinations AI as a reliable free alternative
    try {
      console.log("Attempting Pollinations AI generation...")

      // Pollinations AI is a free service that works well
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${dimensions.width}&height=${dimensions.height}&seed=${Date.now()}&model=flux`

      const pollinationsResponse = await fetch(pollinationsUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; IdeogramClone/1.0)",
        },
      })

      if (pollinationsResponse.ok) {
        // Check if response is actually an image
        const contentType = pollinationsResponse.headers.get("content-type")
        if (contentType && contentType.startsWith("image/")) {
          // Pollinations returns the image directly
          const imageBlob = await pollinationsResponse.blob()

          // Convert blob to base64 for display
          const buffer = await imageBlob.arrayBuffer()
          const base64 = Buffer.from(buffer).toString("base64")
          const dataUrl = `data:${contentType};base64,${base64}`

          return NextResponse.json({
            success: true,
            imageUrl: dataUrl,
            id: Date.now().toString(),
            prompt: prompt,
            style: style || "auto",
            aspectRatio: aspectRatio || "1:1",
            provider: "Pollinations AI (Free)",
            note: "Generated using free Pollinations AI service",
          })
        } else {
          console.log("Pollinations response is not an image:", contentType)
        }
      } else {
        console.log("Pollinations AI failed:", pollinationsResponse.status)
      }
    } catch (pollinationsError) {
      console.error("Pollinations AI error:", pollinationsError)
    }

    // Try a free alternative API (Hugging Face Inference API)
    try {
      console.log("Attempting Hugging Face generation as fallback...")

      const hfResponse = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; IdeogramClone/1.0)",
        },
        body: JSON.stringify({
          inputs: enhancedPrompt,
          parameters: {
            num_inference_steps: 20,
            guidance_scale: 7.5,
          },
        }),
      })

      if (hfResponse.ok) {
        const contentType = hfResponse.headers.get("content-type")
        if (contentType && contentType.startsWith("image/")) {
          const imageBlob = await hfResponse.blob()

          // Convert blob to base64 for display
          const buffer = await imageBlob.arrayBuffer()
          const base64 = Buffer.from(buffer).toString("base64")
          const dataUrl = `data:${contentType};base64,${base64}`

          return NextResponse.json({
            success: true,
            imageUrl: dataUrl,
            id: Date.now().toString(),
            prompt: prompt,
            style: style || "auto",
            aspectRatio: aspectRatio || "1:1",
            provider: "Hugging Face (Free)",
            note: "Generated using free Hugging Face API",
          })
        }
      } else {
        const errorText = await hfResponse.text()
        console.log("Hugging Face error:", hfResponse.status, errorText.substring(0, 100))
      }
    } catch (hfError) {
      console.error("Hugging Face error:", hfError)
    }

    // If all APIs fail, use a high-quality placeholder service with a helpful message
    const placeholderUrl = `https://picsum.photos/${dimensions.width}/${dimensions.height}?random=${Date.now()}`

    return NextResponse.json({
      success: true,
      imageUrl: placeholderUrl,
      id: Date.now().toString(),
      prompt: prompt,
      style: style || "auto",
      aspectRatio: aspectRatio || "1:1",
      provider: "Placeholder",
      isPlaceholder: true,
      note: "All AI services are currently unavailable. Using placeholder image.",
      showSetupGuide: false,
    })
  } catch (error) {
    console.error("Generation error:", error)

    // Return detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    const errorStack = error instanceof Error ? error.stack : "No stack trace available"

    console.error("Detailed error:", { message: errorMessage, stack: errorStack })

    return NextResponse.json(
      {
        success: false,
        error: `Image generation failed: ${errorMessage}`,
        details: process.env.NODE_ENV === "development" ? errorStack : undefined,
      },
      { status: 500 },
    )
  }
}
