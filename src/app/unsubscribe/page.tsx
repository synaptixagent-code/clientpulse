"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function UnsubscribeForm() {
  const params = useSearchParams();
  const id = params.get("id") || "";
  const token = params.get("token") || "";
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleUnsubscribe() {
    setStatus("loading");
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, token }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (!id || !token) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Invalid Link</h1>
        <p className="text-slate-400">This unsubscribe link is not valid.</p>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Unsubscribed</h1>
        <p className="text-slate-400 mb-2">You have been successfully unsubscribed.</p>
        <p className="text-slate-500 text-sm">You will no longer receive follow-up emails for this inquiry.</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold text-white mb-4">Unsubscribe</h1>
      <p className="text-slate-400 mb-8">Click below to stop receiving follow-up emails for this inquiry.</p>
      {status === "error" && (
        <p className="text-red-400 text-sm mb-4">Something went wrong. Please try again.</p>
      )}
      <button
        onClick={handleUnsubscribe}
        disabled={status === "loading"}
        className="bg-white text-slate-900 px-8 py-3 rounded-xl font-semibold hover:bg-slate-100 transition disabled:opacity-50"
      >
        {status === "loading" ? "Processing..." : "Unsubscribe"}
      </button>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <Suspense fallback={<p className="text-slate-400">Loading...</p>}>
        <UnsubscribeForm />
      </Suspense>
    </div>
  );
}
