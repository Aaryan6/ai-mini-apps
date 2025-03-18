"use client";

import { MessageUI } from "@/components/message";
import { Input } from "@/components/ui/input";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { useChat } from "ai/react";
import { motion } from "framer-motion";
import { useRef } from "react";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const prompt = formData.get("prompt");
    const response = await fetch("/api/image", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();
    console.log({ data });
  };

  return (
    <div className="flex flex-row justify-center pb-20 h-full dark:bg-muted/30 bg-muted">
      <div className="flex flex-col justify-between gap-4 w-full">
        <div
          ref={messagesContainerRef}
          className="flex flex-col gap-6 h-full items-center overflow-y-scroll w-full"
        >
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
            name="prompt"
          />
        </form>
      </div>
    </div>
  );
}
