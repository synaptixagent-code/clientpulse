"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Branding {
  company_name?: string;
  brand_color?: string;
}

function IntakeFormInner() {
  const params = useSearchParams();
  // Support both ?businessId= (canonical) and ?business= (legacy)
  const businessId = params.get("businessId") || params.get("business") || "default";

  const [form, setForm] = useState({ clientName: "", clientEmail: "", clientPhone: "", serviceRequested: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState<Branding>({});

  useEffect(() => {
    if (businessId && businessId !== "default") {
      fetch(`/api/intake/branding?businessId=${encodeURIComponent(businessId)}`)
        .then(r => r.ok ? r.json() : {})
        .then(data => setBranding(data))
        .catch(() => {});
    }
  }, [businessId]);

  const color = branding.brand_color || "#3b82f6";
  const companyName = branding.company_name || "ClientPulse";
  const initials = companyName.split(" ").map(w => w[0] || "").join("").slice(0, 2).toUpperCase() || "CP";

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, businessId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Submission failed");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
            <svg className="w-8 h-8" fill="none" stroke={color} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Thank you!</h1>
          <p className="text-slate-400">Your information has been received. We&apos;ll be in touch shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: color }}
            >
              {initials}
            </div>
            <span className="font-bold text-lg text-white">{companyName}</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Get in touch</h1>
          <p className="text-slate-400 text-sm">Fill out the form below and we&apos;ll get back to you within 24 hours.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
          {error && <div className="bg-red-500/10 text-red-400 border border-red-500/20 text-sm p-3 rounded-lg">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Your name *</label>
            <input type="text" required value={form.clientName} onChange={(e) => update("clientName", e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition"
              style={{ "--tw-ring-color": color } as React.CSSProperties}
              placeholder="John Smith" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address *</label>
            <input type="email" required value={form.clientEmail} onChange={(e) => update("clientEmail", e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition"
              placeholder="john@example.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone number</label>
            <input type="tel" value={form.clientPhone} onChange={(e) => update("clientPhone", e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition"
              placeholder="(555) 123-4567" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Service you&apos;re interested in</label>
            <input type="text" value={form.serviceRequested} onChange={(e) => update("serviceRequested", e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition"
              placeholder="e.g. Kitchen remodel, Weekly cleaning" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Message</label>
            <textarea rows={4} value={form.message} onChange={(e) => update("message", e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition resize-none"
              placeholder="Tell us more about what you need..." />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
            style={{ backgroundColor: color }}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>

          <p className="text-xs text-slate-500 text-center">
            Your information is encrypted and protected. See our{" "}
            <a href="/privacy" className="text-slate-400 hover:text-white underline transition">Privacy Policy</a>.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function IntakePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-900" />}>
      <IntakeFormInner />
    </Suspense>
  );
}
