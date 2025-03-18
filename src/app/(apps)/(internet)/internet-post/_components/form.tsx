"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  UploadIcon as FileUpload,
  Link,
  PenLine,
  RotateCcw,
} from "lucide-react";
import { generatePost } from "../actions";

interface PostContent {
  title: string;
  content: string;
  imageUrl?: string;
}

export default function PostGeneratorForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<PostContent | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      setIsGenerating(true);

      const formData = new FormData(event.currentTarget);
      const prompt = formData.get("prompt") as string;
      const referenceUrl = formData.get("reference_url") as string;

      console.log({ prompt, referenceUrl });

      const response = await fetch(`/api/internet-post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          url: referenceUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate post");
      }

      const data = await response.json();
      console.log({ data });

      setResult(data);
      setIsGenerating(false);
      setIsFlipped(true);
    } catch (error) {
      console.error("Failed to generate post:", error);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleReset() {
    setResult(null);
    setIsFlipped(false);
  }

  return (
    <div className="min-h-screen p-4 bg-zinc-950 text-zinc-50 flex items-center justify-center">
      <div
        className={`flip-card w-full max-w-2xl ${isFlipped ? "flipped" : ""}`}
      >
        <div className="flip-card-inner">
          <div className="flip-card-face flip-card-front">
            <Card className="bg-zinc-900 border-zinc-800 text-white h-fit">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">
                  Create Social Post
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="prompt">
                      What would you like to post about?
                    </Label>
                    <Textarea
                      id="prompt"
                      name="prompt"
                      placeholder="Enter your topic or idea..."
                      className="h-24 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>External Resources</Label>
                    <div className="flex items-center gap-2 p-3 border rounded-lg border-zinc-800 bg-zinc-800/50">
                      <Link className="w-4 h-4 text-zinc-400" />
                      <input
                        name="reference_url"
                        type="url"
                        placeholder="Add reference URL..."
                        className="flex-grow bg-transparent text-white placeholder:text-zinc-400 focus:outline-none"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <FileUpload className="w-4 h-4 text-zinc-400" />
                      </label>
                      <input
                        id="file-upload"
                        name="files"
                        type="file"
                        accept=".pdf,.doc,.docx,image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => setFiles(e.target.files)}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>Generating...</>
                    ) : (
                      <>
                        <PenLine className="w-4 h-4 mr-2" />
                        Generate Post
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          <div className="flip-card-face flip-card-back">
            <Card className="bg-zinc-900 border-zinc-800 text-white h-fit">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">
                  Generated Post
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {result && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-medium">{result.title}</h3>
                    <p className="text-zinc-400">{result.content}</p>
                    {result.imageUrl && (
                      <img
                        src={result.imageUrl}
                        alt="Generated content"
                        className="w-full rounded-lg"
                      />
                    )}
                  </div>
                )}
                <Button
                  onClick={handleReset}
                  className="w-full bg-indigo-600 hover:bg-indigo-500"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Create Another Post
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
