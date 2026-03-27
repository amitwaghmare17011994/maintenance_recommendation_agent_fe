"use client";

import { useState } from "react";

import ChatBox from "./components/ChatBox";
import FileUpload from "./components/FileUpload";
import FloatingChat from "./components/FloatingChat";
import ResultView from "./components/ResultView";
import { API_KEY } from "@/lib/config";

type AnalyzeResult = {
  parsed: string;
  context: string[];
  recommendation: string;
  session_id?: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const API_BASE = "/backend";

export default function HomePage() {

  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState("");

  const handleAnalyzeSuccess = (data: AnalyzeResult) => {
    setResult(data);
    if (data.session_id) {
      setSessionId(data.session_id);
    }
  };

  const handleSendMessage = async (query: string) => {

    if (!sessionId) {
      alert("Please upload a report first");
      return;
    }

    setMessages((prev) => [
      ...prev,
      { role: "user", content: query }
    ]);

    setChatLoading(true);

    try {

      const response = await fetch(`${API_BASE}/agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY
        },
        body: JSON.stringify({ query, session_id: sessionId })
      });

      if (response.status === 401) {
        alert("Unauthorized. Invalid API key.");
        return;
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer ?? "No response" }
      ]);

    } catch (err) {

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error contacting agent" }
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
              setSessionId("");
              setMessages([]);
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