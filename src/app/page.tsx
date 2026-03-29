"use client";

import { useState } from "react";

import ActionPanel from "./components/ActionPanel";
import FileUpload from "./components/FileUpload";
import ResultView from "./components/ResultView";

type ParsedReport = {
  machine_id?: string;
  machine_type?: string;
  last_service?: string;
  temperature?: string;
  vibration?: string;
  noise?: string;
  coolant?: string;
  lubrication?: string;
  issues?: string[];
  warning?: string;
};

type AnalyzeResult = {
  parsed: ParsedReport;
  context: string[];
  recommendation: string;
  session_id?: string;
};

export default function HomePage() {

  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [actionResult, setActionResult] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleAnalyzeSuccess = (data: AnalyzeResult) => {
    setResult(data);
    setActionResult(null);
    if (data.session_id) {
      setSessionId(data.session_id);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 sm:p-8">

      <div className="mx-auto max-w-4xl space-y-6">

        <section className="space-y-1">
          <h1 className="text-3xl font-bold">Maintenance Agent UI</h1>
        </section>

        <FileUpload
          onAnalyzeSuccess={handleAnalyzeSuccess}
          onAnalyzeStateChange={(loading) => {
            setIsAnalyzing(loading);
            if (loading) {
              setResult(null);
              setSessionId("");
              setActionResult(null);
            }
          }}
        />

        <ResultView result={result} isLoading={isAnalyzing} />

        {result && sessionId && (
          <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-semibold text-slate-900">Agent Actions</h2>

            <ActionPanel
              sessionId={sessionId}
              onResult={setActionResult}
              setLoading={setActionLoading}
            />

            {actionLoading && (
              <div className="animate-pulse rounded-lg bg-slate-100 px-4 py-6 text-center text-sm text-slate-500">
                Running action…
              </div>
            )}

            {!actionLoading && actionResult && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-700">Result</h3>
                <p className="whitespace-pre-wrap text-sm text-slate-800">{actionResult}</p>
              </div>
            )}

          </section>
        )}

      </div>

    </main>
  );
}
