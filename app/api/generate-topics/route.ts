import { NextResponse } from "next/server"
import { OpenAI } from "openai"
import { z } from "zod"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const generateTopicsSchema = z.object({
  prompt: z.string().min(1),
  parentId: z.string(),
  parentTopics: z.array(z.object({
    prompt: z.string(),
    id: z.string()
  })).optional()
})

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { prompt, parentId, parentTopics = [] } = generateTopicsSchema.parse(body)

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates topic trees. Respond only with valid JSON, no markdown or additional text.",
        },
        {
          role: "user",
          content: generatePrompt(prompt, parentId, parentTopics),
        },
      ],
      temperature: 0.7,
    })

    const result = completion.choices[0].message?.content

    if (!result) {
      throw new Error("No result from OpenAI")
    }

    try {
      const parsedResult = JSON.parse(result)
      return NextResponse.json(parsedResult)
    } catch (parseError) {
      console.error("JSON Parse Error:", result)
      throw new Error("Failed to parse OpenAI response as JSON")
    }
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Server error", message: error.message },
      { status: 500 }
    )
  }
}

function generatePrompt(topic: string, parentId: string, parentTopics: Array<{ prompt: string, id: string }>) {
  const contextPath = parentTopics
    .map(t => t.prompt)
    .join(" > ")
  
  const contextString = contextPath ? `\nContext path: ${contextPath} > ${topic}` : `\nCurrent topic: ${topic}`

  return `Generate a detailed topic tree considering the following context:${contextString}

Respond with a JSON object only, using this structure:
{
  "children": [
    {
      "prompt": "First subtopic",
      "children": [
        {
          "prompt": "Nested subtopic 1",
          "children": []
        }
      ]
    }
  ]
}

Rules:
- Generate exactly 5 main subtopics
- Each main subtopic must have exactly 5 nested subtopics
- All nested subtopics must have empty children arrays
- Make subtopics progressively more specific and relevant to the parent topic
- Response must be valid JSON
- No markdown, no code blocks, just JSON
- Do not include IDs in the response
- Ensure all prompts are relevant to the context path`
}

