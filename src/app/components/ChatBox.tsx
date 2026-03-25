"use client";

import { FormEvent, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
};

type ChatBoxProps = {
  open: boolean;
  messages: ChatMessage[];
  loading: boolean;
  onSendMessage: (query: string) => Promise<void>;
  onClose: () => void;
};

export default function ChatBox({
  open,
  messages,
  loading,
  onSendMessage,
  onClose
}: ChatBoxProps) {

  const [query, setQuery] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    const q = query;
    setQuery("");

    await onSendMessage(q);
  };
console.log({messages})
  return (

    <aside
      className={`fixed right-0 top-0 z-30 flex h-screen w-full max-w-md transform flex-col bg-white shadow-xl transition-transform duration-200 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >

      <div className="p-4 border-b">
        <b>Maintenance Agent Chat</b>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {messages.map((m, i) => {

          const isStreaming = m.streaming;

          return (
            <div
              key={i}
              className={`rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "ml-auto bg-black text-white"
                  : isStreaming
                  ? "bg-gray-200 italic"
                  : "bg-gray-100"
              }`}
            >

              {m.role === "assistant" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content}
                </ReactMarkdown>
              ) : (
                m.content
              )}

            </div>
          );

        })}

      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border px-2 py-1"
        />

        <button className="bg-black text-white px-3">
          Send
        </button>

      </form>

    </aside>
  );
}