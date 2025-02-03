"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Markdown from "react-markdown"
import { Loader2 } from "lucide-react"
import { generateArticle } from "@/services/articleService"

export default function ArticlePage() {
  const searchParams = useSearchParams()
  const topicsParam = searchParams.get('topics')
  const [content, setContent] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="mx-auto max-w-3xl">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <article className="prose dark:prose-invert max-w-none">
          <Markdown>{content}</Markdown>
        </article>
      )}
    </div>
  )
} 