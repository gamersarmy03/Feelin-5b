"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Key, ExternalLink, Copy, Check } from "lucide-react"

interface ConfigGuideProps {
  isOpen: boolean
  onClose: () => void
}

export function ConfigGuide({ isOpen, onClose }: ConfigGuideProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copyToClipboard = async (text: string, keyName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(keyName)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Imagen 3.0 Configuration Guide
            </CardTitle>
            <Button onClick={onClose} variant="ghost" size="sm" className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Cloud Setup */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500">Required</Badge>
              <h3 className="font-semibold">Google Cloud Setup</h3>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  1. Go to{" "}
                  <a
                    href="https://console.cloud.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Google Cloud Console <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
                <p className="text-sm text-gray-700">2. Create a new project or select existing one</p>
                <p className="text-sm text-gray-700">3. Enable the Vertex AI API</p>
                <p className="text-sm text-gray-700">4. Enable the Imagen API</p>
                <p className="text-sm text-gray-700">5. Create a service account with Vertex AI permissions</p>
                <p className="text-sm text-gray-700">6. Generate and download the service account key (JSON)</p>
              </div>
            </div>
          </div>

          {/* Authentication Setup */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500">Authentication</Badge>
              <h3 className="font-semibold">Service Account Authentication</h3>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="space-y-2">
                <p className="text-sm text-gray-700">1. Use Google Cloud SDK to authenticate:</p>
                <div className="bg-black text-green-400 p-3 rounded font-mono text-sm">
                  <div>gcloud auth application-default login</div>
                </div>

                <p className="text-sm text-gray-700 mt-3">2. Or set the service account key file path:</p>
                <div className="bg-black text-green-400 p-3 rounded font-mono text-sm flex items-center justify-between">
                  <span>GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json</span>
                  <Button
                    onClick={() =>
                      copyToClipboard("GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json", "gac")
                    }
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-green-400 hover:text-green-300"
                  >
                    {copiedKey === "gac" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>

                <p className="text-sm text-gray-700 mt-3">3. Or get an access token and set:</p>
                <div className="bg-black text-green-400 p-3 rounded font-mono text-sm flex items-center justify-between">
                  <span>GOOGLE_CLOUD_ACCESS_TOKEN=your_access_token</span>
                  <Button
                    onClick={() => copyToClipboard("GOOGLE_CLOUD_ACCESS_TOKEN=your_access_token", "token")}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-green-400 hover:text-green-300"
                  >
                    {copiedKey === "token" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>

              <div className="text-xs text-gray-600">
                <strong>Benefits:</strong> Highest quality AI image generation, Google's latest model, enterprise-grade
                reliability
              </div>
            </div>
          </div>

          {/* Project Configuration */}
          <div className="space-y-3">
            <h3 className="font-semibold">Project Configuration</h3>

            <div className="bg-purple-50 p-4 rounded-lg space-y-3">
              <p className="text-sm text-gray-700">
                Update the API endpoint in <code>app/api/generate/route.ts</code>:
              </p>

              <div className="bg-black text-green-400 p-3 rounded font-mono text-sm">
                <div>// Replace YOUR_PROJECT_ID with your actual project ID</div>
                <div>
                  const endpoint =
                  `https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT_ID/locations/us-central1/publishers/google/models/imagen-3.0-generate-002:predict`
                </div>
              </div>
            </div>
          </div>

          {/* Local Development */}
          <div className="space-y-3">
            <h3 className="font-semibold">Local Development Setup</h3>

            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <p className="text-sm text-gray-700">
                Create a <code>.env.local</code> file in your project root:
              </p>

              <div className="bg-black text-green-400 p-3 rounded font-mono text-sm">
                <div># Google Cloud Authentication</div>
                <div>GOOGLE_CLOUD_ACCESS_TOKEN=your_access_token</div>
                <div className="mt-2"># Or use service account file</div>
                <div>GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json</div>
              </div>

              <p className="text-xs text-gray-600">
                <strong>Note:</strong> Restart your development server after adding environment variables
              </p>
            </div>
          </div>

          {/* Vercel Deployment */}
          <div className="space-y-3">
            <h3 className="font-semibold">Vercel Deployment</h3>

            <div className="bg-purple-50 p-4 rounded-lg space-y-3">
              <p className="text-sm text-gray-700">1. Go to your Vercel project dashboard</p>
              <p className="text-sm text-gray-700">2. Navigate to Settings → Environment Variables</p>
              <p className="text-sm text-gray-700">
                3. Add GOOGLE_CLOUD_ACCESS_TOKEN for all environments (Production, Preview, Development)
              </p>
              <p className="text-sm text-gray-700">4. Redeploy your application</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Got it!</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
