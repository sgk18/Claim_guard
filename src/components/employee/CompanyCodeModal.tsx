"use client";

import React, { useState } from "react";
import { ShieldCheck, Building2, UserCheck, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface CompanyCodeModalProps {
  isOpen: boolean;
  onVerified: (data: { company: any; employee: any; manager: any }) => void;
}

export function CompanyCodeModal({ isOpen, onVerified }: CompanyCodeModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (codeToVerify?: string) => {
    const targetCode = (codeToVerify || code).trim().toUpperCase();
    if (!targetCode) {
      setError("Please enter a company code.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/company/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: targetCode }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("claimguard_company_code", targetCode);
        onVerified(data.data);
      } else {
        setError(data.error?.message || "Invalid company code. Please use APEX-2026.");
      }
    } catch (e: any) {
      setError("Network error verifying company code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDemoCode = () => {
    setCode("APEX-2026");
    handleVerify("APEX-2026");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-b from-orange-50 to-white px-6 pt-8 pb-4 text-center border-b border-orange-100">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-orange text-white flex items-center justify-center shadow-lg shadow-orange-500/30 mb-3">
            <ShieldCheck className="w-8 h-8 stroke-[2.2]" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-brand-orange bg-orange-100/80 px-2.5 py-0.5 rounded-full">
            Enterprise Verification
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-2">Enter Company Code</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Connect to your organization&apos;s expense policy rules, OCR engine, and manager queue.
          </p>
        </div>

        {/* Modal Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Organization Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="e.g. APEX-2026"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold tracking-wider text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:border-brand-orange focus:ring-2 focus:ring-orange-500/20 outline-none uppercase transition-all"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleVerify();
                }}
              />
            </div>
          </div>

          {/* 1-Click Demo Shortcut */}
          <button
            type="button"
            onClick={handleUseDemoCode}
            disabled={isLoading}
            className="w-full py-2.5 px-3 rounded-xl bg-orange-50/80 hover:bg-orange-100/80 border border-orange-200 text-orange-900 text-xs font-semibold flex items-center justify-between transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-orange shrink-0" />
              <span>Use Active Demo Code: <strong className="font-mono">APEX-2026</strong></span>
            </div>
            <span className="text-[10px] bg-white px-2 py-0.5 rounded-md font-bold text-brand-orange shadow-2xs border border-orange-200 shrink-0">
              1-Click Fill
            </span>
          </button>

          {/* Configured Entities Preview */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-[11px] space-y-1 text-slate-600">
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-medium">Company:</span>
              <span className="font-bold text-slate-900">Apex Logistics India</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-medium">Employee Account:</span>
              <span className="font-semibold text-slate-900">Rahul Kumar (Sales)</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-medium">Finance Controller:</span>
              <span className="font-semibold text-slate-900">Priya Sharma</span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="button"
            onClick={() => handleVerify()}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-brand-orange hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            {isLoading ? (
              <span>Verifying Company...</span>
            ) : (
              <>
                <span>Access Employee Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
