import React from "react";
import { ManagerStats } from "@/types";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  Coins,
  TrendingUp,
} from "lucide-react";

interface Props {
  stats: ManagerStats;
}

export const DashboardStats: React.FC<Props> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* 1. Pending Claims */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Pending Review</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.pendingClaims}
          </span>
          <span className="ml-2 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
            Requires Action
          </span>
        </div>
      </div>

      {/* 2. High Risk / Flagged */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">High Risk / Anomalies</span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-600">
            {stats.highRiskClaims}
          </span>
          <span className="ml-2 text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-medium">
            Flagged by Rules
          </span>
        </div>
      </div>

      {/* 3. Potential Fraud Prevented */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Fraud Prevented</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
            ₹{stats.potentialFraudDetectedAmount.toLocaleString()}
          </span>
          <p className="text-[11px] text-slate-500 mt-0.5">Rejected & Critical Suspects</p>
        </div>
      </div>

      {/* 4. Potential GST ITC */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Eligible GST / ITC</span>
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-sky-700">
            ₹{stats.potentialGstItcAmount.toLocaleString()}
          </span>
          <p className="text-[11px] text-slate-500 mt-0.5">Validated 15-digit GSTINs</p>
        </div>
      </div>
    </div>
  );
};
