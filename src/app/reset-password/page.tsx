"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Reset failed. Please try again."); return; }
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="bg-slate-800 p-6 rounded-2xl border border-red-500/30 text-center">
        <p className="text-red-400 font-medium mb-2">Invalid reset link</p>
        <p className="text-slate-400 text-sm">This link is missing a token. Please request a new password reset.</p>
        <a href="/forgot-password" className="inline-block mt-4 text-blue-400 hover:text-blue-300 text-sm transition">Request new link</a>
      </div>
    );
  }

  if (done) {
    return (
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center">
        <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-white font-semibold mb-2">Password updated!</p>
        <p className="text-slate-400 text-sm">Redirecting you to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
      {error && <div className="bg-red-500/10 text-red-400 border border-red-500/20 text-sm p-3 rounded-lg">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">New password</label>
        <input
          type="password" required value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder="Min 10 chars, upper + lower + number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm new password</label>
        <input
          type="password" required value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder="Re-enter your new password"
        />
      </div>

      <button
        type="submit" disabled={loading}
        className="w-full bg-blue-500 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-400 transition disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">CP</div>
            <span className="font-bold text-xl text-white">ClientPulse</span>
          </a>
          <h1 className="text-2xl font-bold text-white">Set new password</h1>
          <p className="text-slate-400 text-sm mt-1">Choose a strong password for your account.</p>
        </div>
        <Suspense fallback={<div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 text-slate-400 text-sm text-center">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
        <p className="text-center text-sm text-slate-500 mt-4">
          <a href="/login" className="text-blue-400 hover:text-blue-300 transition">&larr; Back to login</a>
        </p>
      </div>
    </div>
  );
}
