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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">CP</div>
            <span className="font-bold text-xl">ClientPulse</span>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded ml-2 text-gray-500">Admin</span>
          </div>
          <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-900">Log out</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-gray-600 text-sm">Manage your client submissions and follow-ups.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Leads" value={submissions.length} />
          <StatCard label="New" value={submissions.filter(s => s.status === "new").length} />
          <StatCard label="Follow-ups Sent" value={submissions.reduce((a, s) => a + s.followups_sent, 0)} />
          <StatCard label="Follow-ups Pending" value={submissions.reduce((a, s) => a + s.followup_count - s.followups_sent, 0)} />
        </div>

        {/* Submissions Table */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">No submissions yet.</p>
            <p className="text-sm text-gray-400">Share your intake form link to start capturing leads.</p>
            <div className="mt-6 bg-gray-50 rounded-lg p-4 inline-block">
              <code className="text-sm text-blue-600">
                {typeof window !== "undefined" ? window.location.origin : ""}/intake?business=YOUR_ID
              </code>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Client</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Service</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Follow-ups</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {submissions.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{s.client_name}</td>
                      <td className="px-4 py-3 text-gray-600">{s.client_email}</td>
                      <td className="px-4 py-3 text-gray-600">{s.service_requested || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.status === "new" ? "bg-blue-50 text-blue-700" :
                          s.status === "contacted" ? "bg-green-50 text-green-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>{s.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{s.followups_sent}/{s.followup_count}</td>
                      <td className="px-4 py-3 text-gray-400">{new Date(s.created_at).toLocaleDateString()}</td>
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
