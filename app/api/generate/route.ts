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

    // Map aspect ratios to Imagen 3.0 format
    const aspectRatioMap: { [key: string]: string } = {
      "1:1": "1:1",
      "16:9": "16:9",
      "9:16": "9:16",
    }

    // Enhance prompt based on style
    let enhancedPrompt = prompt.trim()
    if (style && style !== "auto") {
      const stylePrompts: { [key: string]: string } = {
        realistic: "photorealistic, high quality, detailed, professional photography",
        "digital-art": "digital art, concept art, trending on artstation, highly detailed",
        painting: "oil painting, artistic, painterly, fine art, masterpiece",
        anime: "anime style, manga, japanese animation style, cel shading",
        "3d-render": "3D render, CGI, octane render, unreal engine, highly detailed",
        minimalist: "minimalist, clean, simple design, geometric, modern",
      }

      if (stylePrompts[style]) {
        enhancedPrompt = `${prompt.trim()}, ${stylePrompts[style]}`
      }
    }

    console.log("Generating image with Imagen 3.0:", enhancedPrompt)

    // Use Google's Imagen 3.0 via Vertex AI
    try {
      const imagenResponse = await fetch(
        "https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT_ID/locations/us-central1/publishers/google/models/imagen-3.0-generate-002:predict",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GOOGLE_CLOUD_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            instances: [
              {
                prompt: enhancedPrompt,
              },
            ],
            parameters: {
              sampleCount: 1,
              aspectRatio: aspectRatioMap[aspectRatio || "1:1"],
              safetyFilterLevel: "block_some",
              personGeneration: "allow_adult",
            },
          }),
        },
      )

      if (imagenResponse.ok) {
        const data = await imagenResponse.json()

        if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
          const base64Image = data.predictions[0].bytesBase64Encoded
          const dataUrl = `data:image/png;base64,${base64Image}`

          return NextResponse.json({
            success: true,
            imageUrl: dataUrl,
            id: Date.now().toString(),
            prompt: prompt,
            style: style || "auto",
            aspectRatio: aspectRatio || "1:1",
            provider: "Google Imagen 3.0",
            note: "Generated using Google's Imagen 3.0 model",
          })
        }
      } else {
        const errorData = await imagenResponse.json().catch(() => ({}))
        console.error("Imagen 3.0 API error:", imagenResponse.status, errorData)
      }
    } catch (imagenError) {
      console.error("Imagen 3.0 error:", imagenError)
    }

    // Fallback to placeholder if Imagen 3.0 fails
    const placeholderUrl = `https://picsum.photos/512/512?random=${Date.now()}`

    return NextResponse.json({
      success: true,
      imageUrl: placeholderUrl,
      id: Date.now().toString(),
      prompt: prompt,
      style: style || "auto",
      aspectRatio: aspectRatio || "1:1",
      provider: "Placeholder",
      isPlaceholder: true,
      note: "Imagen 3.0 API not configured. Please set up Google Cloud credentials.",
      showSetupGuide: true,
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
