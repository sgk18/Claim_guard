import React, { useState } from "react";
import { Check, X } from "lucide-react";

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
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isApprove ? "bg-orange-50 text-brand-orange border border-orange-200" : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {isApprove ? <Check className="w-5 h-5 stroke-[2.5]" /> : <X className="w-5 h-5 stroke-[2.5]" />}
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">
              {isApprove ? `Approve Claim ${claimId}` : `Reject Claim ${claimId}`}
            </h3>
            <p className="text-xs text-slate-500">
              {isApprove
                ? "Authorize reimbursement payout for this expense"
                : "Disallow reimbursement and record decision note"}
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
              className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-orange font-medium resize-none text-slate-800"
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
                    className="px-2 py-1 bg-slate-50 hover:bg-orange-50 hover:text-orange-950 hover:border-orange-300 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-medium transition-colors"
                  >
                    Standard Clearance
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickNote("Approved exception: supervisor cleared emergency fuel purchase.")}
                    className="px-2 py-1 bg-slate-50 hover:bg-orange-50 hover:text-orange-950 hover:border-orange-300 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-medium transition-colors"
                  >
                    Exception Override
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleQuickNote("Rejected: Visual duplicate of previously reimbursed fuel receipt.")}
                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-800 text-[11px] border border-rose-200 font-medium transition-colors"
                  >
                    Duplicate Receipt
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickNote("Rejected: Category mismatch. Dining invoice claimed under Fuel.")}
                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-800 text-[11px] border border-rose-200 font-medium transition-colors"
                  >
                    Category Breach
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickNote("Rejected: Amount exceeds permissible policy cap.")}
                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-800 text-[11px] border border-rose-200 font-medium transition-colors"
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
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 text-white ${
                isApprove
                  ? "bg-brand-orange hover:bg-orange-600"
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
