import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { Readable } from "node:stream";
import { Writable } from "stream";
import { init, stream } from "playht";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

async function streamGptText(prompt: string) {
  const chatGptResponseStream = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4o-mini",
    stream: true,
  });

  const textStream = new Readable({
    read() {},
  });

  (async () => {
    for await (const part of chatGptResponseStream) {
      const content = part.choices[0]?.delta?.content || "";
      if (content) textStream.push(content);
    }
    textStream.push(null);
  })();

  return textStream;
}

export async function POST(req: Request) {
  init({
    apiKey: process.env.NEXT_PUBLIC_PLAYHT_API_KEY!,
    userId: process.env.NEXT_PUBLIC_PLAYHT_USER_ID!,
  });
  try {
    const { prompt } = await req.json();

    // Get the GPT stream
    const textStream = await streamGptText(prompt);

    // Configure PlayHT stream
    const playHTStream = await stream(textStream, {
      voiceId:
        "s3://voice-cloning-zero-shot/801a663f-efd0-4254-98d0-5c175514c3e8/jennifer/manifest.json",
      voiceEngine: "Play3.0-mini",
      outputFormat: "mp3",
    });

    // Create a transform stream for the response
    const chunks: Buffer[] = [];
    const writable = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(Buffer.from(chunk));
        callback();
      },
    });

    return new Promise((resolve, reject) => {
      playHTStream.pipe(writable);

      writable.on("finish", () => {
        const buffer = Buffer.concat(chunks);
        console.log("Buffer:", buffer);
        resolve(
          new Response(buffer, {
            headers: {
              "Content-Type": "audio/mpeg",
            },
          })
        );
      });

      writable.on("error", (err) => {
        reject(
          NextResponse.json(
            { success: false, error: "Failed to process voice input" },
            { status: 500 }
          )
        );
      });
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process voice input" },
      { status: 500 }
    );
  }
}
