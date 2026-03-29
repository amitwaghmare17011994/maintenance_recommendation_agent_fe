"use client";

import { API_KEY } from "@/lib/config";

type Props = {
  sessionId: string;
  onResult: (data: string) => void;
  setLoading: (loading: boolean) => void;
};

const API_BASE = "/backend";

const ACTIONS = [
  { key: "issues",  label: "🛠 View Issues" },
  { key: "risk",    label: "⚠️ Assess Risk" },
  { key: "plan",    label: "📋 Maintenance Plan" },
  { key: "failure", label: "🔮 Predict Failure" },
] as const;

export default function ActionPanel({ sessionId, onResult, setLoading }: Props) {

  const callAction = async (action: string) => {

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
        onResult("Unauthorized. Invalid API key.");
        return;
      }

      const data = await res.json();
      onResult(data.answer ?? "No response");

    } catch {
      onResult("Error calling action");
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {ACTIONS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => callAction(key)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-left text-sm font-medium text-slate-800 shadow-sm transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
