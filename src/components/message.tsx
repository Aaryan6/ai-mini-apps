"use client";

import { BotIcon, UserIcon } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { Message } from "ai";
import { motion } from "framer-motion";

const getTextFromDataUrl = (dataUrl: string) => {
  const base64 = dataUrl.split(",")[1];
  return window.atob(base64);
};

export const MessageUI = ({ message }: { message: Message }) => {
  return (
    <motion.div
      className={`flex whitespace-pre-wrap flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="size-[24px] flex flex-col justify-center items-center flex-shrink-0 text-zinc-400">
        {message.role === "assistant" ? <BotIcon /> : <UserIcon />}
      </div>

      <div className="flex flex-col gap-6 w-full">
        {message.experimental_attachments?.map((attachment) =>
          attachment.contentType?.startsWith("image") ? (
            <img
              className="rounded-md w-40 mb-3"
              key={attachment.name}
              src={attachment.url}
              alt={attachment.name}
            />
          ) : attachment.contentType?.startsWith("text") ? (
            <div className="text-xs w-40 h-24 overflow-hidden text-zinc-400 border p-2 rounded-md dark:bg-zinc-800 dark:border-zinc-700 mb-3">
              {getTextFromDataUrl(attachment.url)}
            </div>
          ) : null
        )}

        {message.content && (
          <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
            <Markdown>{message.content as string}</Markdown>
          </div>
        )}

        {message.parts?.map((part, i) => {
          if (part.type === "tool-invocation") {
            const toolInvocation = part.toolInvocation;
            const toolCallId = toolInvocation.toolCallId;
            const dynamicInfoStyles =
              "font-mono bg-gray-100 dark:bg-zinc-800 p-1 text-sm rounded";

            if (
              toolsRequiringConfirmation.includes(toolInvocation.toolName) &&
              toolInvocation.state === "call" &&
              onToolResult
            ) {
              return (
                <div
                  key={toolCallId}
                  className="text-zinc-500 dark:text-zinc-400"
                >
                  Run{" "}
                  <span className={dynamicInfoStyles}>
                    {toolInvocation.toolName}
                  </span>{" "}
                  with args:{" "}
                  <span className={dynamicInfoStyles}>
                    {JSON.stringify(toolInvocation.args)}
                  </span>
                  <div className="flex gap-2 pt-2">
                    <button
                      className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                      onClick={() => onToolResult(toolCallId, "YES")}
                    >
                      Yes
                    </button>
                    <button
                      className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
                      onClick={() => onToolResult(toolCallId, "NO")}
                    >
                      No
                    </button>
                  </div>
                </div>
              );
            }
          }
          return null;
        })}
      </div>
    </motion.div>
  );
};
