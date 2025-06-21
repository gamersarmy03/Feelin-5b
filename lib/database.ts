import { databases, ID, DATABASE_ID, IMAGES_COLLECTION_ID } from "./appwrite"
import { Query } from "appwrite"

export interface ImageRecord {
  $id?: string
  userId: string
  prompt: string
  style: string
  aspectRatio: string
  imageUrl: string
  archiveUrl?: string
  provider: string
  isPlaceholder?: boolean
  note?: string
  likes?: number
  createdAt: string
  updatedAt?: string
}

export const databaseService = {
  // Create image record
  async createImageRecord(data: Omit<ImageRecord, "$id" | "createdAt" | "updatedAt">): Promise<ImageRecord> {
    try {
      const record = await databases.createDocument(DATABASE_ID, IMAGES_COLLECTION_ID, ID.unique(), {
        ...data,
        createdAt: new Date().toISOString(),
        likes: 0,
      })
      return record as ImageRecord
    } catch (error) {
      console.error("Error creating image record:", error)
      throw error
    }
  },

  // Get user's images
  async getUserImages(userId: string, limit = 20, offset = 0): Promise<ImageRecord[]> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, IMAGES_COLLECTION_ID, [
        Query.equal("userId", userId),
        Query.orderDesc("createdAt"),
        Query.limit(limit),
        Query.offset(offset),
      ])
      return response.documents as ImageRecord[]
    } catch (error) {
      console.error("Error fetching user images:", error)
      throw error
    }
  },

  // Get all public images
  async getPublicImages(limit = 20, offset = 0): Promise<ImageRecord[]> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, IMAGES_COLLECTION_ID, [
        Query.orderDesc("createdAt"),
        Query.limit(limit),
        Query.offset(offset),
      ])
      return response.documents as ImageRecord[]
    } catch (error) {
      console.error("Error fetching public images:", error)
      throw error
    }
  },

  // Update image likes
  async updateImageLikes(imageId: string, likes: number): Promise<void> {
    try {
      await databases.updateDocument(DATABASE_ID, IMAGES_COLLECTION_ID, imageId, { likes })
    } catch (error) {
      console.error("Error updating image likes:", error)
      throw error
    }
  },

  // Delete image record
  async deleteImageRecord(imageId: string): Promise<void> {
    try {
      await databases.deleteDocument(DATABASE_ID, IMAGES_COLLECTION_ID, imageId)
    } catch (error) {
      console.error("Error deleting image record:", error)
      throw error
    }
  },
}
