import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt bhej na bhai!" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(
      process.env.GOOGLE_GENERATIVE_AI_API_KEY!
    );
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp", // Experimental model (image support confirm nahi)
    });

    const result = await model.generateContent(prompt);
    const response = result.response.candidates![0].content.parts;

    // Text response ke liye
    const text = response.map((part) => part.text).join(" ");
    if (!text) {
      return NextResponse.json(
        { error: "Kuch generate nahi hua yr!" },
        { status: 500 }
      );
    }

    return NextResponse.json({ text }); // Text return kar rahe hain abhi
  } catch (error) {
    console.error("Error aa gaya bhai:", error);
    return NextResponse.json(
      { error: "Kuch gadbad ho gaya!" },
      { status: 500 }
    );
  }
}
