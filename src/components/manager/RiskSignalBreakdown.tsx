import React from "react";
import { RiskAssessment } from "@/types";
import { RiskBadge } from "./RiskBadge";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  FileWarning,
  Copy,
  Calendar,
  Layers,
} from "lucide-react";

interface Props {
  riskAssessment: RiskAssessment;
}

export const RiskSignalBreakdown: React.FC<Props> = ({ riskAssessment }) => {
  const { score, level, summary, recommendedAction, signals } = riskAssessment;

  // Signal type to icon helper
  const getSignalIcon = (type: string) => {
    switch (type) {
      case "DUPLICATE_RECEIPT":
        return <Copy className="w-4 h-4 text-rose-400" />;
      case "AMOUNT_ANOMALY":
        return <TrendingUp className="w-4 h-4 text-amber-400" />;
      case "POLICY_VIOLATION":
        return <FileWarning className="w-4 h-4 text-rose-400" />;
      case "DATE_MISMATCH":
        return <Calendar className="w-4 h-4 text-amber-400" />;
      case "CATEGORY_MISMATCH":
        return <Layers className="w-4 h-4 text-purple-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-lg text-white space-y-4">
      {/* Top Header: Score & Tier */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Risk Assessment
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl font-extrabold text-white">{score}</span>
            <span className="text-xs text-slate-400 font-medium">/ 100 Risk Score</span>
          </div>
        </div>
        <RiskBadge level={level} score={score} size="md" />
      </div>

      {/* Progress meter bar */}
      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            level === "CRITICAL"
              ? "bg-rose-600"
              : level === "HIGH"
              ? "bg-red-500"
              : level === "MEDIUM"
              ? "bg-amber-500"
              : "bg-emerald-500"
          }`}
          style={{ width: `${Math.max(5, score)}%` }}
        />
      </div>

      {/* AI Risk Narrative */}
      <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700/60 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Explainable AI Synthesis</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[12px]">{summary}</p>

        <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Recommended Action:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded ${
              recommendedAction === "APPROVE_RECOMMENDED"
                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                : recommendedAction === "REJECT_RECOMMENDED"
                ? "bg-rose-950 text-rose-300 border border-rose-800"
                : "bg-amber-950 text-amber-300 border border-amber-800"
            }`}
          >
            {recommendedAction.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Itemized Risk Signals */}
      <div>
        <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
          Evidence & Triggered Rules ({signals.length})
        </h4>

        {signals.length === 0 ? (
          <div className="text-xs text-slate-400 bg-slate-800/40 p-3 rounded-xl border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            No suspicious signals detected. All checks passed.
          </div>
        ) : (
          <div className="space-y-2">
            {signals.map((sig) => (
              <div
                key={sig.id}
                className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 text-xs flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">{getSignalIcon(sig.type)}</div>
                  <div>
                    <div className="font-bold text-slate-200">
                      {sig.type.replace(/_/g, " ")}
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                      {sig.description}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-xs text-rose-400">
                    +{sig.scoreImpact} pts
                  </span>
                  <div className="text-[10px] text-slate-500 font-semibold">{sig.severity}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
