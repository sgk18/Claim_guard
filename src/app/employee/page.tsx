"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageBubble, ChatMessage } from "@/components/employee/MessageBubble";
import { ExtractedCard } from "@/components/employee/ExtractedCard";
import { CorrectionModal } from "@/components/employee/CorrectionModal";
import { ReceiptUploader } from "@/components/employee/ReceiptUploader";
import { HistoryDrawer } from "@/components/employee/HistoryDrawer";
import { ClaimStatusBadge } from "@/components/employee/ClaimStatusBadge";
import { ExtractedReceiptData, Employee, Claim } from "@/types";
import {
  ShieldCheck,
  History,
  User,
  ArrowLeft,
  Info,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function EmployeeWebViewPage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedReceiptData | null>(null);
  const [uploadedReceiptUrl, setUploadedReceiptUrl] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [employeeClaims, setEmployeeClaims] = useState<Claim[]>([]);
  const [deviceFrame, setDeviceFrame] = useState(false); // Mobile frame toggle for desktop reviewers

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, extractedData, isUploading]);

  // Load initial employee profile (Rahul Kumar - Field Sales)
  useEffect(() => {
    async function loadInitialData() {
      try {
        const empRes = await fetch("/api/employees/emp_rahul_102");
        const empData = await empRes.json();
        if (empData.success) {
          setEmployee(empData.data);
          // Initial greeting message
          const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setMessages([
            {
              id: "msg_welcome_1",
              sender: "bot",
              text: `Hello ${empData.data.name.split(" ")[0]}.\n\nI am ClaimGuard, your real-time expense verification assistant.\n\nReady to submit your expense receipt? Select or drop your bill below to begin verification.`,
              timestamp: time,
            },
          ]);
        }

        // Load historical claims
        const claimsRes = await fetch("/api/employees/emp_rahul_102/claims");
        const claimsData = await claimsRes.json();
        if (claimsData.success) {
          setEmployeeClaims(claimsData.data);
        }
      } catch (e) {
        console.error("Failed to load employee:", e);
      }
    }
    loadInitialData();
  }, []);

  // Handle Receipt Upload
  const handleReceiptUpload = async (file: File) => {
    setIsUploading(true);
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // 1. Create client preview and add user message
    const objectUrl = URL.createObjectURL(file);
    setMessages((prev) => [
      ...prev,
      {
        id: `msg_usr_${Date.now()}`,
        sender: "user",
        text: `Submitted receipt: ${file.name}`,
        imageUrl: objectUrl,
        timestamp: time,
      },
      {
        id: `msg_bot_proc_${Date.now()}`,
        sender: "bot",
        text: "Got it! Running OCR and reading your receipt details...",
        timestamp: time,
      },
    ]);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("employeeId", employee?.id || "emp_rahul_102");

      const res = await fetch("/api/claims/upload", {
        method: "POST",
        body: formData,
      });

      const resData = await res.json();
      if (!resData.success) {
        throw new Error(resData.error?.message || "Upload failed");
      }

      setDraftId(resData.data.draftId);
      setExtractedData(resData.data.extracted);
      setUploadedReceiptUrl(resData.data.receipt.fileUrl);

      const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_bot_ext_${Date.now()}`,
          sender: "bot",
          text: `Here is what I extracted from your receipt. Please review and confirm the details:`,
          timestamp: botTime,
        },
      ]);
    } catch (err: any) {
      const errTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_bot_err_${Date.now()}`,
          sender: "bot",
          text: `Processing notice: ${err.message}. Please upload a clearer photo.`,
          timestamp: errTime,
        },
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Claim (Confirm or Corrected)
  const handleSubmitClaim = async (dataToSubmit?: ExtractedReceiptData & { notes?: string }) => {
    const finalData = dataToSubmit || extractedData;
    if (!finalData || !employee) return;

    setIsSubmitting(true);
    setIsEditModalOpen(false);
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    try {
      const payload = {
        draftId,
        employeeId: employee.id,
        vendorName: finalData.vendorName,
        amount: finalData.amount,
        currency: finalData.currency || "INR",
        date: finalData.date,
        category: finalData.category,
        gstin: finalData.gstin,
        employeeNotes: (finalData as any).notes || "",
      };

      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!resData.success) {
        throw new Error(resData.error?.message || "Submission failed");
      }

      const newClaim: Claim = resData.data;

      // Update employee claims
      setEmployeeClaims((prev) => [newClaim, ...prev]);

      // Reset extraction state
      setExtractedData(null);
      setDraftId(null);

      // Add user confirmation bubble & Bot response
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_usr_conf_${Date.now()}`,
          sender: "user",
          text: "Details confirmed. Submit for approval.",
          timestamp: time,
        },
        {
          id: `msg_bot_done_${Date.now()}`,
          sender: "bot",
          text: `Claim Submitted Successfully.\n\nClaim ID: ${newClaim.id}\nVendor: ${newClaim.vendorName}\nAmount: INR ${newClaim.amount.toLocaleString()}\nStatus: ${newClaim.status === "REVIEW_REQUIRED" ? "UNDER REVIEW (Compliance Check)" : "PENDING APPROVAL"}\n\nYour manager will review the claim. You can track status in your history anytime.`,
          timestamp: time,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_bot_sub_err_${Date.now()}`,
          sender: "bot",
          text: `Submission error: ${err.message}`,
          timestamp: time,
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen ambient-mesh-bg flex flex-col justify-center items-center sm:p-4 font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Desktop Ribbon / Mode Switcher */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-md mb-2 px-2 text-xs text-slate-600">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-brand-orange font-semibold transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Portal Home
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDeviceFrame(!deviceFrame)}
            className="px-2 py-1 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-medium shadow-xs"
          >
            {deviceFrame ? "Minimal Window" : "Phone Frame"}
          </button>
        </div>
      </div>

      {/* Mobile Device Frame */}
      <div
        className={`w-full max-w-md bg-white flex flex-col h-screen sm:h-[844px] sm:max-h-[90vh] sm:rounded-[36px] overflow-hidden shadow-2xl ${
          deviceFrame ? "sm:border-[8px] sm:border-slate-800" : "sm:border border-slate-200"
        }`}
      >
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-md text-slate-900 px-4 py-3 flex items-center justify-between shadow-xs border-b border-slate-200 select-none z-10">
          <div className="flex items-center gap-3">
            <Link href="/" className="sm:hidden p-1 -ml-1 text-slate-500 hover:text-slate-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm leading-tight text-slate-900">Claim<span className="text-brand-orange">Guard</span></h1>
                <span className="text-[10px] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200 font-bold">
                  Assistant
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">Instant Expense Verification</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsHistoryOpen(true)}
              title="Claim History"
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors shadow-2xs"
            >
              <History className="w-4 h-4" />
              {employeeClaims.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-orange text-white font-bold text-[9px] flex items-center justify-center">
                  {employeeClaims.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Employee Context Ribbon */}
        {employee && (
          <div className="bg-slate-50/90 text-slate-700 px-4 py-1.5 text-[11px] flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-1.5 truncate">
              <User className="w-3.5 h-3.5 text-brand-orange" />
              <span className="font-bold text-slate-900">{employee.name}</span>
              <span className="text-slate-500 truncate">({employee.department})</span>
            </div>
            <span className="text-[10px] bg-white text-orange-800 border border-orange-200 px-2 py-0.5 rounded font-mono font-bold shadow-2xs shrink-0">
              Avg: ₹{employee.historicalClaimAvg.toLocaleString()}
            </span>
          </div>
        )}

        {/* Chat Conversation Area (WhatsApp background pattern) */}
        <div className="flex-1 overflow-y-auto p-3 chat-bg-pattern flex flex-col justify-start">
          <div className="my-2 mx-auto max-w-[85%] bg-amber-50/90 border border-amber-200/80 rounded-xl p-2 text-center text-[11px] text-amber-900 shadow-sm font-medium">
            System Notice: Claims are processed using automated OCR and fraud rules. Approvals are decided by authorized company managers.
          </div>

          {/* Message Stream */}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Loading typing indicator during OCR extraction */}
          {isUploading && (
            <div className="flex items-center gap-2 bg-white rounded-2xl px-3.5 py-2 w-fit shadow-sm border border-slate-200 my-1">
              <RefreshCw className="w-3.5 h-3.5 text-brand-orange animate-spin" />
              <span className="text-xs text-slate-600">Extracting receipt fields with OCR...</span>
            </div>
          )}

          {/* Extracted Fields Card */}
          {extractedData && (
            <ExtractedCard
              data={extractedData}
              onConfirm={() => handleSubmitClaim()}
              onEdit={() => setIsEditModalOpen(true)}
              isSubmitting={isSubmitting}
            />
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Bottom Receipt Uploader */}
        <ReceiptUploader
          onFileSelected={handleReceiptUpload}
          isUploading={isUploading || isSubmitting}
        />
      </div>

      {/* Correction Form Modal */}
      {extractedData && (
        <CorrectionModal
          initialData={extractedData}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleSubmitClaim}
          isSubmitting={isSubmitting}
        />
      )}

      {/* History Drawer */}
      <HistoryDrawer
        claims={employeeClaims}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}
