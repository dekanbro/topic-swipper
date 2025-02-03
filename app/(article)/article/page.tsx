import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { ArticleContent } from "./article-content"

export default function ArticlePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <ArticleContent />
    </Suspense>
  )
} 