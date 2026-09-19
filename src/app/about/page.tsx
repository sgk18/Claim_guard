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
    "ClaimGuard is a pre-payment verification layer for expense claims from India's field workforces.",
};

const steps = [
  {
    icon: Smartphone,
    title: "Send a receipt",
    text: "Field staff photograph a fuel, toll, travel or per-diem bill and send it on WhatsApp, with an optional caption or voice note. No new app to install.",
  },
  {
    icon: ScanLine,
    title: "Extract and screen",
    text: "Vendor, amount, date, GSTIN and category are read from the image, then checked against duplicates, policy limits, the employee's trip and GST rules.",
  },
  {
    icon: Gauge,
    title: "Explainable risk score",
    text: "The manager gets a claim card with a risk score and the specific reasons behind it, not a black-box number.",
  },
  {
    icon: BadgeCheck,
    title: "Approve or reject",
    text: "One reply decides the claim. Approved claims are queued for payout, written to an immutable audit record and flagged for GST Input Tax Credit recovery where eligible.",
  },
];

const differentiators = [
  {
    icon: FileText,
    title: "GSTIN validation",
    text: "State-code and checksum validation of the GSTIN printed on each bill.",
  },
  {
    icon: Receipt,
    title: "GST ITC recovery",
    text: "Eligible input tax credit is identified per claim and staged for filing.",
  },
  {
    icon: BookOpen,
    title: "Tally and Zoho Books",
    text: "Reconciliation exports built for the accounting stack Indian finance teams already use.",
  },
  {
    icon: MapPin,
    title: "Route cross-checking",
    text: "Claims are compared against trip manifests so a fuel bill has to match the journey.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen ambient-mesh-bg text-slate-900 flex flex-col selection:bg-orange-100 selection:text-orange-900">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            Claim<span className="text-brand-orange">Guard</span>
          </span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-brand-orange transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back home
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 lg:py-20 w-full flex-1">
        {/* Intro */}
        <section className="text-center">
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-orange-800 text-xs font-semibold shadow-sm">
            About ClaimGuard
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
            Flag it <span className="text-brand-orange">before</span> you pay it.
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            ClaimGuard is a verification layer that sits between an expense
            submission and the payout. It gives finance teams that run large
            field workforces an informed, fast and auditable way to decide on
            every claim.
          </p>
        </section>

        {/* Problem */}
        <section className="mt-16 rounded-2xl bg-white/90 border border-slate-200/90 p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900">The problem</h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Logistics fleets, FMCG field sales teams and pharma representatives
            file fuel, toll, travel and per-diem claims in high volume and at
            low value. Verification usually happens after the claim is paid: a
            manager reviews it days later, and problems only surface in a
            periodic audit, when the money has already gone.
          </p>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Enterprise expense suites are built for large corporates and ask
            employees to learn a separate app. Spreadsheets and WhatsApp groups,
            the default for many mid-sized Indian operators, have no
            verification at all. ClaimGuard is built for the companies in
            between.
          </p>
        </section>

        {/* How it works */}
        <section className="mt-16">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center">
            How it works
          </h2>
          <div className="grid sm:grid-cols-2 gap-5 mt-8">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="rounded-2xl bg-white/90 border border-slate-200/90 p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center border border-orange-200/60">
                    <step.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900">
                    {i + 1}. {step.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Principle */}
        <section className="mt-16 rounded-2xl bg-slate-900 text-white p-8 text-center shadow-lg">
          <h2 className="text-2xl font-extrabold">AI assists. Humans decide.</h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            ClaimGuard never auto-rejects an employee's expense claim. The AI
            surfaces signals and explains them. The manager makes the call.
          </p>
        </section>

        {/* Differentiators */}
        <section className="mt-16">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center">
            Built for India
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 text-center max-w-2xl mx-auto">
            General expense tools cover the basics. ClaimGuard goes deep on the
            compliance and accounting details of Indian field operations.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {differentiators.map((d) => (
              <div
                key={d.title}
                className="p-5 rounded-xl bg-white/80 border border-slate-200/80"
              >
                <d.icon className="w-5 h-5 text-brand-orange mb-2" />
                <h3 className="text-sm font-bold text-slate-900">{d.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {d.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Who it's for */}
        <section className="mt-16 rounded-2xl bg-white/90 border border-slate-200/90 p-8 shadow-sm flex gap-5 items-start">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center border border-orange-200/60">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Who it's for</h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              Indian companies with roughly 50 to 300 field agents in logistics
              and freight, FMCG field sales, or pharmaceutical representation.
              They are too large to audit every claim by hand and too
              cost-sensitive for an enterprise expense suite.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 text-center">
          <h2 className="text-2xl font-extrabold text-slate-900">See it in action</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/employee"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-500 text-white text-sm font-bold shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-colors"
            >
              Employee WebView <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/manager"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm font-bold hover:border-brand-orange/60 transition-colors"
            >
              Manager Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>

      <footer className="border-t border-slate-200/80 bg-white/60 py-6 text-center text-xs text-slate-500 font-medium">
        ClaimGuard India MVP &bull; 2026
      </footer>
    </main>
  );
}
