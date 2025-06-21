# Ideogram.ai Clone - Imagen 3.0 Edition

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/gamersarmy03-8578s-projects/v0-ideogram-ai-clone)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/XkIta3jm5JU)

## Overview

A modern AI image generation platform powered exclusively by Google's Imagen 3.0 model, built with Next.js 14, Appwrite, and Google Cloud Vertex AI.

## Features

- 🎨 **Google Imagen 3.0** - Latest and highest quality AI image generation
- 🔐 **Google Authentication** - Secure login with Appwrite
- 📦 **Internet Archive Backup** - Automatic image archival
- 💾 **Database Storage** - Image metadata and user management
- 📱 **Responsive Design** - Works on all devices
- 🎯 **Multiple Styles** - Realistic, Digital Art, Anime, 3D Render, etc.
- 📐 **Aspect Ratios** - 1:1, 16:9, 9:16 support

## AI Model

This application uses **Google's Imagen 3.0** (`imagen-3.0-generate-002`) exclusively:
- **Highest Quality**: State-of-the-art image generation
- **Latest Technology**: Google's most advanced model
- **Enterprise Grade**: Reliable and scalable
- **Multiple Formats**: Supports various aspect ratios

## Environment Variables

### Required (Client-side)
\`\`\`env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_IMAGES_COLLECTION_ID=your_collection_id
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
\`\`\`

### Required (Server-side)
\`\`\`env
# Google Cloud Authentication (choose one)
GOOGLE_CLOUD_ACCESS_TOKEN=your_access_token
# OR
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Internet Archive (optional)
INTERNET_ARCHIVE_ACCESS_KEY=your_access_key
INTERNET_ARCHIVE_SECRET_KEY=your_secret_key
\`\`\`

## Google Cloud Setup

1. **Create Google Cloud Project**
2. **Enable APIs**:
   - Vertex AI API
   - Imagen API
3. **Create Service Account** with Vertex AI permissions
4. **Authentication** (choose one):
   - Set `GOOGLE_CLOUD_ACCESS_TOKEN` environment variable
   - Set `GOOGLE_APPLICATION_CREDENTIALS` to service account JSON path
   - Use `gcloud auth application-default login`

## Deployment

Your project is live at:

**[https://vercel.com/gamersarmy03-8578s-projects/v0-ideogram-ai-clone](https://vercel.com/gamersarmy03-8578s-projects/v0-ideogram-ai-clone)**

## Setup Instructions

1. **Clone the repository**
2. **Set up Google Cloud**:
   - Create project and enable Vertex AI + Imagen APIs
   - Create service account with proper permissions
   - Get authentication credentials
3. **Set up Appwrite**:
   - Create project and configure OAuth
   - Create database and collections
4. **Configure environment variables**
5. **Update project ID** in `app/api/generate/route.ts`
6. **Deploy to Vercel**

## Security

- ✅ **Server-side credentials** - Google Cloud keys kept secure
- ✅ **OAuth authentication** - Secure Google login
- ✅ **Input validation** - All prompts validated
- ✅ **Enterprise API** - Google Cloud Vertex AI

## Tech Stack

- **Framework**: Next.js 14
- **AI Model**: Google Imagen 3.0
- **Authentication**: Appwrite + Google OAuth
- **Database**: Appwrite Database
- **Storage**: Internet Archive
- **Deployment**: Vercel
- **Styling**: Tailwind CSS + shadcn/ui

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/XkIta3jm5JU](https://v0.dev/chat/projects/XkIta3jm5JU)**

## How It Works

1. User enters prompt and selects style/aspect ratio
2. Enhanced prompt sent to Google Imagen 3.0 via Vertex AI
3. High-quality image generated and returned as base64
4. Image automatically backed up to Internet Archive
5. Metadata saved to Appwrite database
6. Image displayed in responsive gallery
