"use client";

import { useState } from "react";
import { API_KEY } from "@/lib/config";

type Props = {
  sessionId: string;
};

const API_BASE = "/backend";

const ACTIONS = [
  { key: "issues",  label: "🛠 View Issues" },
  { key: "risk",    label: "⚠️ Assess Risk" },
  { key: "plan",    label: "📋 Maintenance Plan" },
  { key: "failure", label: "🔮 Predict Failure" },
] as const;

type ActionKey = typeof ACTIONS[number]["key"];

export default function ActionPanel({ sessionId }: Props) {

  const [activeAction, setActiveAction] = useState<ActionKey | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const callAction = async (action: ActionKey) => {

    setActiveAction(action);
    setResult(null);
    setLoading(true);

    try {

      const res = await fetch(`${API_BASE}/agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY
        },
        body: JSON.stringify({ action, session_id: sessionId })
      });

      if (res.status === 401) {
        setResult("Unauthorized. Invalid API key.");
        return;
      }

      const data = await res.json();
      setResult(data.answer ?? "No response");

    } catch {
      setResult("Error calling action");
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="space-y-4">

      <div className="grid gap-3 md:grid-cols-2">
        {ACTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => callAction(key)}
            disabled={loading}
            className={`rounded-lg border px-4 py-3 text-left text-sm font-medium shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
              activeAction === key
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-300 bg-white text-slate-800 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeAction && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

          <h3 className="mb-2 font-semibold capitalize text-slate-700">
            {ACTIONS.find((a) => a.key === activeAction)?.label} Result
          </h3>

          {loading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 w-3/4 rounded bg-slate-200" />
              <div className="h-3 w-1/2 rounded bg-slate-200" />
              <div className="h-3 w-2/3 rounded bg-slate-200" />
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-sm text-slate-800">{result}</pre>
          )}

        </div>
      )}

    </div>
  );
}
