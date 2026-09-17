import React, { useState } from "react";
import { ExtractedReceiptData, ExpenseCategory } from "@/types";
import { X, Check } from "lucide-react";

interface Props {
  initialData: ExtractedReceiptData;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (corrected: ExtractedReceiptData & { notes?: string }) => void;
  isSubmitting?: boolean;
}

export const CorrectionModal: React.FC<Props> = ({
  initialData,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [vendorName, setVendorName] = useState(initialData.vendorName || "");
  const [amount, setAmount] = useState(initialData.amount ? String(initialData.amount) : "");
  const [date, setDate] = useState(initialData.date || "");
  const [category, setCategory] = useState<ExpenseCategory>(initialData.category || "fuel");
  const [gstin, setGstin] = useState(initialData.gstin || "");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...initialData,
      vendorName,
      amount: parseFloat(amount) || 0,
      date,
      category,
      gstin: gstin.toUpperCase().trim(),
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900">Edit Receipt Details</h3>
            <p className="text-xs text-slate-500">Correct any information misread by OCR</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Vendor / Merchant Name</label>
            <input
              type="text"
              required
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              placeholder="e.g. Indian Oil Corporation"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amount (₹ INR)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-700 text-sm"
                placeholder="₹0.00"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Receipt Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expense Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white capitalize"
              >
                <option value="fuel">Fuel / Petrol / Diesel</option>
                <option value="food">Meals & Food</option>
                <option value="travel">Travel / Taxi / Train</option>
                <option value="lodging">Hotel / Lodging</option>
                <option value="misc">Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">GSTIN (Optional)</label>
              <input
                type="text"
                maxLength={15}
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
                placeholder="29ABCDE1234F1Z5"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Trip / Expense Notes (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium resize-none"
              placeholder="e.g. Refueling company fleet vehicle during client tour"
            />
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-3 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold flex items-center justify-center gap-1.5 shadow-tactile border border-brand-orange/80 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              {isSubmitting ? "Submitting..." : "Save & Submit Claim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
