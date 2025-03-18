import { openai } from "@ai-sdk/openai";
import { createDataStreamResponse, Message, streamText } from "ai";
import { processToolCalls } from "./utils";
import { tools } from "./tools";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  return createDataStreamResponse({
    execute: async (dataStream) => {
      const processedMessages = await processToolCalls(
        {
          messages,
          dataStream,
          tools,
        },
        {
          getWeatherInformation: async ({ city }) => {
            const conditions = ["sunny", "cloudy", "rainy", "snowy"];
            return `The weather in ${city} is ${
              conditions[Math.floor(Math.random() * conditions.length)]
            }.`;
          },
          scheduleMeeting: async ({ title, date, duration, participants }) => {
            const dummyResponse = {
              eventId: `evt_${Math.random().toString(36).substring(7)}`,
              calendarLink: "https://calendar.example.com/event",
            };

            return `Meeting scheduled successfully!\n\nTitle: ${title}\nDate: ${new Date(
              date
            ).toLocaleString()}\nDuration: ${duration} minutes\nParticipants: ${participants.join(
              ", "
            )}\nCalendar Link: ${dummyResponse.calendarLink}`;
          },
        }
      );

      const result = streamText({
        model: openai("gpt-4o-mini"),
        messages: processedMessages,
        system: `You are a helpful and professional personal assistant. Always address the user as 'Boss'. Be proactive, friendly, and efficient. When scheduling meetings, help suggest appropriate durations and coordinate with participants. Keep responses concise but friendly. If you're not sure about something, ask for clarification.`,
        tools,
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}
