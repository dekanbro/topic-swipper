"use client"

import { Bug } from "lucide-react"
import { Button } from "./ui/button"

interface DebugPanelProps {
  handleDebugTopics: () => void
  canGoDeeper: boolean
  canGoBack: boolean
  isAtTop: boolean
  isAtBottom: boolean
  debugInfo: string[]
}

export default function DebugPanel({
  handleDebugTopics,
  canGoDeeper,
  canGoBack,
  isAtTop,
  isAtBottom,
  debugInfo
}: DebugPanelProps) {
  return (
    <>
      <div className="w-full max-w-sm mb-4">
        <Button 
          onClick={handleDebugTopics}
          variant="outline"
          className="w-full"
        >
          <Bug className="mr-2 h-4 w-4" />
          Log Topics Tree
        </Button>
      </div>
      <div className="text-sm mb-2 w-full max-w-sm">
        <p>Can go deeper: {canGoDeeper ? "Yes" : "No"}</p>
        <p>Can go back: {canGoBack ? "Yes" : "No"}</p>
        <p>At top: {isAtTop ? "Yes" : "No"}</p>
        <p>At bottom: {isAtBottom ? "Yes" : "No"}</p>
      </div>
      <div className="mt-4 text-sm max-h-40 overflow-y-auto w-full max-w-sm bg-white rounded p-2">
        <h3 className="font-bold">Debug Info:</h3>
        {debugInfo.map((info, index) => (
          <p key={index} className="text-xs">
            {info}
          </p>
        ))}
      </div>
    </>
  )
} 