import { type NextRequest, NextResponse } from "next/server"

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

    // Try Pollinations AI as primary free service
    try {
      console.log("Attempting Pollinations AI generation...")

      // Use enhanced parameters for better quality and no watermarks
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${dimensions.width}&height=${dimensions.height}&seed=${Date.now()}&model=flux&nologo=true&enhance=true&quality=high`

      const pollinationsResponse = await fetch(pollinationsUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; IdeogramClone/1.0)",
        },
      })

      if (pollinationsResponse.ok) {
        const contentType = pollinationsResponse.headers.get("content-type")
        if (contentType && contentType.startsWith("image/")) {
          return NextResponse.json({
            success: true,
            imageUrl: pollinationsUrl,
            id: Date.now().toString(),
            prompt: prompt,
            style: style || "auto",
            aspectRatio: aspectRatio || "1:1",
            provider: "Pollinations AI (Free)",
            note: "Generated using free Pollinations AI service",
          })
        }
      }
    } catch (pollinationsError) {
      console.error("Pollinations AI error:", pollinationsError)
    }

    // Try Hugging Face as fallback
    try {
      console.log("Attempting Hugging Face generation as fallback...")

      const hfResponse = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (compatible; IdeogramClone/1.0)",
          },
          body: JSON.stringify({
            inputs: enhancedPrompt,
            parameters: {
              num_inference_steps: 25,
              guidance_scale: 8.0,
              width: dimensions.width,
              height: dimensions.height,
            },
          }),
        },
      )

      if (hfResponse.ok) {
        const contentType = hfResponse.headers.get("content-type")
        if (contentType && contentType.startsWith("image/")) {
          const imageBlob = await hfResponse.blob()
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
      }
    } catch (hfError) {
      console.error("Hugging Face error:", hfError)
    }

    // Final fallback to placeholder
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
      note: "Using placeholder image. Please sign in to access AI generation.",
      showSetupGuide: false,
    })
  } catch (error) {
    console.error("Generation error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    return NextResponse.json(
      {
        success: false,
        error: `Image generation failed: ${errorMessage}`,
      },
      { status: 500 },
    )
  }
}
