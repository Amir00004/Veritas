import React from 'react';

const steps = [
  {
    step: '01',
    title: 'Input Your Target',
    description: 'Paste a name, a list, or search by topic. Tell us who you need to know about and why.',
  },
  {
    step: '02',
    title: 'AI Does the Research',
    description: 'We scrape Google Scholar, LinkedIn, university pages, and public sources — so you don\'t have to spend hours digging.',
  },
  {
    step: '03',
    title: 'Get Your Brief',
    description: 'Receive a ranked, structured, actionable brief: compatibility scores, research summaries, talking points, and a personalised opener.',
  },
];

export default function About() {
  return (
    <section id="how-it-works" className="bg-gray-950 py-20 md:py-28 px-6 md:px-12 border-t border-gray-800">
      <div className="max-w-6xl mx-auto">

        {/* Top: label + heading */}
        <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">How It Works</p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight max-w-xl">
            From a Name to<br />a Full Brief in Seconds
          </h2>
          <p className="text-gray-400 max-w-sm text-base leading-relaxed">
            No more rabbit holes. No more wasted hours. Scopeout turns a name into actionable intelligence before your high-stakes moment.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {steps.map((s) => (
            <div key={s.step} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 flex flex-col gap-4">
              <span className="text-orange-500 text-4xl font-bold leading-none">{s.step}</span>
              <h3 className="text-white text-xl font-semibold">{s.title}</h3>
              <p className="text-gray-400 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA banner */}
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 px-8 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-white text-2xl md:text-3xl font-bold mb-2">
              Built for the moments that matter.
            </h3>
            <p className="text-gray-400 max-w-lg">
              PhD applications. Job interviews. Cold outreach. Scopeout gives you the intel to show up prepared — every single time.
            </p>
          </div>
          <a
            href="#"
            className="shrink-0 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-7 py-4 rounded-full transition-all duration-300"
          >
            Get Early Access
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
