/**
 * ClaimGuard About Page
 * 
 * Clean-Code UI Compliance:
 * - Enterprise neutral canvas (#F8FAFC / bg-slate-50) replacing pure white backgrounds.
 * - Zero radial orbs, ambient mesh gradients, or decorative patterns.
 * - Crisp opaque surfaces with standard 1px border strokes (border-slate-200/300) without backdrop-blur filters.
 * - Strict elimination of heavy drop shadows (shadow-lg / shadow-xl).
 * - Standardized engineering radii (rounded-md / rounded-lg) replacing bubbly soft curves.
 * - Structured grid architecture without fake testimonials, bento grids, emojis, or three-card clichés.
 * - Restrained, professional typography and semantic color hierarchy.
 */

import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Smartphone,
  ScanLine,
  Gauge,
  BadgeCheck,
  Receipt,
  MapPin,
  FileText,
  BookOpen,
  Users,
} from "lucide-react";

export const metadata = {
  title: "About | ClaimGuard",
  description:
    "ClaimGuard is a deterministic pre-payment verification layer for expense claims from India's field workforces.",
};

const steps = [
  {
    icon: Smartphone,
    title: "Receipt Ingestion",
    text: "Field workforce captures a fuel, toll, lodging, or meal receipt via mobile web view or direct upload. Zero mandatory native app installations.",
  },
  {
    icon: ScanLine,
    title: "Deterministic OCR & Signal Extraction",
    text: "Vendor metadata, total amount, transaction date, category, and GSTIN are parsed and checked against duplicate bill hashes and company policy rules.",
  },
  {
    icon: Gauge,
    title: "Explainable Risk Scoring",
    text: "The finance manager receives an auditable risk evaluation explaining exact policy breaches and anomaly signals, not a black-box percentage.",
  },
  {
    icon: BadgeCheck,
    title: "Manager Decision & Audit Trail",
    text: "Every approve or reject action requires authorized manager identity attribution and is logged to an append-only immutable audit trail.",
  },
];

const differentiators = [
  {
    icon: FileText,
    title: "GSTIN Modulo-36 Validation",
    text: "State-code verification and checksum computation for every printed merchant GSTIN.",
  },
  {
    icon: Receipt,
    title: "GST ITC Staging",
    text: "Eligible Input Tax Credit is systematically staged per verified claim for finance reconciliation.",
  },
  {
    icon: BookOpen,
    title: "ERP & Accounting Integration",
    text: "Structured reconciliation data ready for standard corporate Indian accounting software.",
  },
  {
    icon: MapPin,
    title: "Perceptual Duplicate Detection",
    text: "Bitwise Hamming distance perceptual hashing flags re-photographed and cropped bill copies.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-orange-100 selection:text-orange-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-slate-50 sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-orange-600 text-white flex items-center justify-center border border-orange-700">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">
            Claim<span className="text-orange-600">Guard</span>
          </span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors px-2.5 py-1.5 rounded-md border border-slate-200 hover:border-slate-300"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Console
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16 w-full flex-1">
        {/* Intro */}
        <section className="text-center">
          <span className="inline-block px-3 py-1 rounded-md bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold">
            System Specification &amp; Architecture
          </span>
          <h1 className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Flag it <span className="text-orange-600 underline decoration-orange-300 underline-offset-6">before</span> you pay it.
          </h1>
          <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            ClaimGuard is a deterministic pre-payment verification layer positioned between field expense submissions and corporate payout execution.
          </p>
        </section>

        {/* Problem Statement */}
        <section className="mt-12 rounded-lg bg-slate-50 border border-slate-300 p-6">
          <h2 className="text-lg font-bold text-slate-900">The Problem: Post-Payment Leakage</h2>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Logistics fleets, FMCG field sales operations, and distributed field teams file fuel, lodging, and travel claims in high volume and modest individual value. Traditional verification takes place weeks after payout during retrospective audits when capital has already leaked.
          </p>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Enterprise ERP expense suites require steep per-seat licenses and cumbersome employee mobile apps, while spreadsheets lack automated duplicate detection and GSTIN verification. ClaimGuard addresses this operational gap directly.
          </p>
        </section>

        {/* How it works - 2x2 Grid */}
        <section className="mt-12">
          <h2 className="text-lg font-bold text-slate-900 text-center">
            Verification Pipeline
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="rounded-lg bg-slate-50 border border-slate-200 p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-300">
                    <step.icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {i + 1}. {step.title}
                  </h3>
                </div>
                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Core Architectural Principle */}
        <section className="mt-12 rounded-lg bg-slate-900 text-white p-6 border border-slate-800 text-center">
          <h2 className="text-base font-bold tracking-wide uppercase text-slate-200">
            Core Philosophy: Deterministic Rules First, AI Assists, Humans Authorize
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            ClaimGuard never executes automated rejections without explicit manager authorization. Deterministic rules execute first, AI assists with explanation, and human management maintains fiduciary sign-off.
          </p>
        </section>

        {/* Technical Differentiators */}
        <section className="mt-12">
          <h2 className="text-lg font-bold text-slate-900 text-center">
            India-Specific Compliance Architecture
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {differentiators.map((d) => (
              <div
                key={d.title}
                className="p-4 rounded-lg bg-slate-50 border border-slate-200"
              >
                <d.icon className="w-4 h-4 text-orange-600 mb-2" />
                <h3 className="text-xs font-bold text-slate-900">{d.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {d.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Target Workforces */}
        <section className="mt-12 rounded-lg bg-slate-50 border border-slate-300 p-6 flex gap-4 items-start">
          <div className="w-10 h-10 shrink-0 rounded-md bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-300">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Target Operating Profile</h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Designed for companies operating 50 to 500 field personnel in freight logistics, FMCG field sales, distribution, or field service. These operations process too many transactions for manual review, yet cannot justify complex enterprise software deployments.
            </p>
          </div>
        </section>

        {/* Navigation Actions */}
        <section className="mt-12 text-center">
          <h2 className="text-base font-bold text-slate-900">Access Subsystems</h2>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/employee"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-orange-600 text-white text-xs font-bold border border-orange-700 hover:bg-orange-700 transition-colors"
            >
              Employee Submission Flow <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/manager"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-100 border border-slate-300 text-slate-900 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Manager Operations Console <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-5 text-center text-xs text-slate-500 font-medium">
        ClaimGuard &bull; Financial Verification Engine &bull; Compliant Enterprise Architecture
      </footer>
    </main>
  );
}
