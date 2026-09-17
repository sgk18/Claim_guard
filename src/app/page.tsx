import Link from "next/link";
import { ShieldCheck, Smartphone, LayoutDashboard, Zap, AlertTriangle, FileText, CheckCircle2, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-orange to-brand-peach flex items-center justify-center shadow-tactile">
            <ShieldCheck className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-white">
              Claim<span className="text-brand-orange">Guard</span>
            </span>
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-brand-peach border border-slate-700">
              MVP v1.0
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-300">
          <span className="hidden sm:inline text-xs bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-md font-medium">
            India-First Architecture
          </span>
          <span className="text-xs bg-brand-orange/10 text-brand-orange border border-brand-orange/30 px-2.5 py-1 rounded-md font-medium">
            Mock Mode: Active
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-20 text-center flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/30 text-brand-orange text-xs font-semibold mb-6 mx-auto">
          <Zap className="w-3.5 h-3.5" />
          Real-time expense verification and fraud prevention
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Flag it <span className="text-brand-orange underline decoration-brand-orange/40 underline-offset-8">before</span> you pay it.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Zero-installation mobile expense submissions for field workforces, backed by instant OCR, perceptual duplicate detection, and explainable AI risk scoring.
        </p>

        {/* Dual Portal Launcher Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto w-full text-left">
          {/* Employee Portal Card */}
          <Link
            href="/employee"
            className="group relative rounded-2xl bg-slate-850/90 border-2 border-slate-700/80 p-7 hover:border-brand-orange hover:shadow-tactile transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-orange/15 text-brand-orange flex items-center justify-center mb-5 group-hover:scale-105 transition-transform border border-brand-orange/30">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white group-hover:text-brand-peach transition-colors">
                  Employee WebView
                </h2>
                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-mono border border-slate-700">
                  Mobile View
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Mobile-first conversational flow for field staff. Upload fuel, lodging, and travel bills, inspect instant OCR extracted values, correct details, and track claim status.
              </p>
            </div>
            <div className="mt-6 flex items-center text-sm font-bold text-brand-orange group-hover:text-brand-peach gap-1.5">
              Launch Employee Experience <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Manager Portal Card */}
          <Link
            href="/manager"
            className="group relative rounded-2xl bg-slate-850/90 border-2 border-slate-700/80 p-7 hover:border-brand-peach hover:shadow-tactile transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-peach/15 text-brand-peach flex items-center justify-center mb-5 group-hover:scale-105 transition-transform border border-brand-peach/30">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white group-hover:text-brand-peach transition-colors">
                  Manager Operations
                </h2>
                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-mono border border-slate-700">
                  Finance Dashboard
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Operations dashboard with 50+ pre-seeded claims. Filter by risk severity, compare duplicate receipts side-by-side, inspect policy flags, and approve or reject with audit notes.
              </p>
            </div>
            <div className="mt-6 flex items-center text-sm font-bold text-brand-peach group-hover:text-white gap-1.5">
              Launch Manager Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Feature Matrix Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 max-w-4xl mx-auto w-full text-left">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
            <CheckCircle2 className="w-5 h-5 text-brand-orange mb-2" />
            <h4 className="text-sm font-bold text-slate-200">AI Assists. Humans Decide.</h4>
            <p className="text-xs text-slate-400 mt-1">Never auto-rejects without human manager authorization.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
            <AlertTriangle className="w-5 h-5 text-brand-peach mb-2" />
            <h4 className="text-sm font-bold text-slate-200">Perceptual Hashing</h4>
            <p className="text-xs text-slate-400 mt-1">Detects re-photographed and cropped duplicate bills.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
            <FileText className="w-5 h-5 text-sky-400 mb-2" />
            <h4 className="text-sm font-bold text-slate-200">GSTIN Validation</h4>
            <p className="text-xs text-slate-400 mt-1">State-code format and ITC tax deduction compliance checks.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
            <Zap className="w-5 h-5 text-amber-400 mb-2" />
            <h4 className="text-sm font-bold text-slate-200">WhatsApp-Decoupled</h4>
            <p className="text-xs text-slate-400 mt-1">Agnostic channel architecture ready for Meta Cloud API.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 font-medium">
        ClaimGuard India MVP &bull; Built with Next.js, Supabase, and AWS Cloud Architecture &bull; 2026
      </footer>
    </main>
  );
}
