"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function IntakeFormInner() {
  const params = useSearchParams();
  const businessId = params.get("business") || "default";

  const [form, setForm] = useState({ clientName: "", clientEmail: "", clientPhone: "", serviceRequested: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-2xl">&#10003;</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Thank you!</h1>
          <p className="text-gray-600">Your information has been received. We&apos;ll be in touch shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Get in touch</h1>
          <p className="text-gray-600 text-sm">Fill out the form below and we&apos;ll get back to you within 24 hours.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

          <div>
            <label className="block text-sm font-medium mb-1">Your name *</label>
            <input type="text" required value={form.clientName} onChange={(e) => update("clientName", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Smith" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email address *</label>
            <input type="email" required value={form.clientEmail} onChange={(e) => update("clientEmail", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="john@example.com" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone number</label>
            <input type="tel" value={form.clientPhone} onChange={(e) => update("clientPhone", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="(555) 123-4567" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Service you&apos;re interested in</label>
            <input type="text" value={form.serviceRequested} onChange={(e) => update("serviceRequested", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Kitchen remodel, Weekly cleaning" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea rows={4} value={form.message} onChange={(e) => update("message", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Tell us more about what you need..." />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? "Submitting..." : "Submit"}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Your information is encrypted and protected. See our <a href="/privacy" className="underline">Privacy Policy</a>.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function IntakePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <IntakeFormInner />
    </Suspense>
  );
}
