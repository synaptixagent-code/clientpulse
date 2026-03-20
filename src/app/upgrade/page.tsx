export default function UpgradePage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-orange-500/20 border border-orange-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Your free trial has ended</h1>
        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
          Your 7-day free trial is over. Upgrade to keep capturing leads and sending automated follow-ups.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-10 text-left">
          {[
            { plan: "Starter", price: "$39", desc: "Perfect for solo service providers.", features: ["Up to 50 clients", "Intake forms", "3-step follow-up sequences", "Email notifications"] },
            { plan: "Pro", price: "$79", desc: "For growing service businesses.", features: ["Up to 500 clients", "Unlimited follow-up sequences", "SMS follow-ups", "Priority support"], popular: true },
          ].map((p) => (
            <div key={p.plan} className={`rounded-2xl p-6 border ${p.popular ? 'bg-blue-600 border-blue-500' : 'bg-slate-800 border-slate-700'}`}>
              {p.popular && <div className="text-xs font-bold text-blue-200 mb-2 uppercase tracking-wide">Most Popular</div>}
              <h3 className="font-bold text-lg text-white mb-1">{p.plan}</h3>
              <p className={`text-sm mb-4 ${p.popular ? 'text-blue-200' : 'text-slate-400'}`}>{p.desc}</p>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-3xl font-bold text-white">{p.price}</span>
                <span className={`text-sm ${p.popular ? 'text-blue-300' : 'text-slate-500'}`}>/mo</span>
              </div>
              <ul className={`space-y-2 text-sm mb-6 ${p.popular ? 'text-blue-100' : 'text-slate-300'}`}>
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className={`w-4 h-4 shrink-0 ${p.popular ? 'text-white' : 'text-emerald-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={`/#pricing`}
                className={`block w-full text-center py-2.5 rounded-xl font-semibold text-sm transition ${p.popular ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-blue-500 text-white hover:bg-blue-400'}`}
              >
                Upgrade to {p.plan}
              </a>
            </div>
          ))}
        </div>

        <p className="text-slate-500 text-sm">
          Questions?{" "}
          <a href="mailto:support@clientpulse.dev" className="text-blue-400 hover:text-blue-300">Contact us</a>
          {" "}and we&apos;ll help you get set up.
        </p>
      </div>
    </div>
  );
}
