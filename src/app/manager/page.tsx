"use client";

import React, { useState, useEffect } from "react";
import { DashboardStats } from "@/components/manager/DashboardStats";
import { ClaimTable } from "@/components/manager/ClaimTable";
import { Claim, ManagerStats } from "@/types";
import {
  ShieldCheck,
  RefreshCw,
  Smartphone,
  Layers,
  Building,
} from "lucide-react";
import Link from "next/link";

export default function ManagerDashboardPage() {
  const [stats, setStats] = useState<ManagerStats | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, claimsRes] = await Promise.all([
        fetch("/api/manager/stats"),
        fetch("/api/claims"),
      ]);

      const statsData = await statsRes.json();
      const claimsData = await claimsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (claimsData.success) setClaims(claimsData.data);
    } catch (err) {
      console.error("Failed to load manager dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen ambient-mesh-subtle text-slate-900 flex flex-col selection:bg-orange-100 selection:text-orange-900">
      {/* Manager Navigation Bar */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                Claim<span className="text-brand-orange">Guard</span>
              </span>
              <span className="block text-[10px] text-slate-500 font-medium">Finance Operations Portal</span>
            </div>
          </Link>
        </div>

        {/* Center / Right Links & Manager Avatar */}
        <div className="flex items-center gap-3">
          <Link
            href="/employee"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-brand-orange" />
            Test Employee WebView
          </Link>

          <button
            onClick={fetchData}
            title="Refresh Claims"
            disabled={isLoading}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-brand-orange" : ""}`} />
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          {/* Current Manager User context */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-xs font-bold text-orange-700 shadow-xs">
              PS
            </div>
            <div className="hidden md:block text-left">
              <div className="font-bold text-xs text-slate-900">Priya Sharma</div>
              <div className="text-[10px] text-slate-500 font-medium">Finance Controller</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner Alert for India Operations */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-sm gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-brand-orange border border-orange-200/60 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-extrabold text-sm text-slate-900">Apex Logistics India &bull; Regional Operations Queue</h2>
                <span className="bg-orange-100 text-orange-900 border border-orange-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                  Company Code: APEX-2026
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated OCR and deterministic rules evaluate duplicate receipts, policy ceilings, and GSTIN compliance. Final reimbursement approvals require human verification.
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shrink-0">
            System Status: Active &bull; Realtime
          </span>
        </div>

        {/* KPI Stats Cards */}
        {stats && <DashboardStats stats={stats} />}

        {/* Claims Table Section */}
        <div className="bg-white/90 rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 px-1">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-orange" />
              Field Workforce Claims Queue
            </h3>
            <span className="text-xs text-slate-500 font-medium">Sorted by newest submission</span>
          </div>

          <ClaimTable claims={claims} />
        </div>
      </main>
    </div>
  );
}
