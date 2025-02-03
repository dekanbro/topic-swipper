"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Markdown from "react-markdown"
import { Loader2, Send } from "lucide-react"
import { generateArticle } from "@/services/articleService"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function ArticleContent() {
  const searchParams = useSearchParams()
  const topicsParam = searchParams.get('topics')
  const [content, setContent] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadArticle() {
      if (!topicsParam) {
        setError("No topics provided")
        setIsLoading(false)
        return
      }

      try {
        const topics = JSON.parse(decodeURIComponent(topicsParam))
        const { content } = await generateArticle(topics)
        setContent(content)
      } catch (err) {
        setError("Failed to generate article")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadArticle()
  }, [topicsParam])

  const handleSubmitProposal = async () => {
    setIsSubmitting(true)
    try {
      // TODO: Implement your proposal submission logic here
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated delay
      toast.success("Proposal submitted successfully!")
    } catch (err) {
      console.error("Failed to submit proposal:", err)
      toast.error("Failed to submit proposal")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <div className="space-y-8">
          <article className="prose dark:prose-invert max-w-none">
            <Markdown>{content}</Markdown>
          </article>
          
          <div className="flex justify-end pb-8">
            <Button 
              onClick={handleSubmitProposal}
              disabled={isSubmitting}
              size="lg"
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Proposal
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 