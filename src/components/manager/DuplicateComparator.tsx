import React from "react";
import { Claim } from "@/types";
import { AlertOctagon } from "lucide-react";

interface Props {
  currentClaim: Claim;
  matchedClaim: Claim;
}

export const DuplicateComparator: React.FC<Props> = ({ currentClaim, matchedClaim }) => {
  return (
    <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-rose-200/80">
        <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
          <AlertOctagon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-rose-950">
            Perceptual Duplicate Receipt Detected (Visual Match)
          </h3>
          <p className="text-xs text-rose-800/80">
            Automated image hash matching flagged a visual fingerprint resemblance with a previous claim.
          </p>
        </div>
      </div>

      {/* Side-by-side comparison grid */}
      <div className="grid md:grid-cols-2 gap-4 text-xs">
        {/* Current Claim */}
        <div className="bg-white rounded-xl p-4 border border-rose-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <span className="font-bold text-rose-700">Current Claim ({currentClaim.id})</span>
              <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-medium">
                Under Review
              </span>
            </div>

            <div className="space-y-1.5 text-slate-600 mb-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Employee:</span>
                <span className="font-semibold text-slate-800">{currentClaim.employee?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Claim Date:</span>
                <span className="font-semibold text-slate-800">{currentClaim.claimDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold text-rose-600">₹{currentClaim.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="h-48 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200">
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
        <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <span className="font-bold text-emerald-700">
                Original Historical Claim ({matchedClaim.id})
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                {matchedClaim.status}
              </span>
            </div>

            <div className="space-y-1.5 text-slate-600 mb-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Employee:</span>
                <span className="font-semibold text-slate-800">{matchedClaim.employee?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Claim Date:</span>
                <span className="font-semibold text-slate-800">{matchedClaim.claimDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold text-emerald-700">₹{matchedClaim.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="h-48 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200">
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
