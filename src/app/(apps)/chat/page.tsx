"use client";

import { MessageUI } from "@/components/message";
import { Input } from "@/components/ui/input";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { useChat } from "ai/react";
import { motion } from "framer-motion";
import { useRef } from "react";

export default function Home() {
  const { messages, handleSubmit, input, setInput } = useChat({
    api: "/api/chat",
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div className="flex flex-row justify-center pb-20 h-full dark:bg-muted/30 bg-muted">
      <div className="flex flex-col justify-between gap-4 w-full">
        <div
          ref={messagesContainerRef}
          className="flex flex-col gap-6 h-full items-center overflow-y-scroll w-full"
        >
          {messages.length === 0 && (
            <motion.div className="h-[350px] px-4 w-full md:w-[500px] md:px-0 pt-20">
              <div className="border rounded-lg p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
                <p className="text-center">
                  This is a simple chatbot that uses the Vercel AI SDK to
                  generate responses.
                </p>
              </div>
            </motion.div>
          )}

          {messages.map((message) => (
            <MessageUI key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form
          className="flex flex-col gap-2 relative items-center"
          onSubmit={handleSubmit}
        >
          <Input
            ref={inputRef}
            className="bg-muted md:max-w-[500px] max-w-[calc(100dvw-32px)] focus:outline-none focus-visible:ring-0"
            placeholder="Send a message..."
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
            }}
          />
        </form>
      </div>
    </div>
  );
}
