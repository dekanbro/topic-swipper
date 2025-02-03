import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-14 items-center">
          <Link 
            href="/"
            className="flex items-center text-sm font-medium hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Topics
          </Link>
        </div>
      </header>
      <main className="container py-6">
        {children}
      </main>
    </div>
  )
} 