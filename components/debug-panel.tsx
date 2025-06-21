"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Bug, CheckCircle, XCircle, TestTube, Settings } from "lucide-react"

interface APIStatus {
  apis: {
    fal: {
      configured: boolean
      keyLength: number
      keyPreview: string
    }
    lightx: {
      configured: boolean
      keyLength: number
      keyPreview: string
    }
  }
  recommendations: string[]
}

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<"unknown" | "working" | "error">("unknown")
  const [configStatus, setConfigStatus] = useState<APIStatus | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchConfigStatus()
    }
  }, [isOpen])

  const fetchConfigStatus = async () => {
    try {
      const response = await fetch("/api/status")
      const data = await response.json()
      setConfigStatus(data)
    } catch (error) {
      console.error("Failed to fetch config status:", error)
    }
  }

  const testBasicAPI = async () => {
    setIsLoading(true)
    setTestResult(null)
    setApiStatus("unknown")

    try {
      const response = await fetch("/api/test", {
        method: "GET",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setTestResult(`✅ Basic API Working!\n${JSON.stringify(data, null, 2)}`)
      } else {
        setTestResult(`❌ Basic API Error:\n${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      setTestResult(`❌ Network Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testGenerationAPI = async () => {
    setIsLoading(true)
    setTestResult(null)
    setApiStatus("unknown")

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: "a simple red circle on white background",
          style: "auto",
          aspectRatio: "1:1",
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setApiStatus("working")
        setTestResult(
          `✅ Generation API Working!\nProvider: ${data.provider}\nImage URL: ${data.imageUrl}\nPrompt: ${data.prompt}\nIs Placeholder: ${data.isPlaceholder || false}`,
        )
      } else {
        setApiStatus("error")
        setTestResult(`❌ Generation API Error:\n${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      setApiStatus("error")
      setTestResult(`❌ Network Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={() => setIsOpen(true)} variant="outline" size="sm" className="bg-white shadow-lg">
          <Bug className="w-4 h-4 mr-2" />
          Debug
          {apiStatus === "working" && <CheckCircle className="w-3 h-3 ml-2 text-green-500" />}
          {apiStatus === "error" && <XCircle className="w-3 h-3 ml-2 text-red-500" />}
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center">
              <Bug className="w-4 h-4 mr-2" />
              API Debug Panel
            </CardTitle>
            <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm" className="h-6 w-6 p-0">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configuration Status */}
          {configStatus && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Configuration Status</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Fal AI:</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={configStatus.apis.fal.configured ? "default" : "outline"}>
                      {configStatus.apis.fal.configured ? "Configured" : "Not Set"}
                    </Badge>
                    {configStatus.apis.fal.configured && (
                      <span className="text-xs text-gray-500">{configStatus.apis.fal.keyPreview}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">LightX AI:</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={configStatus.apis.lightx.configured ? "default" : "outline"}>
                      {configStatus.apis.lightx.configured ? "Configured" : "Not Set"}
                    </Badge>
                    {configStatus.apis.lightx.configured && (
                      <span className="text-xs text-gray-500">{configStatus.apis.lightx.keyPreview}</span>
                    )}
                  </div>
                </div>
              </div>

              {configStatus.recommendations.length > 0 && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <div className="font-medium text-yellow-800 mb-1">Recommendations:</div>
                  {configStatus.recommendations.map((rec, index) => (
                    <div key={index} className="text-yellow-700">
                      • {rec}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* API Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">API Status:</span>
            <Badge
              variant={apiStatus === "working" ? "default" : apiStatus === "error" ? "destructive" : "outline"}
              className="flex items-center gap-1"
            >
              {apiStatus === "working" && <CheckCircle className="w-3 h-3" />}
              {apiStatus === "error" && <XCircle className="w-3 h-3" />}
              {apiStatus === "working" ? "Working" : apiStatus === "error" ? "Error" : "Unknown"}
            </Badge>
          </div>

          {/* Test Buttons */}
          <div className="space-y-2">
            <Button onClick={testBasicAPI} disabled={isLoading} size="sm" className="w-full" variant="outline">
              <TestTube className="w-4 h-4 mr-2" />
              {isLoading ? "Testing..." : "Test Basic API"}
            </Button>

            <Button onClick={testGenerationAPI} disabled={isLoading} size="sm" className="w-full">
              {isLoading ? "Testing..." : "Test Generation API"}
            </Button>
          </div>

          {/* Test Results */}
          {testResult && (
            <div className="mt-3">
              <div className="text-xs text-gray-600 mb-1">Response:</div>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40 whitespace-pre-wrap">
                {testResult}
              </pre>
            </div>
          )}

          {/* Service Info */}
          <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
            <p>
              <strong>Primary:</strong> Fal AI (FLUX Schnell)
            </p>
            <p>
              <strong>Secondary:</strong> LightX AI (Multiple Endpoints)
            </p>
            <p>
              <strong>Free Fallback:</strong> Pollinations AI
            </p>
            <p>
              <strong>Final Fallback:</strong> Hugging Face
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
