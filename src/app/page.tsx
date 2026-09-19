import Link from "next/link";
import { ShieldCheck, Smartphone, LayoutDashboard, Zap, AlertTriangle, FileText, CheckCircle2, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen ambient-mesh-bg text-slate-900 flex flex-col justify-between selection:bg-orange-100 selection:text-orange-900">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              Claim<span className="text-brand-orange">Guard</span>
            </span>
            <span className="ml-2 text-[11px] font-bold px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200">
              MVP v1.0
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <Link href="/about" className="font-semibold text-slate-700 hover:text-brand-orange transition-colors">
            About
          </Link>
          <span className="hidden sm:inline bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-md font-medium">
            India-First Expense Architecture
          </span>
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md font-semibold">
            Mock Mode: Active
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-20 text-center flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-orange-800 text-xs font-semibold mb-6 mx-auto shadow-sm">
          <Zap className="w-3.5 h-3.5 text-brand-orange" />
          Real-time expense verification and automated fraud prevention
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15]">
          Flag it <span className="text-brand-orange underline decoration-brand-orange/30 underline-offset-8">before</span> you pay it.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Zero-installation mobile expense submissions for field workforces, backed by instant OCR, perceptual duplicate detection, and explainable AI risk scoring.
        </p>

        {/* Dual Portal Launcher Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto w-full text-left">
          {/* Employee Portal Card */}
          <Link
            href="/employee"
            className="group relative rounded-2xl bg-white/90 border border-slate-200/90 p-8 shadow-sm hover:shadow-xl hover:border-brand-orange/60 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center mb-5 group-hover:scale-105 transition-transform border border-orange-200/60 shadow-inner">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-slate-900 group-hover:text-brand-orange transition-colors">
                  Employee WebView
                </h2>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-mono border border-slate-200">
                  Mobile View
                </span>
              </div>
              <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                Mobile-first conversational flow for field staff. Upload fuel, lodging, and travel bills, inspect instant OCR extracted values, correct details, and track claim status.
              </p>
            </div>
            <div className="mt-6 flex items-center text-sm font-bold text-brand-orange gap-1.5">
              Launch Employee Experience <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Manager Portal Card */}
          <Link
            href="/manager"
            className="group relative rounded-2xl bg-white/90 border border-slate-200/90 p-8 shadow-sm hover:shadow-xl hover:border-brand-orange/60 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform border border-slate-200 shadow-inner">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-slate-900 group-hover:text-brand-orange transition-colors">
                  Manager Operations
                </h2>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-mono border border-slate-200">
                  Finance Dashboard
                </span>
              </div>
              <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                Operations dashboard with 50+ pre-seeded claims. Filter by risk severity, compare duplicate receipts side-by-side, inspect policy flags, and approve or reject with audit notes.
              </p>
            </div>
            <div className="mt-6 flex items-center text-sm font-bold text-brand-orange gap-1.5">
              Launch Manager Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Feature Matrix Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto w-full text-left">
          <div className="p-4 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-900">AI Assists. Humans Decide.</h4>
            <p className="text-xs text-slate-500 mt-1">Never auto-rejects without human manager authorization.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-brand-orange mb-2" />
            <h4 className="text-sm font-bold text-slate-900">Perceptual Hashing</h4>
            <p className="text-xs text-slate-500 mt-1">Detects re-photographed and cropped duplicate bills.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
            <FileText className="w-5 h-5 text-sky-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-900">GSTIN Validation</h4>
            <p className="text-xs text-slate-500 mt-1">State-code format and ITC tax deduction compliance checks.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
            <Zap className="w-5 h-5 text-amber-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-900">WhatsApp-Decoupled</h4>
            <p className="text-xs text-slate-500 mt-1">Agnostic channel architecture ready for Meta Cloud API.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/60 py-6 text-center text-xs text-slate-500 font-medium">
        ClaimGuard India MVP &bull; Built with Next.js, Supabase, and AWS Cloud Architecture &bull; 2026
      </footer>
    </main>
  );
}
