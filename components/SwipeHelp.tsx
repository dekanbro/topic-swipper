"use client"

import { Button } from "@/components/ui/button"
import { Info, ArrowLeft, ArrowRight, ArrowLeftRight, ArrowDown, X } from "lucide-react"
import { useState } from "react"
import { animated, useTransition } from "react-spring"

export function SwipeHelp() {
  const [isOpen, setIsOpen] = useState(false)

  const transition = useTransition(isOpen, {
    from: { opacity: 0, transform: 'scale(0.95)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    leave: { opacity: 0, transform: 'scale(0.95)' },
  })

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-50"
        onClick={() => setIsOpen(true)}
      >
        <Info className="h-5 w-5" />
      </Button>

      {transition((style, show) =>
        show && (
          <animated.div 
            style={style}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card w-full max-w-lg rounded-lg shadow-lg p-6 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>

              <h2 className="text-xl font-bold mb-6">How to Navigate</h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <ArrowLeftRight className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">Swipe Left</p>
                    <p className="text-sm text-muted-foreground">Move to next sibling topic</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">Swipe Right</p>
                    <p className="text-sm text-muted-foreground">Go deeper into selected topic</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <ArrowLeft className="h-6 w-6 rotate-90" />
                  </div>
                  <div>
                    <p className="font-medium">Swipe Up</p>
                    <p className="text-sm text-muted-foreground">Go back to previous topic</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <ArrowDown className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">Swipe Down</p>
                    <p className="text-sm text-muted-foreground">Generate an article about current path</p>
                  </div>
                </div>
              </div>
            </div>
          </animated.div>
        )
      )}
    </>
  )
} 