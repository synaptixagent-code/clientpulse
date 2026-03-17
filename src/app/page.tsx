"use client";

import { useState } from "react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">CP</div>
          <span className="font-bold text-xl">ClientPulse</span>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
          <a href="#features" className="hover:text-gray-900">Features</a>
          <a href="#pricing" className="hover:text-gray-900">Pricing</a>
          <a href="#faq" className="hover:text-gray-900">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" className="text-sm text-gray-600 hover:text-gray-900">Log in</a>
          <a href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Start Free Trial</a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="py-20 sm:py-32">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
          Built for service businesses
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
          Never lose a client to
          <span className="text-blue-600"> slow follow-up</span> again
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          ClientPulse captures every lead and sends personalized follow-ups automatically.
          Set it up in 5 minutes. No CRM experience needed.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/signup" className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
            Start Free Trial
          </a>
          <a href="#features" className="w-full sm:w-auto text-gray-600 px-8 py-4 rounded-xl text-lg font-medium hover:bg-gray-50 transition border border-gray-200">
            See how it works
          </a>
        </div>
        <p className="mt-4 text-sm text-gray-400">No credit card required. 14-day free trial.</p>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: "📋", title: "Smart Intake Forms", desc: "Customizable forms that capture exactly what you need. Embed on your website or share a link." },
    { icon: "🔄", title: "Auto Follow-Ups", desc: "Set up email sequences that go out automatically. Day 1, Day 3, Day 7 — you choose the timing." },
    { icon: "📊", title: "Simple Dashboard", desc: "See all your leads in one place. Track who's been contacted, who responded, who needs attention." },
    { icon: "🔒", title: "Enterprise Security", desc: "AES-256 encryption, OWASP-compliant, GDPR ready. Your client data is protected to bank-grade standards." },
    { icon: "⚡", title: "5-Minute Setup", desc: "No IT team needed. Sign up, customize your form, share the link. You're live in minutes." },
    { icon: "💳", title: "Affordable Pricing", desc: "One simple price. No per-contact fees, no surprise charges. Cancel anytime." },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Everything you need to convert leads</h2>
        <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">Stop losing clients to forgotten follow-ups. ClientPulse handles it all.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: "1", title: "Create your intake form", desc: "Choose what info you need from clients. Name, email, phone, service type — fully customizable." },
    { num: "2", title: "Share the link", desc: "Embed on your website, share on social media, or text it to prospects. Works everywhere." },
    { num: "3", title: "Leads come in automatically", desc: "Every submission lands in your dashboard. You get notified instantly." },
    { num: "4", title: "Follow-ups go out on autopilot", desc: "Personalized emails send at the intervals you choose. Clients feel cared for without you lifting a finger." },
  ];

  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">How it works</h2>
        <div className="space-y-12">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0">{s.num}</div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
                <p className="text-gray-600">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

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
    } catch {
      alert("Something went wrong. Please try again.");
    }
    setLoading(null);
  }

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Simple, honest pricing</h2>
        <p className="text-gray-600 text-center mb-16">No hidden fees. No contracts. Cancel anytime.</p>
        <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Starter */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 hover:border-blue-200 transition">
            <h3 className="font-bold text-lg mb-1">Starter</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold">$29</span>
              <span className="text-gray-500">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 text-sm text-gray-600">
              <li className="flex gap-2"><span className="text-green-500">&#10003;</span> Unlimited intake forms</li>
              <li className="flex gap-2"><span className="text-green-500">&#10003;</span> 3-step follow-up sequences</li>
              <li className="flex gap-2"><span className="text-green-500">&#10003;</span> Client dashboard</li>
              <li className="flex gap-2"><span className="text-green-500">&#10003;</span> Email notifications</li>
              <li className="flex gap-2"><span className="text-green-500">&#10003;</span> Basic analytics</li>
            </ul>
            <button
              onClick={() => handleCheckout("starter")}
              disabled={loading === "starter"}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading === "starter" ? "Loading..." : "Get Started"}
            </button>
          </div>

          {/* Pro */}
          <div className="bg-white rounded-2xl border-2 border-blue-600 p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>
            <h3 className="font-bold text-lg mb-1">Pro</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold">$79</span>
              <span className="text-gray-500">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 text-sm text-gray-600">
              <li className="flex gap-2"><span className="text-green-500">&#10003;</span> Everything in Starter</li>
              <li className="flex gap-2"><span className="text-green-500">&#10003;</span> Unlimited follow-up sequences</li>
              <li className="flex gap-2"><span className="text-green-500">&#10003;</span> SMS follow-ups</li>
              <li className="flex gap-2"><span className="text-green-500">&#10003;</span> Custom branding</li>
              <li className="flex gap-2"><span className="text-green-500">&#10003;</span> Priority support</li>
              <li className="flex gap-2"><span className="text-green-500">&#10003;</span> API access</li>
            </ul>
            <button
              onClick={() => handleCheckout("pro")}
              disabled={loading === "pro"}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading === "pro" ? "Loading..." : "Get Started"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    { q: "How long does setup take?", a: "About 5 minutes. Sign up, customize your form, and share the link. No technical skills needed." },
    { q: "Can I try it before paying?", a: "Yes! We offer a 14-day free trial with full access. No credit card required to start." },
    { q: "Is my client data secure?", a: "Absolutely. We use AES-256 encryption, follow OWASP security standards, and are GDPR compliant. Your data is protected to enterprise standards." },
    { q: "Can I cancel anytime?", a: "Yes. No contracts, no cancellation fees. You can cancel your subscription at any time from your dashboard." },
    { q: "Do you offer refunds?", a: "We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund." },
    { q: "What kinds of businesses use ClientPulse?", a: "Plumbers, electricians, cleaners, consultants, contractors, therapists, tutors — any service business that takes client inquiries." },
  ];

  return (
    <section id="faq" className="py-20">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Frequently asked questions</h2>
        <div className="space-y-6">
          {faqs.map((f, i) => (
            <details key={i} className="group border-b border-gray-200 pb-6">
              <summary className="font-medium cursor-pointer flex justify-between items-center list-none">
                {f.q}
                <span className="text-gray-400 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="mt-3 text-gray-600 text-sm leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">CP</div>
              <span className="font-bold text-lg text-white">ClientPulse</span>
            </div>
            <p className="text-sm max-w-xs">Client intake and follow-up automation for service businesses.</p>
          </div>
          <div className="flex gap-12 text-sm">
            <div>
              <h4 className="text-white font-medium mb-3">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#faq" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-gray-800 text-xs">
          &copy; {new Date().getFullYear()} ClientPulse. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
