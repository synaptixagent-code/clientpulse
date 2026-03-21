"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Followup {
  id: string;
  subject: string;
  status: string;
  scheduled_at: string;
  sent_at: string | null;
}

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
  followups?: Followup[];
}

interface PlanInfo {
  name: string;
  limit: number;
  used: number;
  intakeUrl: string;
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [brandingConfigured, setBrandingConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/submissions")
      .then((res) => {
        if (res.status === 401) { router.push("/login"); return null; }
        if (res.status === 402) { router.push("/upgrade"); return null; }
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        if (data) {
          setSubmissions(data.submissions);
          setPlan(data.plan ?? null);
          setBrandingConfigured(data.brandingConfigured ?? false);
        }
      })
      .catch(() => setError("Failed to load submissions"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleBillingPortal() {
    setBillingLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Could not open billing portal.');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setBillingLoading(false);
    }
  }

  function copyIntakeUrl() {
    if (!plan) return;
    navigator.clipboard.writeText(plan.intakeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      }
    } finally {
      setUpdating(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const statusColor = (s: string) =>
    s === "new" ? "bg-blue-500/15 text-blue-300" :
    s === "contacted" ? "bg-emerald-500/15 text-emerald-300" :
    "bg-slate-700 text-slate-400";

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-900/95 backdrop-blur border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">CP</div>
            <span className="font-bold text-lg text-white">ClientPulse</span>
            <span className="text-xs bg-white/10 text-slate-400 px-2 py-0.5 rounded ml-1">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/admin/settings" className="text-sm text-slate-400 hover:text-white transition">Settings</a>
            <button onClick={handleBillingPortal} disabled={billingLoading} className="text-sm text-slate-400 hover:text-white transition disabled:opacity-50">
              {billingLoading ? "Loading..." : "Billing"}
            </button>
            <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-white transition">Log out</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-slate-400 text-sm">Manage your client submissions and follow-ups.</p>
        </div>

        {/* Onboarding Checklist */}
        {plan && (!brandingConfigured || submissions.length === 0) && (
          <div className="bg-gradient-to-r from-blue-600/20 to-violet-600/20 rounded-2xl border border-blue-500/30 p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-1">Get started with ClientPulse</h2>
            <p className="text-sm text-slate-400 mb-5">Complete these steps to start capturing leads.</p>
            <div className="space-y-3">
              <OnboardingStep
                done={true}
                label="Create your account"
                description="You're in! Your account is ready to go."
              />
              <OnboardingStep
                done={brandingConfigured}
                label="Set up your branding"
                description="Add your company name and colors so your forms look professional."
                action={!brandingConfigured ? { label: "Set up branding", href: "/admin/settings" } : undefined}
              />
              <OnboardingStep
                done={false}
                label="Share your intake form"
                description="Copy your unique link and add it to your website or share it with clients."
                action={{ label: copied ? "Copied!" : "Copy intake link", onClick: copyIntakeUrl }}
              />
              <OnboardingStep
                done={submissions.length > 0}
                label="Get your first lead"
                description={submissions.length > 0 ? `You have ${submissions.length} lead${submissions.length > 1 ? "s" : ""}!` : "Once you share your link, leads will appear here automatically."}
              />
            </div>
          </div>
        )}

        {/* Intake URL Banner */}
        {plan && (brandingConfigured && submissions.length > 0) && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Your Client Intake Form</p>
              <code className="text-sm text-blue-400 break-all">{plan.intakeUrl}</code>
              <p className="text-xs text-slate-500 mt-1.5">Share this link with clients to capture leads automatically.</p>
            </div>
            <button
              onClick={copyIntakeUrl}
              className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white text-sm px-5 py-2.5 rounded-xl transition font-semibold"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Leads"
            value={`${submissions.length}${plan ? ` / ${plan.limit}` : ""}`}
            color="text-white"
          />
          <StatCard label="New" value={submissions.filter(s => s.status === "new").length} color="text-blue-400" />
          <StatCard label="Follow-ups Sent" value={submissions.reduce((a, s) => a + s.followups_sent, 0)} color="text-emerald-400" />
          <StatCard label="Follow-ups Pending" value={submissions.reduce((a, s) => a + (s.followup_count - s.followups_sent), 0)} color="text-orange-400" />
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-400">{error}</div>
        ) : submissions.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <p className="text-slate-400 mb-2">No submissions yet.</p>
            <p className="text-sm text-slate-500 mb-6">Share your intake form link to start capturing leads.</p>
            {plan && (
              <div className="bg-slate-900 rounded-xl p-4 inline-flex items-center gap-3 border border-slate-700">
                <code className="text-sm text-blue-400 break-all">{plan.intakeUrl}</code>
                <button onClick={copyIntakeUrl} className="shrink-0 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition font-medium">
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-700">
                  <tr>
                    <th className="text-left px-5 py-3.5 font-medium text-slate-400">Client</th>
                    <th className="text-left px-5 py-3.5 font-medium text-slate-400 hidden sm:table-cell">Service</th>
                    <th className="text-left px-5 py-3.5 font-medium text-slate-400">Status</th>
                    <th className="text-left px-5 py-3.5 font-medium text-slate-400 hidden md:table-cell">Follow-ups</th>
                    <th className="text-left px-5 py-3.5 font-medium text-slate-400 hidden lg:table-cell">Date</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <>
                      <tr
                        key={s.id}
                        className="border-t border-slate-700/50 hover:bg-slate-700/20 transition cursor-pointer"
                        onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium text-white">{s.client_name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{s.client_email}</div>
                        </td>
                        <td className="px-5 py-4 text-slate-400 hidden sm:table-cell">{s.service_requested || "—"}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(s.status)}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-400 hidden md:table-cell">
                          {s.followups_sent}/{s.followup_count} sent
                        </td>
                        <td className="px-5 py-4 text-slate-500 hidden lg:table-cell text-xs">
                          {new Date(s.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <svg
                            className={`w-4 h-4 text-slate-500 transition-transform ml-auto ${expanded === s.id ? "rotate-180" : ""}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {expanded === s.id && (
                        <tr key={`${s.id}-detail`} className="border-t border-slate-700/30 bg-slate-800/40">
                          <td colSpan={6} className="px-5 py-5">
                            <div className="grid sm:grid-cols-3 gap-6">

                              {/* Contact info */}
                              <div>
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Contact</h4>
                                <div className="space-y-1.5 text-sm">
                                  <div><span className="text-slate-500">Email: </span><span className="text-slate-200">{s.client_email}</span></div>
                                  {s.client_phone && <div><span className="text-slate-500">Phone: </span><span className="text-slate-200">{s.client_phone}</span></div>}
                                  <div><span className="text-slate-500">Service: </span><span className="text-slate-200">{s.service_requested || "—"}</span></div>
                                  <div><span className="text-slate-500">Date: </span><span className="text-slate-200">{new Date(s.created_at).toLocaleString()}</span></div>
                                </div>
                              </div>

                              {/* Message */}
                              <div>
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Message</h4>
                                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                  {s.message || <span className="text-slate-500 italic">No message</span>}
                                </p>
                              </div>

                              {/* Actions + Follow-ups */}
                              <div>
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Actions</h4>
                                <div className="flex flex-wrap gap-2 mb-5">
                                  {["new", "contacted", "closed"].map(st => (
                                    <button
                                      key={st}
                                      disabled={s.status === st || updating === s.id}
                                      onClick={(e) => { e.stopPropagation(); updateStatus(s.id, st); }}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-40 ${
                                        s.status === st
                                          ? statusColor(st) + " cursor-default"
                                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                      }`}
                                    >
                                      {st.charAt(0).toUpperCase() + st.slice(1)}
                                    </button>
                                  ))}
                                </div>
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Follow-ups</h4>
                                <div className="space-y-1.5">
                                  {s.followup_count === 0 ? (
                                    <p className="text-xs text-slate-500 italic">No follow-ups scheduled</p>
                                  ) : (
                                    Array.from({ length: s.followup_count }, (_, i) => i).map(i => {
                                      const isSent = i < s.followups_sent;
                                      const labels = ["Day 1", "Day 3", "Day 7", "Day 14", "Day 30"];
                                      return (
                                        <div key={i} className="flex items-center gap-2 text-xs">
                                          <div className={`w-2 h-2 rounded-full ${isSent ? "bg-emerald-400" : "bg-slate-600"}`} />
                                          <span className={isSent ? "text-emerald-300" : "text-slate-500"}>
                                            {labels[i] || `Email ${i + 1}`} — {isSent ? "sent" : "pending"}
                                          </span>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
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

function OnboardingStep({ done, label, description, action }: {
  done: boolean;
  label: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void };
}) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl transition ${done ? "bg-white/5" : "bg-white/10"}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${done ? "bg-emerald-500" : "bg-slate-600"}`}>
        {done ? (
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span className="w-2 h-2 rounded-full bg-slate-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${done ? "text-slate-400 line-through" : "text-white"}`}>{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      {action && !done && (
        action.href ? (
          <a href={action.href} className="shrink-0 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-medium transition">
            {action.label}
          </a>
        ) : (
          <button onClick={action.onClick} className="shrink-0 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-medium transition">
            {action.label}
          </button>
        )
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-5">
      <p className="text-sm text-slate-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
