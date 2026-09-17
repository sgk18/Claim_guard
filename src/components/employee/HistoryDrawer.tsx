import React, { useState } from "react";
import { Claim } from "@/types";
import { ClaimStatusBadge } from "./ClaimStatusBadge";
import { X, Calendar, FileText, ArrowLeft } from "lucide-react";

interface Props {
  claims: Claim[];
  isOpen: boolean;
  onClose: () => void;
  onSelectClaim?: (claim: Claim) => void;
}

export const HistoryDrawer: React.FC<Props> = ({ claims, isOpen, onClose, onSelectClaim }) => {
  const [filter, setFilter] = useState<string>("ALL");

  if (!isOpen) return null;

  const filtered = claims.filter((c) => {
    if (filter === "ALL") return true;
    if (filter === "PENDING") return c.status === "PENDING" || c.status === "REVIEW_REQUIRED";
    return c.status === filter;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b-2 border-slate-800">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-base text-white">My Submitted Claims</h3>
          </div>
          <span className="text-xs bg-slate-800 text-brand-peach border border-slate-700 px-2 py-0.5 rounded-full font-medium">
            {claims.length} total
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 p-3 border-b border-slate-200 bg-slate-50 text-xs overflow-x-auto">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full font-semibold transition-colors whitespace-nowrap ${
                filter === f
                  ? "bg-brand-orange text-white shadow-tactile"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {f === "ALL" ? "All" : f === "PENDING" ? "In Review" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Claims List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              No claims found under this filter.
            </div>
          ) : (
            filtered.map((claim) => (
              <div
                key={claim.id}
                onClick={() => onSelectClaim && onSelectClaim(claim)}
                className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500/60 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-xs text-slate-700">{claim.id}</span>
                  <ClaimStatusBadge status={claim.status} size="sm" />
                </div>

                <div className="flex justify-between items-baseline">
                  <h4 className="font-semibold text-slate-900 text-sm truncate max-w-[200px]">
                    {claim.vendorName}
                  </h4>
                  <span className="font-bold text-sm text-emerald-700">
                    ₹{claim.amount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{claim.claimDate}</span>
                  </div>
                  <span className="capitalize bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-600">
                    {claim.category}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
