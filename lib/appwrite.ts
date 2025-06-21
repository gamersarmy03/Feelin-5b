import { Client, Account, Databases, Storage, ID } from "appwrite"

// Ensure we have the required environment variables
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID

if (!endpoint || !projectId) {
  console.error("Missing required Appwrite environment variables:", {
    endpoint: !!endpoint,
    projectId: !!projectId,
  })
}

const client = new Client()

client.setEndpoint(endpoint || "https://cloud.appwrite.io/v1").setProject(projectId || "")

export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)

export { ID }

// Database and collection IDs with validation
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || ""
export const IMAGES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_IMAGES_COLLECTION_ID || ""
export const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID || ""

// Validate configuration
export const isAppwriteConfigured = () => {
  const hasBasicConfig = !!(endpoint && projectId && DATABASE_ID && IMAGES_COLLECTION_ID)
  const hasAppUrl = !!process.env.NEXT_PUBLIC_APP_URL

  if (!hasBasicConfig) {
    console.error("Missing Appwrite configuration:", {
      endpoint: !!endpoint,
      projectId: !!projectId,
      databaseId: !!DATABASE_ID,
      collectionId: !!IMAGES_COLLECTION_ID,
    })
  }

  if (!hasAppUrl) {
    console.warn("NEXT_PUBLIC_APP_URL not set - OAuth redirects may fail")
  }

  return hasBasicConfig
}
