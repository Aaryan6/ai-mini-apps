"use client";

import { MessageUI } from "@/components/message";
import { Input } from "@/components/ui/input";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { useChat } from "ai/react";
import { AnimatePresence, motion } from "framer-motion";
import { DragEvent, useEffect, useRef, useState } from "react";
import { UploadIcon } from "@/components/icons";
import TextPreview from "@/components/text-preview";
import { ChatRequestOptions } from "ai";
import { toast } from "sonner";

export default function Home() {
  const { messages, handleSubmit, input, setInput } = useChat({
    api: "/api/multi-modal",
  });
  const [files, setFiles] = useState<FileList | undefined>(undefined);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    const droppedFilesArray = Array.from(droppedFiles);
    if (droppedFilesArray.length > 0) {
      const validFiles = droppedFilesArray.filter(
        (file) =>
          file.type.startsWith("image/") || file.type.startsWith("text/")
      );

      if (validFiles.length === droppedFilesArray.length) {
        const dataTransfer = new DataTransfer();
        validFiles.forEach((file) => dataTransfer.items.add(file));
        setFiles(dataTransfer.files);
      } else {
        toast.error("Only image and text files are allowed!");
      }

      setFiles(droppedFiles);
    }
    setIsDragging(false);
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;

    if (items) {
      const files = Array.from(items)
        .map((item) => item.getAsFile())
        .filter((file): file is File => file !== null);

      if (files.length > 0) {
        const validFiles = files.filter(
          (file) =>
            file.type.startsWith("image/") || file.type.startsWith("text/")
        );

        if (validFiles.length === files.length) {
          const dataTransfer = new DataTransfer();
          validFiles.forEach((file) => dataTransfer.items.add(file));
          setFiles(dataTransfer.files);
        } else {
          toast.error("Only image and text files are allowed");
        }
      }
    }
  };

  useEffect(() => {
    console.log({ files });
  }, [files]);
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex flex-row justify-center pb-20 h-full dark:bg-muted/30 bg-muted"
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className="fixed pointer-events-none dark:bg-zinc-900/90 h-dvh w-dvw z-10 flex flex-row justify-center items-center flex flex-col gap-1 bg-zinc-100/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>Drag and drop files here</div>
            <div className="text-sm dark:text-zinc-400 text-zinc-500">
              {"(images and text)"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          className="flex gap-2 relative items-center mx-auto w-full max-w-[500px]"
          onSubmit={(e) => {
            const options = files ? { experimental_attachments: files } : {};
            handleSubmit(e, options);
            setFiles(undefined);
          }}
        >
          <AnimatePresence>
            {files && files.length > 0 && (
              <div className="flex flex-row gap-2 absolute bottom-12 px-4 w-full md:w-[500px] md:px-0">
                {Array.from(files).map((file) =>
                  file.type.startsWith("image") ? (
                    <div key={file.name}>
                      <motion.img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="rounded-md w-16"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{
                          y: -10,
                          scale: 1.1,
                          opacity: 0,
                          transition: { duration: 0.2 },
                        }}
                      />
                    </div>
                  ) : file.type.startsWith("text") ? (
                    <motion.div
                      key={file.name}
                      className="text-[8px] leading-1 w-28 h-16 overflow-hidden text-zinc-500 border p-2 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{
                        y: -10,
                        scale: 1.1,
                        opacity: 0,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <TextPreview file={file} />
                    </motion.div>
                  ) : null
                )}
              </div>
            )}
          </AnimatePresence>
          <Input
            ref={inputRef}
            className="bg-muted md:max-w-[500px] max-w-[calc(100dvw-32px)] focus:outline-none focus-visible:ring-0"
            placeholder="Send a message..."
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
            }}
            onPaste={handlePaste}
          />
          <input
            type="file"
            multiple
            accept="image/*,.txt"
            ref={fileInputRef}
            onChange={(event) => {
              const files = event.target.files;
              setFiles(files ?? undefined);
            }}
            className="hidden"
          />
          <button
            type="button"
            className="h-full px-4 bg-zinc-200 text-zinc-500 rounded-lg"
            onClick={() => {
              fileInputRef.current?.click();
            }}
          >
            <UploadIcon size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
