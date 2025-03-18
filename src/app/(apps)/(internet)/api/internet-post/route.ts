import { NextResponse } from "next/server";
import { load } from "cheerio";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const TwitterPostSchema = z.object({
  title: z.string(),
  content: z.string(),
  hashtags: z.array(z.string()),
});

export async function POST(req: Request) {
  try {
    const { url, prompt: userPrompt } = await req.json();

    const prompt = await identifyPrompt({ url, userPrompt });

    console.log({ prompt });

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: TwitterPostSchema,
      prompt: prompt!,
      system: systemPrompt,
    });

    console.log({ object });

    return NextResponse.json(object);
  } catch (error) {
    console.error("Error generating Twitter post:", error);
    return NextResponse.json(
      { error: "Failed to generate Twitter post" },
      { status: 500 }
    );
  }
}

const identifyPrompt = async ({
  url,
  userPrompt,
}: {
  url: string | null;
  userPrompt: string | null;
}) => {
  switch (!!url || url !== "") {
    case true:
      // Fetch the news article
      const response = await fetch(url!);
      const html = await response.text();

      // Parse the HTML and extract the main content
      const $ = load(html);

      // Extract article content
      const title = $("h1").first().text().trim();
      const content = $("article").text().trim();
      return `Create a Twitter post that leads with the most significant information from this tech article:

    User Prompt: ${userPrompt}
    Title: ${title}
    Content: ${content.slice(0, 2000)}

    Structure your tweet in this order:
    1. The single most important fact/announcement/finding
    2. One key supporting detail or context
    3. A brief clever observation (if appropriate)
    4. 1-2 relevant hashtags
    5. Keep user prompt in special priority if there is any.
    
    Keep it under 280 characters and make every word count.`;
    case false:
      return userPrompt;
  }
};

const systemPrompt = `You're a great social media manager who prioritizes valuable information while maintaining an engaging style.
    
    Core principles:
    1. Lead with impact: The first sentence MUST contain the most important information
    2. Support with context: Add ONE key detail that helps understand the significance
    3. Add personality: Include a brief clever observation IF it adds value
    4. Stay focused: Every word should serve a purpose

    Avoid:
    - Burying the lead
    - Multiple supporting points
    - Forced humor
    - Unnecessary context
    - Extra hashtags
    
    Think "front-page headline" meets "informed colleague" - get to the point quickly while keeping it engaging.`;
