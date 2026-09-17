import React from "react";
import { RiskLevel } from "@/types";
import { ShieldCheck, AlertTriangle, AlertOctagon } from "lucide-react";

interface Props {
  level: RiskLevel;
  score?: number;
  size?: "sm" | "md";
}

export const RiskBadge: React.FC<Props> = ({ level, score, size = "md" }) => {
  const isSm = size === "sm";

  switch (level) {
    case "CRITICAL":
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-rose-950 text-rose-300 border border-rose-600 shadow-sm shadow-rose-950/40 animate-pulse ${
            isSm ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"
          }`}
        >
          <AlertOctagon className={isSm ? "w-3 h-3 text-rose-400" : "w-3.5 h-3.5 text-rose-400"} />
          {score !== undefined ? `${score}/100 ` : ""}CRITICAL
        </span>
      );
    case "HIGH":
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border border-red-300 dark:border-red-800 ${
            isSm ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"
          }`}
        >
          <AlertTriangle className={isSm ? "w-3 h-3 text-red-600" : "w-3.5 h-3.5 text-red-600"} />
          {score !== undefined ? `${score}/100 ` : ""}HIGH RISK
        </span>
      );
    case "MEDIUM":
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 ${
            isSm ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"
          }`}
        >
          <AlertTriangle className={isSm ? "w-3 h-3 text-amber-600" : "w-3.5 h-3.5 text-amber-600"} />
          {score !== undefined ? `${score}/100 ` : ""}MED RISK
        </span>
      );
    case "LOW":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 ${
            isSm ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"
          }`}
        >
          <ShieldCheck className={isSm ? "w-3 h-3 text-emerald-600" : "w-3.5 h-3.5 text-emerald-600"} />
          {score !== undefined ? `${score}/100 ` : ""}LOW RISK
        </span>
      );
  }
};
