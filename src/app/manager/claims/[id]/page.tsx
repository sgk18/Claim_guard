"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Claim } from "@/types";
import { ReceiptViewer } from "@/components/manager/ReceiptViewer";
import { DuplicateComparator } from "@/components/manager/DuplicateComparator";
import { RiskSignalBreakdown } from "@/components/manager/RiskSignalBreakdown";
import { ApprovalModal } from "@/components/manager/ApprovalModal";
import { AuditTimeline } from "@/components/manager/AuditTimeline";
import { ClaimStatusBadge } from "@/components/employee/ClaimStatusBadge";
import { RiskBadge } from "@/components/manager/RiskBadge";
import {
  ArrowLeft,
  Check,
  X,
  Clock,
  User,
  Calendar,
  IndianRupee,
  FileText,
  AlertTriangle,
  Receipt,
  Download,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

export default function ClaimReviewPage() {
  const params = useParams();
  const router = useRouter();
  const claimId = params.id as string;

  const [claim, setClaim] = useState<(Claim & { matchedClaim?: Claim }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionModal, setActionModal] = useState<"APPROVE" | "REJECT" | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const fetchClaim = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/claims/${claimId}`);
      const data = await res.json();
      if (data.success) {
        setClaim(data.data);
      }
    } catch (err) {
      console.error("Failed to load claim:", err);
    } finally {
      setIsLoading(false);
    }
  }, [claimId]);

  useEffect(() => {
    if (claimId) {
      fetchClaim();
    }
  }, [claimId, fetchClaim]);

  const handleDecision = async (notes: string) => {
    if (!actionModal || !claim) return;
    setIsProcessingAction(true);

    try {
      const endpoint = actionModal === "APPROVE" ? `/api/claims/${claim.id}/approve` : `/api/claims/${claim.id}/reject`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          managerId: "mgr_priya_01",
          notes,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        setActionModal(null);
        await fetchClaim(); // refresh with new status & audit log
      }
    } catch (err) {
      console.error("Failed to submit decision:", err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen ambient-mesh-subtle text-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-slate-600 text-sm font-medium bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-4 h-4 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
          Loading claim verification data...
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="min-h-screen ambient-mesh-subtle text-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold mb-2">Claim Not Found</h2>
        <p className="text-slate-500 text-sm mb-4">The claim with ID {claimId} does not exist or was removed.</p>
        <Link
          href="/manager"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isDuplicate = claim.riskAssessment?.signals?.some(
    (s) => s.type === "DUPLICATE_RECEIPT"
  );

  return (
    <div className="min-h-screen ambient-mesh-subtle text-slate-900 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Top Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/manager"
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 transition-colors border border-slate-200 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base text-slate-900 tracking-tight">Claim #{claim.id}</h1>
              <ClaimStatusBadge status={claim.status} size="sm" />
              {claim.riskAssessment && (
                <RiskBadge
                  level={claim.riskAssessment.level}
                  score={claim.riskAssessment.score}
                  size="sm"
                />
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Submitted on {new Date(claim.createdAt).toLocaleDateString()} &bull; {claim.vendorName}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {claim.status !== "APPROVED" && (
            <button
              onClick={() => setActionModal("APPROVE")}
              className="px-4 py-2 bg-brand-orange hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              Approve Claim
            </button>
          )}

          {claim.status !== "REJECTED" && (
            <button
              onClick={() => setActionModal("REJECT")}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <X className="w-4 h-4" />
              Reject Claim
            </button>
          )}
        </div>
      </header>

      {/* Main Review Split Screen */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid lg:grid-cols-12 gap-6">
        {/* Left Column: Receipt Visual Inspection */}
        <div className="lg:col-span-6 space-y-6">
          <ReceiptViewer
            imageUrl={claim.receipt?.fileUrl || "/receipts/demo_indian_oil.jpg"}
            vendorName={claim.vendorName}
            ocrText={claim.receipt?.rawOcrText}
          />

          {/* If duplicate suspected and matched claim exists, show split comparator */}
          {isDuplicate && claim.matchedClaim && (
            <DuplicateComparator currentClaim={claim} matchedClaim={claim.matchedClaim} />
          )}
        </div>

        {/* Right Column: Metadata, Risk Signals, Audit Timeline */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. Employee Context Card */}
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-200/90 shadow-sm">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <User className="w-4 h-4 text-brand-orange" />
              <span>Employee Information</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Name & Role</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{claim.employee?.name}</div>
                <div className="text-slate-500 text-[11px]">{claim.employee?.role}</div>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Department</span>
                <div className="font-semibold text-slate-800 mt-0.5">{claim.employee?.department}</div>
                <div className="text-slate-500 text-[11px]">{claim.employee?.email}</div>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Historical Average</span>
                <div className="font-bold text-brand-orange mt-0.5">
                  ₹{claim.employee?.historicalClaimAvg?.toLocaleString()}
                </div>
                <div className="text-slate-500 text-[10px]">
                  Across {claim.employee?.historicalClaimCount} claims
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Associated Business Trip</span>
                <div className="font-semibold text-slate-900 truncate mt-0.5">
                  {claim.trip?.title || "Local Field Assignment"}
                </div>
                <div className="text-slate-500 text-[10px]">
                  {claim.trip ? `${claim.trip.startDate} to ${claim.trip.endDate}` : "Single-day route"}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Extracted Receipt Overview Card */}
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-brand-orange" />
                <span>Extracted Receipt Data</span>
              </div>
              <span className="text-xs font-extrabold text-brand-orange bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200">
                ₹{claim.amount.toLocaleString()} INR
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Vendor</span>
                <div className="font-bold text-slate-900 mt-0.5">{claim.vendorName}</div>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Category</span>
                <div className="font-semibold text-slate-900 capitalize mt-0.5">{claim.category}</div>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Receipt Date</span>
                <div className="font-semibold text-slate-900 mt-0.5">{claim.claimDate}</div>
              </div>

              <div>
                <span className="text-slate-400 font-medium">GSTIN</span>
                <div className="font-mono text-slate-900 font-medium mt-0.5">{claim.gstin || "Not provided"}</div>
              </div>
            </div>

            {claim.managerNotes && (
              <div className="mt-4 pt-3 border-t border-slate-100 bg-orange-50/50 p-3 rounded-xl border border-orange-200/60">
                <span className="text-[11px] font-bold text-orange-800 block mb-0.5">
                  Manager Decision Note:
                </span>
                <p className="text-xs text-slate-700 italic">{claim.managerNotes}</p>
              </div>
            )}
          </div>

          {/* 3. Risk Signal Breakdown & Evidence */}
          {claim.riskAssessment && (
            <RiskSignalBreakdown riskAssessment={claim.riskAssessment} />
          )}

          {/* 4. Immutable Audit Timeline */}
          {claim.auditLogs && claim.auditLogs.length > 0 && (
            <AuditTimeline logs={claim.auditLogs} />
          )}
        </div>
      </main>

      {/* Decision Modal */}
      {actionModal && (
        <ApprovalModal
          claimId={claim.id}
          action={actionModal}
          isOpen={true}
          onClose={() => setActionModal(null)}
          onConfirm={handleDecision}
          isProcessing={isProcessingAction}
        />
      )}
    </div>
  );
}
