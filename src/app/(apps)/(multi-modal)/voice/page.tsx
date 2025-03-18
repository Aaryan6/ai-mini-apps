"use client";

import { useEffect, useState, useRef } from "react";

export default function VoicePage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
        alert("Speech recognition is not supported in this browser");
        return;
      }

      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => {
          const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SpeechRecognition();

          recognition.continuous = false;
          recognition.interimResults = false;

          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setTranscript(transcript);
            handleVoiceInput(transcript);
          };

          recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          window.recognition = recognition;
        })
        .catch((err) => {
          console.error("Microphone permission denied:", err);
          alert("Please allow microphone access to use voice features");
        });
    }
  }, []);

  const startListening = () => {
    setIsListening(true);
    window.recognition?.start();
  };

  const stopListening = () => {
    setIsListening(false);
    window.recognition?.stop();
  };

  const handleVoiceInput = async (transcript: string) => {
    try {
      setIsProcessing(true);

      const response = await fetch("/api/voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: transcript }),
      });

      if (!response.ok) {
        throw new Error("Failed to get audio stream");
      }

      // Create a blob from the audio stream
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play the audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
    } catch (error) {
      console.error("Error sending voice input:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Voice Assistant</h1>

      <div className="space-y-4">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`px-4 py-2 rounded ${
            isListening
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white disabled:opacity-50`}
        >
          {isListening ? "Stop Listening" : "Start Listening"}
        </button>

        {transcript && (
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="font-semibold">You said:</h2>
            <p>{transcript}</p>
          </div>
        )}

        {isProcessing && (
          <div className="p-4 bg-yellow-100 rounded">
            Processing your request...
          </div>
        )}

        <audio ref={audioRef} className="hidden" />
      </div>
    </div>
  );
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
    recognition: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}
