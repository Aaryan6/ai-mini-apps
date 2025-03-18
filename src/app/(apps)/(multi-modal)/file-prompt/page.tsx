"use client";

import { UploadIcon } from "@/components/icons";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { AnimatePresence, motion } from "framer-motion";
import { DragEvent, useRef, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [description, setDescription] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | undefined>();
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
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
    if (droppedFiles.length > 0) {
      const pdfFile = droppedFiles[0];
      if (pdfFile.type === "application/pdf") {
        setFile(pdfFile);
      } else {
        toast.error("Only PDF files are allowed!");
      }
    }
    setIsDragging(false);
  };

  const handleSubmit = async () => {
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("pdf", file);

      const response = await fetch("/api/file-prompt", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setDescription(data.message);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Failed to analyze PDF");
    } finally {
      setLoading(false);
    }
  };

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
            <div>Drag and drop PDF here</div>
            <div className="text-sm dark:text-zinc-400 text-zinc-500">
              {"(PDF files only)"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col justify-between gap-4 w-full">
        <div
          ref={messagesContainerRef}
          className="flex flex-col gap-6 h-full items-center overflow-y-scroll w-full"
        >
          {!description && !file && (
            <motion.div className="h-[350px] px-4 w-full md:w-[500px] md:px-0 pt-20">
              <div className="border rounded-lg p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
                <p className="text-center">
                  Upload a PDF file to analyze its contents.
                </p>
              </div>
            </motion.div>
          )}

          {file && (
            <motion.div className="h-[350px] px-4 w-full md:w-[500px] md:px-0 pt-20">
              <div className="border rounded-lg p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
                <p className="text-center">
                  <span className="font-bold">Selected file:</span> {file.name}
                </p>
              </div>
            </motion.div>
          )}

          {description && (
            <div className="px-4 w-full md:w-[500px] md:px-0">
              <pre className="whitespace-pre-wrap border rounded-lg p-4 text-sm dark:border-zinc-700">
                {description}
              </pre>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 relative items-center justify-center mx-auto w-full max-w-[500px]">
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            onChange={(event) => {
              const files = event.target.files;
              if (files) setFile(files[0]);
            }}
            className="hidden"
          />
          <button
            type="button"
            className="h-full px-4 py-2 bg-zinc-200 text-zinc-500 rounded-lg"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon size={16} />
          </button>
          <button
            className="h-full px-4 bg-zinc-200 text-zinc-500 rounded-lg disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!file || loading}
          >
            {loading ? "Analyzing..." : "Analyze PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
