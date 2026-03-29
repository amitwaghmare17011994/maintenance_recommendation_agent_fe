"use client";

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
};

type ResultViewProps = {
  result: AnalyzeResult | null;
  isLoading: boolean;
};

type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

function getRisk(issues: string[] = []): { level: RiskLevel; percent: number } {
  const count = issues.length;
  if (count >= 8) return { level: "CRITICAL", percent: 95 };
  if (count >= 5) return { level: "HIGH",     percent: 75 };
  if (count >= 3) return { level: "MEDIUM",   percent: 50 };
  return             { level: "LOW",      percent: 25 };
}

const riskBarColor: Record<RiskLevel, string> = {
  LOW:      "bg-green-500",
  MEDIUM:   "bg-yellow-400",
  HIGH:     "bg-orange-500",
  CRITICAL: "bg-red-600",
};

const riskBadgeColor: Record<RiskLevel, string> = {
  LOW:      "bg-green-100 text-green-700",
  MEDIUM:   "bg-yellow-100 text-yellow-700",
  HIGH:     "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

export default function ResultView({ result, isLoading }: ResultViewProps) {

  if (!isLoading && !result) return null;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 w-full rounded-lg bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-36 rounded-lg bg-slate-200" />
          <div className="h-36 rounded-lg bg-slate-200" />
        </div>
        <div className="h-28 rounded-lg bg-slate-200" />
        <div className="h-24 rounded-lg bg-slate-200" />
      </div>
    );
  }

  if (!result) return null;

  const { parsed, recommendation } = result;
  const issues = parsed.issues ?? [];
  const { level: riskLevel, percent: riskPercent } = getRisk(issues);

  return (
    <div className="space-y-4">

      {/* Risk Indicator */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">

        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-slate-700">⚠️ Risk Level</h3>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${riskBadgeColor[riskLevel]}`}>
            {riskLevel}
          </span>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full transition-all duration-700 ease-out ${riskBarColor[riskLevel]}`}
            style={{ width: `${riskPercent}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-slate-500">
          Based on detected issues: {issues.length}
        </p>

      </div>

      <div className="grid gap-4 md:grid-cols-2">

        {/* Machine Overview */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="mb-2 font-semibold text-slate-700">🏭 Machine Overview</h3>
          <p className="text-sm text-slate-700"><strong>ID:</strong> {parsed.machine_id ?? "—"}</p>
          <p className="text-sm text-slate-700"><strong>Type:</strong> {parsed.machine_type ?? "—"}</p>
          <p className="text-sm text-slate-700"><strong>Last Service:</strong> {parsed.last_service ?? "—"}</p>
        </div>

        {/* Condition Metrics */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-700">📊 Condition Metrics</h3>
          <div className="flex flex-wrap gap-2">

            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              parsed.temperature === "High"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}>
              🌡 Temp: {parsed.temperature ?? "—"}
            </span>

            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              parsed.vibration?.includes("Above")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}>
              📳 Vibration: {parsed.vibration ?? "—"}
            </span>

            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              parsed.noise === "High"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}>
              🔊 Noise: {parsed.noise ?? "—"}
            </span>

            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              parsed.coolant === "Low"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}>
              💧 Coolant: {parsed.coolant ?? "—"}
            </span>

            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              parsed.lubrication === "Poor"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}>
              🛢 Lubrication: {parsed.lubrication ?? "—"}
            </span>

          </div>
        </div>

        {/* Warning */}
        {parsed.warning && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <h3 className="mb-1 font-semibold text-red-700">⚠️ Warning</h3>
            <p className="text-sm text-red-800">{parsed.warning}</p>
          </div>
        )}

        {/* Detected Issues — full width */}
        {issues.length > 0 && (
          <div className="rounded-lg border bg-white p-4 shadow-sm md:col-span-2">
            <h3 className="mb-2 font-semibold text-slate-700">🛠 Detected Issues</h3>
            <ul className="grid gap-2 text-sm text-slate-800 md:grid-cols-2">
              {issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 text-red-500">•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>

      {/* Recommendation */}
      <div className="rounded-lg border bg-slate-50 p-4">
        <h3 className="mb-2 font-semibold text-slate-700">📋 Recommendation</h3>
        <p className="whitespace-pre-wrap text-sm text-slate-800">{recommendation}</p>
      </div>

    </div>
  );
}
