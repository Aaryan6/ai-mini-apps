import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("pdf") as File;

  console.log({ file });

  const result = await generateObject({
    model: google("gemini-1.5-flash"),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze the following PDF and generate a summary.",
          },
          {
            type: "file",
            data: await file.arrayBuffer(),
            mimeType: "application/pdf",
          },
        ],
      },
    ],
    schema: z.object({
      summary: z.string().describe("A 50 word sumamry of the PDF."),
    }),
  });

  return new Response(result.object.summary);
}
