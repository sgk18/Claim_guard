import React, { useState } from "react";
import { Check, X, AlertTriangle } from "lucide-react";

interface Props {
  claimId: string;
  action: "APPROVE" | "REJECT";
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => Promise<void>;
  isProcessing?: boolean;
}

export const ApprovalModal: React.FC<Props> = ({
  claimId,
  action,
  isOpen,
  onClose,
  onConfirm,
  isProcessing = false,
}) => {
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const isApprove = action === "APPROVE";

  const handleQuickNote = (preset: string) => {
    setNotes(preset);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(notes);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isApprove ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
            }`}
          >
            {isApprove ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">
              {isApprove ? `Approve Claim ${claimId}` : `Reject Claim ${claimId}`}
            </h3>
            <p className="text-xs text-slate-500">
              {isApprove
                ? "Authorize reimbursement payout for this expense"
                : "Disallow reimbursement and record rejection reason"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Decision Comments / Audit Notes:
            </label>
            <textarea
              rows={3}
              required={!isApprove}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isApprove
                  ? "e.g. Verified with regional manager and confirmed route legitimacy."
                  : "e.g. Duplicate bill detected matching previous submission. Disallowed."
              }
              className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium resize-none text-slate-800"
            />
          </div>

          {/* Quick preset chips */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Quick Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {isApprove ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleQuickNote("Approved: Verified within travel schedule and project budget.")}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-[11px]"
                  >
                    Standard Clearance
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickNote("Approved exception: supervisor cleared emergency fuel purchase.")}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-[11px]"
                  >
                    Exception Override
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleQuickNote("Rejected: Visual duplicate of previously reimbursed fuel receipt.")}
                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-800 text-[11px]"
                  >
                    Duplicate Receipt
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickNote("Rejected: Category mismatch. Dining invoice claimed under Fuel.")}
                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-800 text-[11px]"
                  >
                    Category Breach
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickNote("Rejected: Amount exceeds permissible policy cap.")}
                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-800 text-[11px]"
                  >
                    Policy Exceeded
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-white transition-all shadow-md flex items-center justify-center gap-1.5 ${
                isApprove
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {isProcessing ? "Processing..." : isApprove ? "Confirm Approval" : "Confirm Rejection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
