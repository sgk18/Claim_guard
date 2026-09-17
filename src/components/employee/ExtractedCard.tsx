import React from "react";
import { ExtractedReceiptData } from "@/types";
import { Check, Edit3, AlertTriangle, ShieldCheck } from "lucide-react";

interface Props {
  data: ExtractedReceiptData;
  onConfirm: () => void;
  onEdit: () => void;
  isSubmitting?: boolean;
}

export const ExtractedCard: React.FC<Props> = ({
  data,
  onConfirm,
  onEdit,
  isSubmitting = false,
}) => {
  const isLowConfidence = data.needsReview || (data.confidence && data.confidence.amount < 0.7);

  return (
    <div className="flex w-full my-2 justify-start animate-fade-in">
      <div className="w-full max-w-[92%] sm:max-w-[85%] bg-white rounded-2xl p-4 shadow-md border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 text-sm">Extracted Receipt Details</span>
          </div>
          {isLowConfidence ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              Verify Fields
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              High Confidence
            </span>
          )}
        </div>

        {/* Extracted Fields Grid */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-500 font-medium">Vendor:</span>
            <span className="font-semibold text-slate-800 text-right truncate max-w-[180px]">
              {data.vendorName || "—"}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-50 items-center">
            <span className="text-slate-500 font-medium">Amount:</span>
            <span className="font-bold text-base text-emerald-700">
              ₹{data.amount > 0 ? data.amount.toLocaleString() : "0.00"}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-500 font-medium">Date:</span>
            <span className="font-semibold text-slate-800">{data.date || "—"}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-500 font-medium">Category:</span>
            <span className="font-semibold text-slate-800 capitalize">{data.category}</span>
          </div>

          {data.gstin && (
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">GSTIN:</span>
              <span className="font-mono text-[11px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                {data.gstin}
              </span>
            </div>
          )}
        </div>

        {isLowConfidence && (
          <p className="mt-2.5 text-[11px] text-amber-800 bg-amber-50/70 p-2 rounded-lg border border-amber-200/60 leading-tight">
            Some receipt values had low optical clarity. Please ensure the amount and vendor match your bill.
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-4 pt-2 border-t border-slate-100 flex gap-2">
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            {isSubmitting ? "Submitting..." : "Everything is correct"}
          </button>
          <button
            onClick={onEdit}
            disabled={isSubmitting}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};
