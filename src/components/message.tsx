"use client";

import { BotIcon, UserIcon } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { Message } from "ai";
import { motion } from "framer-motion";

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
        {message.content && (
          <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
            <Markdown>{message.content as string}</Markdown>
          </div>
        )}
      </div>
    </motion.div>
  );
};
