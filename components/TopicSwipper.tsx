"use client"

import { useState, useCallback, useEffect } from "react"
import { useSpring, animated } from "react-spring"
import { useDrag } from "@use-gesture/react"
import { useTopicSwipper } from "../hooks/useTopicSwipper"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, ArrowLeftRight, ArrowDown, RefreshCw, Bug, Loader2 } from "lucide-react"
import { generateTopics } from "@/services/topicService"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { SwipeHelp } from "./SwipeHelp"
import { AddTopicDialog } from "./AddTopicDialog"
import { useRouter } from "next/navigation"
import dynamic from 'next/dynamic'

const DebugPanel = dynamic(() => import('./DebugPanel'), { ssr: false })

const isDebug = process.env.NEXT_PUBLIC_DEBUG === 'true'

export function TopicSwipper() {
  const router = useRouter()
  const { currentTopic, handleSwipe, goBack, canGoDeeper, canGoBack, isAtTop, isAtBottom, addTopics, getAllTopics, getParentTopics, topicTree } = useTopicSwipper()
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const addDebugInfo = useCallback((info: string) => {
    if (!isDebug) return
    setDebugInfo((prev) => [info, ...prev.slice(0, 9)])
    console.log(info)
  }, [])

  const handleSwipeDown = useCallback(() => {
    // Get all parent topics including root
    const parentTopics = getParentTopics(currentTopic.id)
    // Get the root topic (first in the tree)
    const rootTopic = topicTree[0]
    
    // Create full path starting from root
    const fullPath = [
      // Include root topic if we're not already at root
      ...(parentTopics.length === 0 ? [] : [{ prompt: rootTopic.prompt, id: rootTopic.id }]),
      ...parentTopics,
      { prompt: currentTopic.prompt, id: currentTopic.id }
    ]
    
    const encodedTopics = encodeURIComponent(JSON.stringify(fullPath))
    router.push(`/article?topics=${encodedTopics}`)
  }, [currentTopic, getParentTopics, topicTree, router])

  useEffect(() => {
    if (isAtTop) {
      addDebugInfo("Reached the top of the tree")
    }
    if (isAtBottom) {
      addDebugInfo("Reached the bottom of the tree")
    }
  }, [isAtTop, isAtBottom, addDebugInfo])

  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }))

  const handleGenerateTopics = async () => {
    setIsGenerating(true)
    try {
      const parentTopics = getParentTopics(currentTopic.id)
      // Get the root topic if we have parent topics
      const rootTopic = topicTree[0]
      
      // Create full path starting from root
      const fullPath = [
        // Include root topic if we're not already at root
        ...(parentTopics.length === 0 ? [] : [{ prompt: rootTopic.prompt, id: rootTopic.id }]),
        ...parentTopics,
        { prompt: currentTopic.prompt, id: currentTopic.id }
      ]

      const data = await generateTopics(
        currentTopic.prompt, 
        currentTopic.id, 
        fullPath
      )
      
      if (data.children && data.children.length > 0) {
        addTopics(currentTopic.id, data.children)
        addDebugInfo(`Generated new topics for: ${currentTopic.prompt}`)
      } else {
        toast.error("No new topics generated")
      }
    } catch (error) {
      console.error("Error generating topics:", error)
      addDebugInfo(`Error generating topics: ${error}`)
      toast.error("Failed to generate topics. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDebugTopics = useCallback(() => {
    const allTopics = getAllTopics()
    console.log('Current Topics Tree:', allTopics)
    addDebugInfo('Topics tree logged to console')
  }, [getAllTopics, addDebugInfo])

  const handleSwitchToTopic = useCallback((topicId: string) => {
    handleSwipe("switch", topicId)
  }, [handleSwipe])

  const bind = useDrag(({ down, movement: [mx, my], direction: [xDir, yDir], distance, event }) => {
    if (isGenerating) return // Disable swipe during generation
    
    const distanceX = Array.isArray(distance) ? distance[0] : 0
    const distanceY = Array.isArray(distance) ? distance[1] : 0
    // addDebugInfo(
    //   `Drag: ${down ? "down" : "up"}, x: ${mx.toFixed(2)}, y: ${my.toFixed(2)}, dirX: ${xDir < 0 ? "left" : "right"}, dirY: ${yDir < 0 ? "up" : "down"}, distanceX: ${distanceX.toFixed(2)}, distanceY: ${distanceY.toFixed(2)}`,
    // )

    if (down) {
      api.start({ x: mx, y: my, immediate: true })
    } else {
      if (Math.abs(mx) > 100) {
        const dir = mx > 0 ? "right" : "left"
        addDebugInfo(`Swipe triggered: ${dir}`)
        if (isAtBottom && dir === "right") {
          handleGenerateTopics()
        } else {
          handleSwipe(dir)
        }
      } else if (my < -100) {
        addDebugInfo(`Swipe up triggered: Back`)
        goBack()
      } else if (my > 100) {
        handleSwipeDown()
      }
      api.start({ x: 0, y: 0, immediate: false })
    }
  })

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gray-100 p-4 relative">
      <SwipeHelp />
      <div className="w-full max-w-sm aspect-[3/4] relative overflow-hidden touch-none mb-4">
        <animated.div
          {...bind()}
          style={{ x, y, touchAction: "none" }}
          className={cn(
            "w-full h-full bg-white rounded-lg shadow-lg flex items-center justify-center text-center p-6",
            "relative",
            isGenerating && "opacity-50 cursor-wait",
            isAtBottom && "after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-transparent after:to-blue-500/20 after:animate-pulse"
          )}
        >
          <h2 className="text-3xl font-bold">{currentTopic.prompt}</h2>
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          )}
        </animated.div>
      </div>

      <AddTopicDialog 
        onAddTopics={addTopics}
        currentTopic={currentTopic}
        getParentTopics={getParentTopics}
        onSwitchToTopic={handleSwitchToTopic}
      />

      {isDebug && <DebugPanel 
        handleDebugTopics={handleDebugTopics}
        canGoDeeper={canGoDeeper}
        canGoBack={canGoBack}
        isAtTop={isAtTop}
        isAtBottom={isAtBottom}
        debugInfo={debugInfo}
      />}
    </div>
  )
}

