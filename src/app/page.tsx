"use client";

import { useState } from "react";

import ActionPanel from "./components/ActionPanel";
import Collapsible from "./components/Collapsible";
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

  const handleAnalyzeSuccess = (data: AnalyzeResult) => {
    setResult(data);
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

        <Collapsible title="📂 Upload Report">
          <FileUpload
            onAnalyzeSuccess={handleAnalyzeSuccess}
            onAnalyzeStateChange={(loading) => {
              setIsAnalyzing(loading);
              if (loading) {
                setResult(null);
                setSessionId("");
              }
            }}
          />
        </Collapsible>

        {(result || isAnalyzing) && (
          <Collapsible title="📊 Analysis Result">
            <ResultView result={result} isLoading={isAnalyzing} />
          </Collapsible>
        )}

        {result && sessionId && (
          <Collapsible title="⚙️ Agent Actions">
            <ActionPanel sessionId={sessionId} />
          </Collapsible>
        )}

      </div>

    </main>
  );
}
