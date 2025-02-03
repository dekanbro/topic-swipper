"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus, Loader2 } from "lucide-react"
import { useState } from "react"
import { generateTopics } from "@/services/topicService"
import { toast } from "sonner"

interface AddTopicDialogProps {
  onAddTopics: (parentId: string, topics: any[]) => void
  currentTopic: {
    id: string
    prompt: string
  }
  getParentTopics: (id: string) => Array<{ prompt: string, id: string }>
  onSwitchToTopic: (topicId: string) => void
}

export function AddTopicDialog({ 
  onAddTopics, 
  currentTopic, 
  getParentTopics,
  onSwitchToTopic 
}: AddTopicDialogProps) {
  const [open, setOpen] = useState(false)
  const [newTopic, setNewTopic] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTopic.trim()) return

    setIsLoading(true)
    try {
      const parentTopics = getParentTopics(currentTopic.id)
      // Get the parent ID (last topic in parentTopics, or root if at top level)
      const parentId = parentTopics.length > 0 
        ? parentTopics[parentTopics.length - 1].id 
        : "root"
      
      const data = await generateTopics(newTopic, parentId, parentTopics)
      onAddTopics(parentId, [data])
      // Switch to the newly created topic
      onSwitchToTopic(data.id)
      setOpen(false)
      setNewTopic("")
      toast.success("New topic created!")
    } catch (error) {
      console.error("Error adding topic:", error)
      toast.error("Failed to create topic")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="absolute bottom-4 right-4 rounded-full h-12 w-12 shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Topic</DialogTitle>
          <DialogDescription>
            Create a new topic at the current level
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Enter your topic..."
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isLoading || !newTopic.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Topic'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 