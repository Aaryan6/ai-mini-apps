import { createOpenAI } from "@ai-sdk/openai";
import { smoothStream, streamText } from "ai";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { messages } = await request.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: messages,
    experimental_transform: smoothStream({
      delayInMs: 20, // optional: defaults to 10ms
    }),
  });

  return result.toDataStreamResponse();
}
