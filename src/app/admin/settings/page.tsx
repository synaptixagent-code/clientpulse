"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Branding {
  company_name: string;
  reply_email: string;
  brand_color: string;
  footer_text: string;
}

export default function SettingsPage() {
  const [branding, setBranding] = useState<Branding>({
    company_name: '',
    reply_email: '',
    brand_color: '#3b82f6',
    footer_text: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/branding')
      .then(res => {
        if (res.status === 401) { router.push('/login'); return null; }
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => { if (data) setBranding(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/branding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-900/95 backdrop-blur border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">CP</div>
              <span className="font-bold text-lg text-white">ClientPulse</span>
            </a>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 text-sm">Settings</span>
          </div>
          <a href="/admin" className="text-sm text-slate-400 hover:text-white transition">← Dashboard</a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Branding Settings</h1>
          <p className="text-slate-400 text-sm">Customize how your follow-up emails appear to clients.</p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">

            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 space-y-5">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Email Identity</h2>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Company Name</label>
                <input
                  type="text"
                  value={branding.company_name}
                  onChange={e => setBranding(b => ({ ...b, company_name: e.target.value }))}
                  placeholder="e.g. Smith Consulting"
                  maxLength={100}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
                <p className="text-xs text-slate-500 mt-1">Replaces "ClientPulse" in all emails sent to your clients.</p>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Reply-To Email</label>
                <input
                  type="email"
                  value={branding.reply_email}
                  onChange={e => setBranding(b => ({ ...b, reply_email: e.target.value }))}
                  placeholder="e.g. hello@yourcompany.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
                <p className="text-xs text-slate-500 mt-1">Clients who reply to follow-up emails will reach this address.</p>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Brand Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={branding.brand_color}
                    onChange={e => setBranding(b => ({ ...b, brand_color: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.brand_color}
                    onChange={e => setBranding(b => ({ ...b, brand_color: e.target.value }))}
                    placeholder="#3b82f6"
                    maxLength={7}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Used for the email header and button color.</p>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Email Footer Text</label>
                <textarea
                  value={branding.footer_text}
                  onChange={e => setBranding(b => ({ ...b, footer_text: e.target.value }))}
                  placeholder="e.g. You received this email because you submitted an inquiry to Smith Consulting."
                  maxLength={300}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">Appears at the bottom of every follow-up email.</p>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">Email Header Preview</h2>
              <div style={{ background: branding.brand_color || '#3b82f6', borderRadius: '10px', padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>
                      {(branding.company_name || 'My Business').split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase() || 'MB'}
                    </span>
                  </div>
                  <span style={{ color: '#fff', fontSize: '16px', fontWeight: 700 }}>
                    {branding.company_name || 'My Business'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Branding'}
            </button>

          </form>
        )}
      </main>
    </div>
  );
}
