import { NextResponse } from "next/server"
import { OpenAI } from "openai"
import { z } from "zod"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const generateArticleSchema = z.object({
  topics: z.array(z.object({
    prompt: z.string(),
    id: z.string()
  }))
})

export const runtime = 'edge' // Enable edge runtime

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { topics } = generateArticleSchema.parse(body)

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a knowledgeable writer that creates detailed articles in markdown format.
Write in clear, complete sentences. Each sentence should be grammatically correct and properly punctuated.
Avoid run-on sentences and maintain proper paragraph structure.`,
        },
        {
          role: "user",
          content: generatePrompt(topics),
        },
      ],
    })

    const result = completion.choices[0].message?.content

    if (!result) {
      throw new Error("No result from OpenAI")
    }

    return NextResponse.json({ content: result })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Server error", message: error.message },
      { status: 500 }
    )
  }
}

function generatePrompt(topics: Array<{ prompt: string, id: string }>) {
  const topicPath = topics.map(t => t.prompt).join(" > ")

  return `Create a detailed article about ${topics[topics.length - 1].prompt}.
the topic path is how they got to the topic and should be taken into account. topic path: ${topicPath}

The article should:
- articles should be 300-500 words
- Be written in clean markdown format
- Do not use html tags
- Be well-structured and engaging
- Include a brief introduction and conclusion

Format example:
# Main Heading

Introduction paragraph here.

## Subheading

Content paragraph here.

Another paragraph here.`
} 