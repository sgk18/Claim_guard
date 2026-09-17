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
  ArrowLeft,
  UserCheck,
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Manager Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-emerald-400">
                ClaimGuard
              </span>
              <span className="block text-[10px] text-slate-400 font-medium">Finance & Ops Portal</span>
            </div>
          </Link>
        </div>

        {/* Center / Right Links & Manager Avatar */}
        <div className="flex items-center gap-3">
          <Link
            href="/employee"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            Test Employee WebView
          </Link>

          <button
            onClick={fetchData}
            title="Refresh Claims"
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-teal-400" : ""}`} />
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1"></div>

          {/* Current Manager User context */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-800 border-2 border-teal-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              PS
            </div>
            <div className="hidden md:block text-left">
              <div className="font-bold text-xs text-white">Priya Sharma</div>
              <div className="text-[10px] text-teal-400 font-medium">Finance Controller</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner Alert for India Operations */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-800/90 to-slate-850/90 border border-slate-700/80 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Apex Logistics India &bull; Regional Operations</h2>
              <p className="text-xs text-slate-400">
                AI and deterministic rules evaluate duplicate receipts, policy ceilings, and GSTINs. Final approvals require your decision.
              </p>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-full shrink-0">
            System Status: Active &bull; 0 Blockers
          </span>
        </div>

        {/* KPI Stats Cards */}
        {stats && <DashboardStats stats={stats} />}

        {/* Claims Table Section */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              Field Workforce Claims Queue
            </h3>
            <span className="text-xs text-slate-400">Sorted by newest submission</span>
          </div>

          <ClaimTable claims={claims} />
        </div>
      </main>
    </div>
  );
}
