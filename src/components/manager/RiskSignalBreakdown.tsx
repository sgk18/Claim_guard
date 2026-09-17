import React from "react";
import { RiskAssessment } from "@/types";
import { RiskBadge } from "./RiskBadge";
import {
  AlertTriangle,
  CheckCircle2,
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
        return <Copy className="w-4 h-4 text-rose-600" />;
      case "AMOUNT_ANOMALY":
        return <TrendingUp className="w-4 h-4 text-amber-600" />;
      case "POLICY_VIOLATION":
        return <FileWarning className="w-4 h-4 text-rose-600" />;
      case "DATE_MISMATCH":
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case "CATEGORY_MISMATCH":
        return <Layers className="w-4 h-4 text-purple-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm text-slate-900 space-y-4">
      {/* Top Header: Score & Tier */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Automated Risk Evaluation
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl font-black text-slate-900">{score}</span>
            <span className="text-xs text-slate-500 font-medium">/ 100 Risk Score</span>
          </div>
        </div>
        <RiskBadge level={level} score={score} size="md" />
      </div>

      {/* Progress meter bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            level === "CRITICAL"
              ? "bg-rose-600"
              : level === "HIGH"
              ? "bg-rose-500"
              : level === "MEDIUM"
              ? "bg-amber-500"
              : "bg-emerald-500"
          }`}
          style={{ width: `${Math.max(5, score)}%` }}
        />
      </div>

      {/* AI Risk Narrative */}
      <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-200/70 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-brand-orange mb-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-brand-orange" />
          <span>Explainable AI Risk Synthesis</span>
        </div>
        <p className="text-slate-700 leading-relaxed text-[12px]">{summary}</p>

        <div className="mt-3 pt-2.5 border-t border-orange-200/60 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-medium">Recommended Manager Action:</span>
          <span
            className={`font-bold px-2.5 py-0.5 rounded-md ${
              recommendedAction === "APPROVE_RECOMMENDED"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : recommendedAction === "REJECT_RECOMMENDED"
                ? "bg-rose-50 text-rose-800 border border-rose-200"
                : "bg-amber-50 text-amber-800 border border-amber-200"
            }`}
          >
            {recommendedAction.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Itemized Risk Signals */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 mb-2.5 uppercase tracking-wider">
          Evidence & Triggered Rules ({signals.length})
        </h4>

        {signals.length === 0 ? (
          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            No suspicious signals detected. All verification rules passed cleanly.
          </div>
        ) : (
          <div className="space-y-2">
            {signals.map((sig) => (
              <div
                key={sig.id}
                className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 text-xs flex items-start justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">{getSignalIcon(sig.type)}</div>
                  <div>
                    <div className="font-bold text-slate-900">
                      {sig.type.replace(/_/g, " ")}
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                      {sig.description}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-xs text-rose-600">
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
