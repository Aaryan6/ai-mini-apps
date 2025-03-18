import { NextResponse } from "next/server";
import { load } from "cheerio";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const QuizSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      correctAnswer: z.number(),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    // Fetch the news article
    const response = await fetch(url);
    const html = await response.text();

    // Parse the HTML and extract the main content
    const $ = load(html);

    // Specific selectors for The Verge
    const articles: string[] = [];

    // Get article headlines and summaries
    $(".relative.group").each((_, element) => {
      const title = $(element).find("h2").text().trim();
      const summary = $(element).find("p").text().trim();
      if (title && summary) {
        articles.push(`Title: ${title}\nSummary: ${summary}`);
      }
    });

    // If no articles found, try alternative selectors
    if (articles.length === 0) {
      $(".duet--article--standard").each((_, element) => {
        const title = $(element).find("h2").text().trim();
        const content = $(element)
          .find(".duet--article--standard-article")
          .text()
          .trim();
        if (title && content) {
          articles.push(`Title: ${title}\nContent: ${content}`);
        }
      });
    }

    const articleText = articles.join("\n\n");

    console.log({ articles });
    console.log("Found articles:", articles.length);

    if (!articleText) {
      throw new Error("No articles found");
    }

    // Generate a quiz using the AI SDK
    const prompt = `You are a quiz generator. Based on the following AI and technology news articles, generate a quiz with 5 multiple-choice questions.
    Each question should:
    1. Be based on current tech news events
    2. Have 4 options
    3. Have exactly one correct answer
    4. Be engaging and challenging

    News Articles:
    ${articleText.slice(0, 3000)}

    Important: Ensure each question has exactly 4 options and the correctAnswer is the index (0-3) of the correct option.`;

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: QuizSchema,
      prompt,
      system: `You are a quiz generator. Based on the following AI and technology news articles, generate a quiz with 5 multiple-choice questions.
    Each question should:
    1. Be based on current tech news events
    2. Have 4 options
    3. Have exactly one correct answer
    4. Be engaging and challenging
    
    Rules:
    
    - News is must about AI,
    - Generated quiz like that, so that user can gain knowledge about AI,
    - each question should be different from each other,
    - Don't mention the news and articles in the quiz
    - Question should be relevent to AI and from not more than past 3 days,
    `,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
