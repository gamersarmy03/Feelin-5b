import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      apis: {
        imagen: {
          configured: !!process.env.GOOGLE_CLOUD_ACCESS_TOKEN,
          model: "imagen-3.0-generate-002",
          endpoint: "Google Vertex AI",
        },
      },
      recommendations: [],
    }

    // Add recommendations based on configuration
    if (!status.apis.imagen.configured) {
      status.recommendations.push("Configure GOOGLE_CLOUD_ACCESS_TOKEN for Imagen 3.0 generation")
      status.recommendations.push("Set up Google Cloud Project with Vertex AI enabled")
      status.recommendations.push("Enable Imagen API in Google Cloud Console")
    }

    return NextResponse.json(status)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
