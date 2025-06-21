import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { identifier, filename, metadata, imageData } = await request.json()

    const accessKey = process.env.INTERNET_ARCHIVE_ACCESS_KEY
    const secretKey = process.env.INTERNET_ARCHIVE_SECRET_KEY

    if (!accessKey || !secretKey) {
      return NextResponse.json({ error: "Internet Archive credentials not configured" }, { status: 500 })
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageData, "base64")

    // Create authorization header for Internet Archive S3 API
    const date = new Date().toUTCString()
    const contentType = "image/png"
    const resource = `/${identifier}/${filename}`

    const stringToSign = `PUT\n\n${contentType}\n${date}\nx-amz-auto-make-bucket:1\nx-archive-meta-collection:opensource_media\nx-archive-meta-creator:${metadata.creator}\nx-archive-meta-description:${metadata.description}\nx-archive-meta-mediatype:image\nx-archive-meta-subject:${metadata.subject}\nx-archive-meta-title:${metadata.title}\n${resource}`

    const signature = crypto.createHmac("sha1", secretKey).update(stringToSign).digest("base64")

    const authorization = `LOW ${accessKey}:${signature}`

    // Upload to Internet Archive
    const uploadResponse = await fetch(`https://s3.us.archive.org${resource}`, {
      method: "PUT",
      headers: {
        Authorization: authorization,
        Date: date,
        "Content-Type": contentType,
        "x-amz-auto-make-bucket": "1",
        "x-archive-meta-collection": "opensource_media",
        "x-archive-meta-mediatype": "image",
        "x-archive-meta-title": metadata.title,
        "x-archive-meta-description": metadata.description,
        "x-archive-meta-creator": metadata.creator,
        "x-archive-meta-subject": metadata.subject,
      },
      body: imageBuffer,
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error("Internet Archive upload failed:", uploadResponse.status, errorText)
      throw new Error(`Upload failed: ${uploadResponse.status}`)
    }

    return NextResponse.json({
      success: true,
      url: `https://s3.us.archive.org${resource}`,
      archiveUrl: `https://archive.org/details/${identifier}`,
      identifier,
    })
  } catch (error) {
    console.error("Upload to Internet Archive error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 })
  }
}
