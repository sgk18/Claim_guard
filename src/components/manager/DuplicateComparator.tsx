import React from "react";
import { Claim } from "@/types";
import { AlertOctagon, ArrowRight, CheckCircle2, Copy } from "lucide-react";

interface Props {
  currentClaim: Claim;
  matchedClaim: Claim;
}

export const DuplicateComparator: React.FC<Props> = ({ currentClaim, matchedClaim }) => {
  return (
    <div className="bg-rose-950/40 border-2 border-rose-600/70 rounded-3xl p-5 shadow-xl">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-rose-800/40">
        <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-rose-200">
            Perceptual Duplicate Receipt Detected (High Confidence Match)
          </h3>
          <p className="text-xs text-rose-300/80">
            System detected a visual image fingerprint match with an earlier reimbursement claim.
          </p>
        </div>
      </div>

      {/* Side-by-side comparison grid */}
      <div className="grid md:grid-cols-2 gap-4 text-xs">
        {/* Current Claim */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-rose-500/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="font-bold text-rose-400">Current Claim ({currentClaim.id})</span>
              <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded">
                Under Review
              </span>
            </div>

            <div className="space-y-1.5 text-slate-300 mb-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Employee:</span>
                <span className="font-semibold text-white">{currentClaim.employee?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Claim Date:</span>
                <span className="font-semibold text-white">{currentClaim.claimDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-rose-400">₹{currentClaim.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="h-48 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentClaim.receipt?.fileUrl || "/receipts/demo_indian_oil_dup.jpg"}
                alt="Current Receipt"
                className="h-full w-full object-contain p-2"
              />
            </div>
          </div>
        </div>

        {/* Historical Matched Claim */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="font-bold text-emerald-400">
                Original Historical Claim ({matchedClaim.id})
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                {matchedClaim.status}
              </span>
            </div>

            <div className="space-y-1.5 text-slate-300 mb-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Employee:</span>
                <span className="font-semibold text-white">{matchedClaim.employee?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Claim Date:</span>
                <span className="font-semibold text-white">{matchedClaim.claimDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-emerald-400">₹{matchedClaim.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="h-48 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={matchedClaim.receipt?.fileUrl || "/receipts/demo_indian_oil.jpg"}
                alt="Original Receipt"
                className="h-full w-full object-contain p-2"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
