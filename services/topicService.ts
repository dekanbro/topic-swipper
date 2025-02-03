export async function generateTopics(
  prompt: string, 
  parentId: string, 
  parentTopics: Array<{ prompt: string; id: string }> = []
) {
  const response = await fetch("/api/generate-topics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, parentId, parentTopics }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate topics")
  }

  return response.json()
} 