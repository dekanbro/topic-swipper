export async function generateTopics(
  prompt: string,
  currentId: string,
  parentTopics: Array<{ prompt: string, id: string }>
) {
  const response = await fetch("/api/generate-topics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      currentId,
      parentTopics,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate topics")
  }

  return response.json()
} 