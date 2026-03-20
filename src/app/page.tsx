"use client";

import { useState } from "react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTABanner />
      <FAQ />
      <Footer />
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">CP</div>
          <span className="font-bold text-xl tracking-tight text-white">ClientPulse</span>
        </a>
        <div className="hidden sm:flex items-center gap-8 text-sm text-slate-400 font-medium">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <a href="#faq" className="hover:text-white transition">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" className="text-sm text-slate-400 hover:text-white font-medium transition">Log in</a>
          <a href="/signup" className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-400 transition shadow-sm">
            Start Free Trial
          </a>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────
function DashboardMockup() {
  return (
    <div className="relative w-full max-w-3xl mx-auto mt-14 rounded-2xl shadow-2xl shadow-black/40 border border-white/10 overflow-hidden bg-white">
      <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 mx-4 bg-white rounded-md px-3 py-1 text-xs text-gray-400 border border-gray-200 text-center">
          app.clientpulse.io/dashboard
        </div>
      </div>
      <div className="p-6 bg-gray-50">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "New Leads", value: "12", color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Follow-ups Sent", value: "34", color: "text-green-600", bg: "bg-green-50" },
            { label: "Awaiting Reply", value: "5", color: "text-orange-500", bg: "bg-orange-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Recent Leads</span>
            <span className="text-xs text-blue-600 font-medium">View all</span>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { name: "Sarah Johnson", service: "House Cleaning", status: "Follow-up sent", dot: "bg-green-400" },
              { name: "Mike Torres", service: "Plumbing Repair", status: "New lead", dot: "bg-blue-400" },
              { name: "Emily Chen", service: "Tax Consulting", status: "Responded", dot: "bg-purple-400" },
              { name: "David Park", service: "Lawn Care", status: "Follow-up sent", dot: "bg-green-400" },
            ].map((lead) => (
              <div key={lead.name} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                    {lead.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{lead.name}</div>
                    <div className="text-xs text-gray-400">{lead.service}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${lead.dot}`} />
                  <span className="text-xs text-gray-500">{lead.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-slate-900">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.25),transparent)] pointer-events-none" />
      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/15 text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-blue-500/30">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
          Built for service businesses
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-6 text-white">
          Never lose a client to
          <br />
          <span className="text-blue-400">slow follow-up</span> again
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          ClientPulse captures every lead and sends personalized follow-ups automatically.
          Set it up in 5 minutes. No CRM experience needed.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="/signup" className="w-full sm:w-auto bg-white text-slate-900 px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-blue-50 transition shadow-xl shadow-black/20">
            Start Free Trial →
          </a>
          <a href="#features" className="w-full sm:w-auto text-slate-300 px-8 py-3.5 rounded-xl text-base font-medium hover:text-white hover:bg-white/10 transition border border-white/20">
            See how it works
          </a>
        </div>
        <p className="mt-4 text-sm text-slate-500">7-day free trial · Card required to start</p>
        <DashboardMockup />
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────
const featureIcons: Record<string, React.ReactNode> = {
  intake: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>),
  followup: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>),
  dashboard: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>),
  security: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>),
  setup: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>),
  pricing: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
};

function Features() {
  const features = [
    { iconKey: "intake",    title: "Smart Intake Forms",  topBorder: "border-t-blue-500",    iconColor: "text-blue-400 bg-blue-500/10",   desc: "Customizable forms that capture exactly what you need. Embed on your website or share a link — no coding required." },
    { iconKey: "followup",  title: "Auto Follow-Ups",     topBorder: "border-t-violet-500",  iconColor: "text-violet-400 bg-violet-500/10", desc: "Set up email sequences that go out automatically. Day 1, Day 3, Day 7 — you choose the timing and message." },
    { iconKey: "dashboard", title: "Simple Dashboard",    topBorder: "border-t-emerald-500", iconColor: "text-emerald-400 bg-emerald-500/10", desc: "See all your leads in one place. Track who's been contacted, who responded, and who needs attention." },
    { iconKey: "security",  title: "Enterprise Security", topBorder: "border-t-orange-500",  iconColor: "text-orange-400 bg-orange-500/10",  desc: "AES-256 encryption, OWASP-compliant, GDPR ready. Your client data is protected to bank-grade standards." },
    { iconKey: "setup",     title: "5-Minute Setup",      topBorder: "border-t-rose-500",    iconColor: "text-rose-400 bg-rose-500/10",     desc: "No IT team needed. Sign up, customize your form, share the link. You're live in minutes." },
    { iconKey: "pricing",   title: "Affordable Pricing",  topBorder: "border-t-teal-500",    iconColor: "text-teal-400 bg-teal-500/10",    desc: "One simple price. No per-contact fees, no surprise charges. Cancel anytime — no questions asked." },
  ];

  return (
    <section id="features" className="py-24 bg-slate-950">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Everything you need to convert leads</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">Stop losing clients to forgotten follow-ups. ClientPulse handles it all.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.iconKey} className={`bg-slate-800/50 p-7 rounded-2xl border border-slate-700/50 border-t-4 ${f.topBorder} hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-200`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${f.iconColor}`}>
                {featureIcons[f.iconKey]}
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ──────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { num: "1", title: "Create your intake form", desc: "Choose what info you need from clients — name, email, phone, service type. Fully customizable in minutes.", icon: (<svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>) },
    { num: "2", title: "Share the link", desc: "Embed on your website, share on social media, or text it to prospects. Works on any device.", icon: (<svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>) },
    { num: "3", title: "Leads come in automatically", desc: "Every submission lands in your dashboard instantly. You get notified the moment someone fills out your form.", icon: (<svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>) },
    { num: "4", title: "Follow-ups go out on autopilot", desc: "Personalized emails send at the intervals you choose. Clients feel cared for without you lifting a finger.", icon: (<svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>) },
  ];

  return (
    <section className="py-24 bg-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How it works</h2>
          <p className="text-slate-400 text-lg">Up and running in under 5 minutes.</p>
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-blue-500/20 hidden sm:block" />
          <div className="space-y-6">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-6 items-start relative">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0 z-10 shadow-lg shadow-blue-500/20">
                  {s.num}
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 flex-1 flex items-start justify-between gap-4 hover:bg-slate-800 hover:border-blue-500/30 transition">
                  <div>
                    <h3 className="font-semibold text-lg mb-1.5 text-white">{s.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">{s.desc}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    {s.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────
function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(plan: string) {
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Something went wrong. Please try again.");
    } catch {
      alert("Something went wrong. Please try again.");
    }
    setLoading(null);
  }

  return (
    <section id="pricing" className="py-24 bg-slate-950">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Simple, honest pricing</h2>
          <p className="text-slate-400 text-lg">No hidden fees. No contracts. Cancel anytime.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto items-stretch">

          {/* Starter */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8 flex flex-col hover:border-slate-600 hover:bg-slate-800 transition">
            <h3 className="font-bold text-xl mb-1 text-white">Starter</h3>
            <p className="text-slate-400 text-sm mb-6">Perfect for solo service providers.</p>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-bold text-white">$39</span>
              <span className="text-slate-500 text-lg">/mo</span>
            </div>
            <ul className="space-y-3.5 mb-8 text-sm text-slate-300 flex-1">
              {["Up to 50 clients", "Unlimited intake forms", "3-step follow-up sequences", "Client dashboard", "Email notifications", "Lead tracking dashboard"].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={() => handleCheckout("starter")} disabled={loading === "starter"}
              className="w-full bg-white text-slate-900 py-3 rounded-xl font-semibold hover:bg-blue-50 transition disabled:opacity-50 text-sm mt-auto">
              {loading === "starter" ? "Loading..." : "Get Started"}
            </button>
          </div>

          {/* Pro */}
          <div className="bg-blue-600 rounded-2xl p-8 relative text-white shadow-xl shadow-blue-900/40 flex flex-col">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white text-blue-600 text-xs font-bold px-4 py-1.5 rounded-full shadow-sm whitespace-nowrap">
              MOST POPULAR
            </div>
            <h3 className="font-bold text-xl mb-1">Pro</h3>
            <p className="text-blue-200 text-sm mb-6">For growing service businesses.</p>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-bold">$79</span>
              <span className="text-blue-300 text-lg">/mo</span>
            </div>
            <ul className="space-y-3.5 mb-8 text-sm text-blue-100 flex-1">
              {["Up to 500 clients", "Everything in Starter", "Unlimited follow-up sequences", "SMS follow-ups", "Custom branding", "Priority support"].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={() => handleCheckout("pro")} disabled={loading === "pro"}
              className="w-full bg-white text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition disabled:opacity-50 text-sm mt-auto">
              {loading === "pro" ? "Loading..." : "Get Started"}
            </button>
          </div>

        </div>
        <p className="text-center text-sm text-slate-500 mt-8">7-day free trial · Card required to start</p>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="py-20 bg-blue-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_120%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to stop losing leads?</h2>
        <p className="text-blue-200 text-lg mb-10 leading-relaxed">Set up in 5 minutes. Your next client is already out there — make sure you follow up.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="/signup" className="w-full sm:w-auto bg-white text-blue-600 px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-blue-50 transition shadow-lg">
            Start Free Trial →
          </a>
          <a href="#pricing" className="w-full sm:w-auto text-blue-200 px-8 py-3.5 rounded-xl text-base font-medium hover:text-white hover:bg-white/10 transition border border-blue-400/50">
            View pricing
          </a>
        </div>
        <p className="mt-5 text-sm text-blue-300">7-day free trial · Cancel anytime</p>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  const faqs = [
    { q: "How long does setup take?", a: "About 5 minutes. Sign up, customize your form, and share the link. No technical skills needed." },
    { q: "Can I try it before paying?", a: "Yes! We offer a 7-day free trial with full access to all features. No credit card required to start." },
    { q: "Is my client data secure?", a: "Absolutely. We use AES-256 encryption, follow OWASP security standards, and are GDPR compliant. Your data is protected to enterprise standards." },
    { q: "Can I cancel anytime?", a: "Yes. No contracts, no cancellation fees. Cancel your subscription at any time directly from your dashboard." },
    { q: "Do you offer refunds?", a: "We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund — no questions asked." },
    { q: "What kinds of businesses use ClientPulse?", a: "Plumbers, electricians, cleaners, consultants, contractors, therapists, tutors — any service business that takes client inquiries." },
  ];

  return (
    <section id="faq" className="py-24 bg-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-5 gap-16 items-start">
          <div className="lg:col-span-2 lg:sticky lg:top-28">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium mb-6 border border-blue-500/30">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
              FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">Got questions?<br />We've got answers.</h2>
            <p className="text-slate-400 leading-relaxed mb-8">Everything you need to know about ClientPulse. Can't find what you're looking for?</p>
            <a href="mailto:hello@clientpulse.io" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 rounded-xl text-sm font-medium transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email us
            </a>
          </div>
          <div className="lg:col-span-3 space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className={`rounded-2xl border transition-all duration-200 overflow-hidden ${open === i ? "bg-white/10 border-blue-400/50" : "bg-white/5 border-white/10 hover:border-white/20"}`}>
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full px-6 py-5 flex justify-between items-center text-left gap-4">
                  <span className={`font-semibold text-base transition-colors ${open === i ? "text-white" : "text-slate-300"}`}>{f.q}</span>
                  <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 text-sm font-bold ${open === i ? "bg-blue-500 text-white rotate-45" : "bg-white/10 text-slate-400"}`}>+</span>
                </button>
                {open === i && <div className="px-6 pb-5 text-slate-300 text-sm leading-relaxed border-t border-white/10 pt-4">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-500 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-5 gap-10 pb-12 border-b border-white/5">
          <div className="sm:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">CP</div>
              <span className="font-bold text-lg text-white">ClientPulse</span>
            </a>
            <p className="text-sm leading-relaxed mb-6">Client intake and follow-up automation for service businesses. Never lose a lead again.</p>
            <a href="/signup" className="inline-flex items-center gap-2 bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-400 transition">
              Start Free Trial →
            </a>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#features" className="hover:text-white transition">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
              <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Get Started</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="/signup" className="hover:text-white transition">Sign Up</a></li>
              <li><a href="/login" className="hover:text-white transition">Log In</a></li>
              <li><a href="/intake" className="hover:text-white transition">Intake Form</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="/terms" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="/privacy" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="mailto:hello@clientpulse.io" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs">&copy; {new Date().getFullYear()} ClientPulse. All rights reserved.</p>
          <p className="text-xs">Early access · <a href="/signup" className="text-blue-400 hover:text-blue-300 transition">Join today</a></p>
        </div>
      </div>
    </footer>
  );
}
