import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { smoothStream, streamText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function POST(request: Request) {
  const { messages } = await request.json();

  const result = streamText({
    model: google("gemini-2.0-flash-exp", {
      useSearchGrounding: true,
    }),
    messages: messages,
    experimental_transform: smoothStream({
      delayInMs: 20, // optional: defaults to 10ms
    }),
  });

  return result.toDataStreamResponse();
}
