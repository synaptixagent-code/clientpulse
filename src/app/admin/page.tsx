"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Submission {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  service_requested: string;
  message: string;
  status: string;
  created_at: string;
  followup_count: number;
  followups_sent: number;
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/submissions")
      .then((res) => {
        if (res.status === 401) { router.push("/login"); return null; }
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => { if (data) setSubmissions(data.submissions); })
      .catch(() => setError("Failed to load submissions"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-900/95 backdrop-blur border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">CP</div>
            <span className="font-bold text-lg text-white">ClientPulse</span>
            <span className="text-xs bg-white/10 text-slate-400 px-2 py-0.5 rounded ml-1">Admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-400 hover:text-white transition"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-slate-400 text-sm">Manage your client submissions and follow-ups.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Leads" value={submissions.length} color="text-white" />
          <StatCard label="New" value={submissions.filter(s => s.status === "new").length} color="text-blue-400" />
          <StatCard label="Follow-ups Sent" value={submissions.reduce((a, s) => a + s.followups_sent, 0)} color="text-emerald-400" />
          <StatCard label="Follow-ups Pending" value={submissions.reduce((a, s) => a + (s.followup_count - s.followups_sent), 0)} color="text-orange-400" />
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-400">{error}</div>
        ) : submissions.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <p className="text-slate-400 mb-2">No submissions yet.</p>
            <p className="text-sm text-slate-500 mb-6">Share your intake form link to start capturing leads.</p>
            <div className="bg-slate-900 rounded-xl p-4 inline-block border border-slate-700">
              <code className="text-sm text-blue-400">
                {typeof window !== "undefined" ? window.location.origin : "https://clientpulse.dev"}/intake?business=YOUR_ID
              </code>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-700">
                  <tr>
                    <th className="text-left px-5 py-3.5 font-medium text-slate-400">Client</th>
                    <th className="text-left px-5 py-3.5 font-medium text-slate-400">Email</th>
                    <th className="text-left px-5 py-3.5 font-medium text-slate-400">Service</th>
                    <th className="text-left px-5 py-3.5 font-medium text-slate-400">Status</th>
                    <th className="text-left px-5 py-3.5 font-medium text-slate-400">Follow-ups</th>
                    <th className="text-left px-5 py-3.5 font-medium text-slate-400">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {submissions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-700/30 transition">
                      <td className="px-5 py-3.5 font-medium text-white">{s.client_name}</td>
                      <td className="px-5 py-3.5 text-slate-300">{s.client_email}</td>
                      <td className="px-5 py-3.5 text-slate-400">{s.service_requested || "—"}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          s.status === "new" ? "bg-blue-500/15 text-blue-300" :
                          s.status === "contacted" ? "bg-emerald-500/15 text-emerald-300" :
                          "bg-slate-700 text-slate-400"
                        }`}>{s.status}</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">{s.followups_sent}/{s.followup_count}</td>
                      <td className="px-5 py-3.5 text-slate-500">{new Date(s.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-5">
      <p className="text-sm text-slate-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
