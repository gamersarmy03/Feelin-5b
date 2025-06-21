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
              API Configuration Guide
            </CardTitle>
            <Button onClick={onClose} variant="ghost" size="sm" className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* LightX AI Configuration */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500">Built-in</Badge>
              <h3 className="font-semibold">LightX AI Configuration</h3>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <div className="bg-green-50 border border-green-200 p-3 rounded">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <strong>Already Configured:</strong> LightX API key is built into the application.
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  The application includes a LightX API key for immediate use. For production or custom usage:
                </p>
                <p className="text-sm text-gray-700">
                  1. Visit{" "}
                  <a
                    href="https://lightx.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    lightx.ai <ExternalLink className="w-3 h-3" />
                  </a>{" "}
                  and create an account
                </p>
                <p className="text-sm text-gray-700">2. Generate your own API key</p>
                <p className="text-sm text-gray-700">3. Add the environment variable:</p>
              </div>

              <div className="bg-black text-green-400 p-3 rounded font-mono text-sm flex items-center justify-between">
                <span>LIGHTX_API_KEY=your_lightx_api_key_here</span>
                <Button
                  onClick={() => copyToClipboard("LIGHTX_API_KEY=your_lightx_api_key_here", "lightx")}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-green-400 hover:text-green-300"
                >
                  {copiedKey === "lightx" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>

              <div className="text-xs text-gray-600">
                <strong>Benefits:</strong> Good quality generation, reliable service, competitive pricing
              </div>
            </div>
          </div>

          {/* Fal AI Configuration */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500">Recommended</Badge>
              <h3 className="font-semibold">Fal AI Configuration</h3>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  1. Visit{" "}
                  <a
                    href="https://fal.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    fal.ai <ExternalLink className="w-3 h-3" />
                  </a>{" "}
                  and create an account
                </p>
                <p className="text-sm text-gray-700">2. Add billing information (required for API access)</p>
                <p className="text-sm text-gray-700">3. Go to your dashboard and generate an API key</p>
                <p className="text-sm text-gray-700">4. Add the environment variable:</p>
              </div>

              <div className="bg-black text-green-400 p-3 rounded font-mono text-sm flex items-center justify-between">
                <span>FAL_KEY=your_fal_api_key_here</span>
                <Button
                  onClick={() => copyToClipboard("FAL_KEY=your_fal_api_key_here", "fal")}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-green-400 hover:text-green-300"
                >
                  {copiedKey === "fal" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>

              <div className="text-xs text-gray-600">
                <strong>Benefits:</strong> Fastest generation (2-4 seconds), highest quality, cost-effective (~$0.003
                per image)
              </div>
            </div>
          </div>

          {/* Free Alternative */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Free Fallback</Badge>
              <h3 className="font-semibold">Hugging Face (Automatic)</h3>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <p className="text-sm text-gray-700">
                If no paid APIs are configured, the system automatically tries Hugging Face's free inference API as a
                fallback.
              </p>
              <div className="text-xs text-gray-600">
                <strong>Limitations:</strong> Slower generation, basic models, rate limits
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
                <div># Fal AI (Recommended for best quality)</div>
                <div>FAL_KEY=your_fal_api_key_here</div>
                <div className="mt-2"># LightX AI (Optional - built-in key available)</div>
                <div>LIGHTX_API_KEY=your_lightx_api_key_here</div>
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
                3. Add the variables for all environments (Production, Preview, Development)
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
