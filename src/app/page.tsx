/**
 * ClaimGuard Landing Page
 * 
 * Clean-Code UI Compliance:
 * - Enterprise neutral canvas (#F8FAFC / bg-slate-50), avoiding pure white glare or dark mode slop.
 * - Zero ambient mesh gradients, radial orbs, or dot grid background noise.
 * - Solid opaque surfaces without liquid glass or backdrop-blur filters.
 * - High-contrast 1px border strokes (border-slate-200 / border-slate-300) replacing heavy drop shadows.
 * - Standardized engineering radii (rounded-md / rounded-lg) replacing bubbly oversized rounded-2xl/3xl curves.
 * - Clean two-portal architectural launcher without bento grids, 3-card clichés, or emoji decorations.
 * - Crisp, functional typography and transitions without excessive hover-scaling.
 */

import Link from "next/link";
import { ShieldCheck, Smartphone, LayoutDashboard, Zap, AlertTriangle, FileText, CheckCircle2, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-orange-100 selection:text-orange-900">
      {/* Top Navigation Bar - Crisp opaque surface with 1px border */}
      <header className="border-b border-slate-200 bg-slate-50 sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-orange-600 text-white flex items-center justify-center border border-orange-700">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex items-baseline">
            <span className="font-bold text-lg tracking-tight text-slate-900">
              Claim<span className="text-orange-600">Guard</span>
            </span>
            <span className="ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300 font-mono">
              v1.0-RC
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/about"
            className="font-medium text-slate-600 hover:text-slate-900 transition-colors px-2.5 py-1.5 rounded-md border border-transparent hover:border-slate-300"
          >
            Architecture &amp; Spec
          </Link>
          <span className="hidden sm:inline bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-1 rounded-md font-medium">
            India Field Workforce Architecture
          </span>
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-md font-semibold">
            Status: Ready
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 py-14 lg:py-20 text-center flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold mb-6 mx-auto">
          <Zap className="w-3.5 h-3.5 text-orange-600" />
          Real-time expense verification and automated duplicate prevention
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
          Flag it <span className="text-orange-600 underline decoration-orange-300 underline-offset-6">before</span> you pay it.
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Zero-installation mobile expense submissions for field workforces, backed by deterministic OCR validation, perceptual duplicate detection, and auditable risk scoring.
        </p>

        {/* Dual Portal Launcher Cards - Structured 2-column layout */}
        <div className="grid md:grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto w-full text-left">
          {/* Employee Portal Card */}
          <Link
            href="/employee"
            className="rounded-lg bg-slate-50 border border-slate-300 p-6 flex flex-col justify-between hover:border-orange-500 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-md bg-orange-50 text-orange-700 flex items-center justify-center border border-orange-200">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono border border-slate-300">
                  Employee WebView
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Field Workforce Submission
              </h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Conversational receipt submission flow for field agents. Upload fuel, lodging, and travel bills, verify OCR-extracted metadata, and view real-time validation status.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center text-sm font-semibold text-orange-700 gap-1.5">
              Launch Submission Flow <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Manager Portal Card */}
          <Link
            href="/manager"
            className="rounded-lg bg-slate-50 border border-slate-300 p-6 flex flex-col justify-between hover:border-orange-500 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-md bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-300">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono border border-slate-300">
                  Finance Dashboard
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Operations &amp; Audit Console
              </h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Operations console with pre-seeded claims queue. Filter by risk severity, examine duplicate perceptual matches side-by-side, check GSTIN checksums, and record approval decisions.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center text-sm font-semibold text-orange-700 gap-1.5">
              Launch Operations Console <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Technical Architecture Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto w-full text-left">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 mb-2" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Deterministic First</h3>
            <p className="text-xs text-slate-600 mt-1">Rule-based validation executes before any AI assistance.</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <AlertTriangle className="w-4 h-4 text-orange-600 mb-2" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Perceptual Hashing</h3>
            <p className="text-xs text-slate-600 mt-1">Detects re-photographed and cropped duplicate receipts.</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <FileText className="w-4 h-4 text-slate-700 mb-2" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">GSTIN Validation</h3>
            <p className="text-xs text-slate-600 mt-1">Modulo-36 checksum and state-code tax deduction checks.</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <Zap className="w-4 h-4 text-slate-700 mb-2" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Audit Integrity</h3>
            <p className="text-xs text-slate-600 mt-1">Immutable audit trails for state changes and approvals.</p>
          </div>
        </div>
      </div>

      {/* Footer - Clean 1px border stroke and neutral background */}
      <footer className="border-t border-slate-200 bg-slate-50 py-5 text-center text-xs text-slate-500 font-medium">
        ClaimGuard &bull; Financial Verification Engine &bull; Compliant Enterprise Architecture
      </footer>
    </main>
  );
}
