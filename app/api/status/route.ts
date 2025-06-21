import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      apis: {
        fal: {
          configured: !!process.env.FAL_KEY,
          keyLength: process.env.FAL_KEY ? process.env.FAL_KEY.length : 0,
          keyPreview: process.env.FAL_KEY ? `${process.env.FAL_KEY.substring(0, 8)}...` : "Not set",
        },
        lightx: {
          configured: !!process.env.LIGHTX_API_KEY || true, // Always true since we have a fallback key
          keyLength: process.env.LIGHTX_API_KEY
            ? process.env.LIGHTX_API_KEY.length
            : "935f53b486ce4f94aba9544fd17931be_2e70ae7a8daa4985b1cee05d688f8453_andoraitools".length,
          keyPreview: process.env.LIGHTX_API_KEY
            ? `${process.env.LIGHTX_API_KEY.substring(0, 8)}...`
            : "935f53b4... (built-in)",
        },
      },
      recommendations: [],
    }

    // Add recommendations based on configuration
    if (!status.apis.fal.configured && !status.apis.lightx.configured) {
      status.recommendations.push("Configure at least one API key (FAL_KEY or LIGHTX_API_KEY)")
    }

    if (!status.apis.fal.configured) {
      status.recommendations.push("Add FAL_KEY for fast image generation with Fal AI")
    }

    if (!process.env.LIGHTX_API_KEY) {
      status.recommendations.push("Add LIGHTX_API_KEY environment variable for your own LightX key")
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
