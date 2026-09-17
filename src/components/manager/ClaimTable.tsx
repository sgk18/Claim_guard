import React, { useState } from "react";
import { Claim } from "@/types";
import { RiskBadge } from "./RiskBadge";
import { ClaimStatusBadge } from "@/components/employee/ClaimStatusBadge";
import Link from "next/link";
import { Search, Filter, ArrowUpDown, ChevronRight, AlertCircle, FileCheck } from "lucide-react";

interface Props {
  claims: Claim[];
}

export const ClaimTable: React.FC<Props> = ({ claims }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Filtering
  const filteredClaims = claims.filter((claim) => {
    // Search match
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchId = claim.id.toLowerCase().includes(term);
      const matchVendor = claim.vendorName.toLowerCase().includes(term);
      const matchEmp = claim.employee?.name.toLowerCase().includes(term);
      if (!matchId && !matchVendor && !matchEmp) return false;
    }

    // Status match
    if (statusFilter !== "ALL") {
      if (statusFilter === "PENDING" && (claim.status === "PENDING" || claim.status === "REVIEW_REQUIRED")) {
        // match
      } else if (claim.status !== statusFilter) {
        return false;
      }
    }

    // Risk match
    if (riskFilter !== "ALL") {
      if (claim.riskAssessment?.level !== riskFilter) return false;
    }

    // Category match
    if (categoryFilter !== "ALL") {
      if (claim.category !== categoryFilter) return false;
    }

    return true;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Table Filter Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col lg:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by vendor, employee, or CLM-ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>

        {/* Filter Selects */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-white border border-slate-300 text-xs rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Risk: All Tiers</option>
            <option value="CRITICAL">Critical Risk (80-100)</option>
            <option value="HIGH">High Risk (60-79)</option>
            <option value="MEDIUM">Medium Risk (30-59)</option>
            <option value="LOW">Low Risk (0-29)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 text-xs rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Status: All</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-300 text-xs rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize"
          >
            <option value="ALL">Category: All</option>
            <option value="fuel">Fuel</option>
            <option value="food">Food</option>
            <option value="travel">Travel</option>
            <option value="lodging">Lodging</option>
            <option value="misc">Misc</option>
          </select>

          <span className="text-xs font-semibold text-slate-500 px-2">
            {filteredClaims.length} results
          </span>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Claim ID</th>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Vendor & Details</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Risk Evaluation</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredClaims.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400">
                  No claims found matching filters.
                </td>
              </tr>
            ) : (
              filteredClaims.map((claim) => (
                <tr
                  key={claim.id}
                  className="hover:bg-slate-50/90 transition-colors group cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <Link href={`/manager/claims/${claim.id}`} className="hover:text-emerald-600">
                      {claim.id}
                    </Link>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{claim.employee?.name || "Employee"}</div>
                    <div className="text-[10px] text-slate-400">{claim.employee?.department}</div>
                  </td>

                  <td className="py-3 px-4 max-w-[220px]">
                    <div className="font-semibold text-slate-800 truncate">{claim.vendorName}</div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <span className="capitalize">{claim.category}</span>
                      {claim.gstin && (
                        <>
                          <span>&bull;</span>
                          <span className="font-mono">{claim.gstin}</span>
                        </>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{claim.claimDate}</td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-sm text-slate-900">
                      ₹{claim.amount.toLocaleString()}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    {claim.riskAssessment ? (
                      <div className="flex flex-col items-start gap-1">
                        <RiskBadge
                          level={claim.riskAssessment.level}
                          score={claim.riskAssessment.score}
                          size="sm"
                        />
                        {claim.riskAssessment.rulesTriggered?.length > 0 && (
                          <span className="text-[10px] text-rose-600 font-medium truncate max-w-[160px]">
                            Flag: {claim.riskAssessment.rulesTriggered.join(", ")}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Unassessed</span>
                    )}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <ClaimStatusBadge status={claim.status} size="sm" />
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <Link
                      href={`/manager/claims/${claim.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white font-semibold text-slate-700 transition-colors shadow-xs"
                    >
                      Review
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
