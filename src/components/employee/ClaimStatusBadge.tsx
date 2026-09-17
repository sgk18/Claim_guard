import React from "react";
import { ClaimStatus } from "@/types";
import { CheckCircle2, Clock, AlertCircle, XCircle, RefreshCw } from "lucide-react";

interface Props {
  status: ClaimStatus;
  size?: "sm" | "md";
}

export const ClaimStatusBadge: React.FC<Props> = ({ status, size = "md" }) => {
  const isSm = size === "sm";

  switch (status) {
    case "APPROVED":
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 ${
            isSm ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"
          }`}
        >
          <CheckCircle2 className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
          Approved
        </span>
      );
    case "REJECTED":
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-700 ${
            isSm ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"
          }`}
        >
          <XCircle className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
          Rejected
        </span>
      );
    case "REVIEW_REQUIRED":
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 ${
            isSm ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"
          }`}
        >
          <AlertCircle className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
          Under Review
        </span>
      );
    case "PROCESSING":
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-700 ${
            isSm ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"
          }`}
        >
          <RefreshCw className={`animate-spin ${isSm ? "w-3 h-3" : "w-3.5 h-3.5"}`} />
          Processing
        </span>
      );
    case "PENDING":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-600 ${
            isSm ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"
          }`}
        >
          <Clock className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
          Pending
        </span>
      );
  }
};
