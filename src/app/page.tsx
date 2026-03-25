"use client";

import { useState } from "react";

import ChatBox from "./components/ChatBox";
import FileUpload from "./components/FileUpload";
import FloatingChat from "./components/FloatingChat";
import ResultView from "./components/ResultView";

type AnalyzeResult = {
  parsed: string;
  context: string[];
  recommendation: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
};

const API_BASE = "/backend";

export default function HomePage() {

  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleAnalyzeSuccess = (data: AnalyzeResult) => {
    setResult(data);
  };

  const handleSendMessage = async (query: string) => {

    setMessages((prev) => [
      ...prev,
      { role: "user", content: query }
    ]);

    setChatLoading(true);

    try {

      const response = await fetch(
        `${API_BASE}/agent-stream?query=${encodeURIComponent(query)}`,
        { method: "POST" }
      );

      if (!response.body) throw new Error("No stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let streamIndex = -1;

      //@ts-ignore
      // add empty assistant message
      setMessages((prev) => {
        const arr = [
          ...prev,
          { role: "assistant", content: "", streaming: true }
        ];
        streamIndex = arr.length - 1;
        return arr;
      });

      let finalText = "";

      while (true) {

        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value).trim();

        setMessages((prev) => {

          const copy = [...prev];

          if (streamIndex < 0) return prev;

          // STATUS MESSAGE
          if (
            chunk.startsWith("🤖") ||
            chunk.startsWith("📄") ||
            chunk.startsWith("🔍") ||
            chunk.startsWith("⚠️") ||
            chunk.startsWith("🔧") ||
            chunk.startsWith("⚙️") ||
            chunk.startsWith("✔")
          ) {

            copy[streamIndex] = {
              role: "assistant",
              content: chunk,
              streaming: true
            };

          }
          else {

            // FINAL RESULT
            finalText += chunk + "\n";

            copy[streamIndex] = {
              role: "assistant",
              content: finalText,
              streaming: false
            };

          }

          return copy;

        });

        await new Promise((r) => setTimeout(r, 400));
      }

    } catch (err) {

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Streaming error" }
      ]);

    } finally {

      setChatLoading(false);

    }

  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 sm:p-8">

      <div className="mx-auto max-w-4xl space-y-6">

        <section className="space-y-2">
          <h1 className="text-3xl font-bold">
            Maintenance Agent UI
          </h1>
        </section>

        <FileUpload
          onAnalyzeSuccess={handleAnalyzeSuccess}
          onAnalyzeStateChange={(loading) => {
            setIsAnalyzing(loading);
            if (loading) {
              setResult(null);
              setChatOpen(false);
            }
          }}
        />

        <ResultView result={result} isLoading={isAnalyzing} />

      </div>

      <FloatingChat
        visible={Boolean(result) && !chatOpen}
        onOpen={() => setChatOpen(true)}
      />

      {result && (
        <ChatBox
          open={chatOpen}
          messages={messages}
          loading={chatLoading}
          onSendMessage={handleSendMessage}
          onClose={() => setChatOpen(false)}
        />
      )}

    </main>
  );
}