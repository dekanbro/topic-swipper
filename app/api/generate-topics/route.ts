import { NextResponse } from "next/server"
import { OpenAI } from "openai"
import { z } from "zod"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const generateTopicsSchema = z.object({
  prompt: z.string(),
  currentId: z.string(),
  parentTopics: z.array(z.object({
    prompt: z.string(),
    id: z.string()
  }))
})

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { prompt, parentTopics } = generateTopicsSchema.parse(body)

    const topicPath = parentTopics.map(t => t.prompt).join(" > ")

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates related subtopics. Return only valid JSON objects."
        },
        {
          role: "user",
          content: `Generate 2-3 subtopics for "${prompt}".
The topic path is how the user got to this topic so it is important to generate subtopics that are related to the path: ${topicPath}

Each subtopic should:
- Be related to the main topic
- Not repeat existing topics in the path
- Be specific and interesting
- Be 1-4 words long

Respond with a JSON object only, using this structure:
{
  "children": [
    {
      "prompt": "First subtopic",
      "children": []
    },
    {
      "prompt": "Second subtopic",
      "children": []
    }
  ]
}

Important: Return ONLY the JSON object, no additional text or explanation.`
        }
      ]
    })

    const result = completion.choices[0].message?.content
    if (!result) {
      throw new Error("No result from OpenAI")
    }

    try {
      const parsed = JSON.parse(result)
      console.log('Parsed API response:', parsed) // Debug log
      
      if (!parsed.children || !Array.isArray(parsed.children)) {
        console.error('Invalid response structure:', parsed) // Debug log
        throw new Error("Response does not contain children array")
      }

      // Ensure each topic has the correct structure
      const validatedChildren = parsed.children.map((child: any) => ({
        prompt: child.prompt,
        children: []
      }))

      console.log('Validated children:', validatedChildren) // Debug log
      return NextResponse.json({ children: validatedChildren })
    } catch (parseError) {
      console.error("Parse error:", parseError, "Response:", result)
      throw new Error("Failed to parse OpenAI response")
    }
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Failed to generate topics", message: error.message },
      { status: 500 }
    )
  }
}

