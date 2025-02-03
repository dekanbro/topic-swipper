export async function generateArticle(topics: Array<{ prompt: string, id: string }>) {
  const response = await fetch("/api/generate-article", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ topics }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate article")
  }

  return response.json()
} 