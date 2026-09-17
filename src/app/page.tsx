import Link from "next/link";
import { ShieldCheck, Smartphone, LayoutDashboard, Zap, AlertTriangle, FileText, CheckCircle2, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-white flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-700/60 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
              ClaimGuard
            </span>
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              MVP v1.0
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-300">
          <span className="hidden sm:inline text-xs bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-md">
            🇮🇳 India-First Architecture
          </span>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-md">
            Mock Mode: Active
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-20 text-center flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6 mx-auto">
          <Zap className="w-3.5 h-3.5" />
          Real-time expense verification & fraud prevention
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 max-w-4xl mx-auto leading-tight">
          Flag it <span className="text-emerald-400 underline decoration-emerald-500/40 underline-offset-8">before</span> you pay it.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
          Zero-installation WhatsApp-inspired expense submissions for field workforces, backed by instant OCR, perceptual duplicate detection, and explainable AI risk scoring.
        </p>

        {/* Dual Portal Launcher Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto w-full text-left">
          {/* Employee Portal Card */}
          <Link
            href="/employee"
            className="group relative rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-850/90 border border-slate-700/70 p-7 hover:border-emerald-500/60 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Employee WebView
                </h2>
                <span className="text-xs bg-slate-700/80 text-slate-300 px-2 py-0.5 rounded font-mono">
                  Mobile View
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                WhatsApp-style conversational flow for field staff. Upload fuel/lodging/food bills, inspect instant OCR extracted values, correct details, and track claim status.
              </p>
            </div>
            <div className="mt-6 flex items-center text-sm font-semibold text-emerald-400 group-hover:text-emerald-300 gap-1.5">
              Launch Employee Experience <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Manager Portal Card */}
          <Link
            href="/manager"
            className="group relative rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-850/90 border border-slate-700/70 p-7 hover:border-teal-500/60 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors">
                  Manager Operations
                </h2>
                <span className="text-xs bg-slate-700/80 text-slate-300 px-2 py-0.5 rounded font-mono">
                  Finance Dashboard
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Operations dashboard with 50+ pre-seeded claims. Filter by risk severity, compare duplicate receipts side-by-side, inspect policy flags, and approve or reject with audit notes.
              </p>
            </div>
            <div className="mt-6 flex items-center text-sm font-semibold text-teal-400 group-hover:text-teal-300 gap-1.5">
              Launch Manager Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Feature Matrix Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 max-w-4xl mx-auto w-full text-left">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
            <h4 className="text-sm font-semibold text-slate-200">AI Assists. Humans Decide.</h4>
            <p className="text-xs text-slate-400 mt-1">Never auto-rejects without human manager authorization.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <AlertTriangle className="w-5 h-5 text-amber-400 mb-2" />
            <h4 className="text-sm font-semibold text-slate-200">Perceptual Hashing</h4>
            <p className="text-xs text-slate-400 mt-1">Detects re-photographed & cropped duplicate bills.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <FileText className="w-5 h-5 text-sky-400 mb-2" />
            <h4 className="text-sm font-semibold text-slate-200">GSTIN Validation</h4>
            <p className="text-xs text-slate-400 mt-1">State-code format & ITC deduction compliance checks.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <Zap className="w-5 h-5 text-indigo-400 mb-2" />
            <h4 className="text-sm font-semibold text-slate-200">WhatsApp-Decoupled</h4>
            <p className="text-xs text-slate-400 mt-1">Agnostic channel architecture ready for Meta Cloud API.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        ClaimGuard India MVP &bull; Built with Next.js, TypeScript & Tailwind CSS &bull; 2026
      </footer>
    </main>
  );
}
