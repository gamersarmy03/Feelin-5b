# Ideogram.ai Clone

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/gamersarmy03-8578s-projects/v0-ideogram-ai-clone)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/XkIta3jm5JU)

## Overview

A modern AI image generation platform inspired by Ideogram.ai, built with Next.js, Appwrite, and multiple AI providers.

## Features

- 🎨 **AI Image Generation** - Multiple AI providers (Pollinations AI, Hugging Face)
- 🔐 **Google Authentication** - Secure login with Appwrite
- 📦 **Internet Archive Backup** - Automatic image archival
- 💾 **Database Storage** - Image metadata and user management
- 📱 **Responsive Design** - Works on all devices
- 🎯 **Multiple Styles** - Realistic, Digital Art, Anime, 3D Render, etc.
- 📐 **Aspect Ratios** - 1:1, 16:9, 9:16 support

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
INTERNET_ARCHIVE_ACCESS_KEY=your_access_key
INTERNET_ARCHIVE_SECRET_KEY=your_secret_key
\`\`\`

## Deployment

Your project is live at:

**[https://vercel.com/gamersarmy03-8578s-projects/v0-ideogram-ai-clone](https://vercel.com/gamersarmy03-8578s-projects/v0-ideogram-ai-clone)**

## Setup Instructions

1. **Clone the repository**
2. **Set up Appwrite**:
   - Create a new project
   - Set up Google OAuth
   - Create database and collections
3. **Configure environment variables**
4. **Deploy to Vercel**

## Security

- ✅ **Server-side credentials** - Sensitive keys are kept on the server
- ✅ **OAuth authentication** - Secure Google login
- ✅ **Input validation** - All user inputs are validated
- ✅ **CORS handling** - Proper cross-origin resource sharing

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/XkIta3jm5JU](https://v0.dev/chat/projects/XkIta3jm5JU)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
