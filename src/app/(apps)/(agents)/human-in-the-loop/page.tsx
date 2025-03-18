"use client";

import { MessageUI } from "./message";
import { Input } from "@/components/ui/input";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { Message, useChat } from "ai/react";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import {
  getToolsRequiringConfirmation,
  APPROVAL,
} from "../api/human-in-the-loop/utils";
import { tools } from "../api/human-in-the-loop/tools";
import { generateId } from "ai";

export default function HumanInTheLoop() {
  const {
    messages,
    handleSubmit,
    input,
    setInput,
    addToolResult,
    setMessages,
  } = useChat({
    api: "/api/human-in-the-loop",
    maxSteps: 5,
    initialMessages: [],
  });

  useEffect(() => {
    setMessages([
      {
        id: generateId(),
        role: "assistant",
        content: "Hey Boss! I'm ready to help you with your tasks!",
      },
    ]);
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const toolsRequiringConfirmation = getToolsRequiringConfirmation(tools);

  const pendingToolCallConfirmation = messages.some((m: Message) =>
    m.parts?.some(
      (part) =>
        part.type === "tool-invocation" &&
        part.toolInvocation.state === "call" &&
        toolsRequiringConfirmation.includes(part.toolInvocation.toolName)
    )
  );

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
                <h1 className="text-2xl font-bold text-center">HITL</h1>
                <p className="text-center">
                  AI assistant that requires human approval for important
                  actions.
                </p>
              </div>
            </motion.div>
          )}

          {messages.map((message) => (
            <MessageUI
              key={message.id}
              message={message}
              onToolResult={(toolCallId, result) =>
                addToolResult({
                  toolCallId,
                  result: result as "YES" | "NO",
                })
              }
              toolsRequiringConfirmation={toolsRequiringConfirmation}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form
          className="flex flex-col gap-2 relative items-center"
          onSubmit={handleSubmit}
        >
          <Input
            ref={inputRef}
            disabled={pendingToolCallConfirmation}
            className="bg-muted md:max-w-[500px] max-w-[calc(100dvw-32px)] focus:outline-none focus-visible:ring-0"
            placeholder={
              pendingToolCallConfirmation
                ? "Please respond to the tool confirmation..."
                : "Send a message..."
            }
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
