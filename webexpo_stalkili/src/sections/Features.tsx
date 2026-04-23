'use client';

import React, { useState, useEffect, useRef } from 'react';

function useCountUp(target: number, duration = 1800, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);
  return count;
}

function StatCard({ value, label, index, started }: { value: string; label: string; index: number; started: boolean }) {
  // Parse numeric part and suffix (e.g. "10x" → 10 + "x", "95%" → 95 + "%", "2.4K" → 2.4 + "K")
  const match = value.match(/^(\d+\.?\d*)(.*)$/);
  const numericPart = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : value;
  const isDecimal = match ? match[1].includes('.') : false;

  const count = useCountUp(isDecimal ? numericPart * 10 : numericPart, 1800, started);
  const display = isDecimal ? (count / 10).toFixed(1) : count;

  return (
    <div
      className={`relative flex flex-col items-center justify-center py-10 px-6 ${index !== 0 ? 'border-l border-white/5' : ''}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <p className="text-3xl md:text-4xl font-bold text-white tracking-tight tabular-nums">
        {started ? `${display}${suffix}` : value}
      </p>
      <p className="text-white/50 text-xs uppercase tracking-widest mt-2">{label}</p>
    </div>
  );
}

const useCases = [
  {
    number: '01',
    title: 'PhD Supervisor Matching',
    description:
      'Paste a list of potential supervisors and your research interests. We scrape Google Scholar and university pages, then return ranked matches with compatibility scores, plain-English research summaries, and a personalised email opener per supervisor.',
    tags: ['Research Match', 'Google Scholar', 'Email Opener'],
  },
  {
    number: '02',
    title: 'Recruiter Intelligence',
    description:
      "Search any recruiter before your interview. Discover what they post about, what they value in candidates, their hiring patterns, and the kind of profiles they champion — so you walk in knowing exactly how to position yourself.",
    tags: ['LinkedIn Intel', 'Positioning Advice', 'Interview Prep'],
  },
  {
    number: '03',
    title: 'Sales Cold Call Prep',
    description:
      "Enter a prospect's name before a cold call. Get a structured brief: their role history, recent company news, likely pain points, and a conversation opener that doesn't sound like every other pitch they hear.",
    tags: ['Prospect Brief', 'Pain Points', 'Opener Script'],
  },
];

const stats = [
  { value: '3', label: 'Verticals' },
  { value: '10x', label: 'Faster Research' },
  { value: '95%', label: 'Match Accuracy' },
  { value: '2.4K', label: 'Early Users' },
];

export default function Features() {
  const [active, setActive] = useState(0);
  const [statsStarted, setStatsStarted] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStatsStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="relative bg-gray-950 py-20 md:py-28 px-6 md:px-12 overflow-hidden">
      {/* Left edge orange glow */}
      <div
        className="pointer-events-none absolute -left-32 top-1/3 w-130 h-175"
        style={{
          background: 'radial-gradient(ellipse at left center, rgba(249,115,22,0.22) 0%, rgba(249,115,22,0.07) 45%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Stats bar */}
      <div
        ref={statsRef}
        className="relative max-w-6xl mx-auto mb-20 grid grid-cols-2 md:grid-cols-4 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
        }}
      >
        {/* top shine */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />
        {stats.map((s, i) => (
          <StatCard key={s.label} value={s.value} label={s.label} index={i} started={statsStarted} />
        ))}
      </div>

      {/* Heading */}
      <div className="max-w-6xl mx-auto mb-14">
        <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">What We Do</p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight max-w-xl">
            Know Anyone Before<br />You Walk In the Room
          </h2>
          <p className="text-gray-400 max-w-sm text-base leading-relaxed">
            One platform. Three high-stakes situations. AI-powered briefs that give you the edge before the conversation even starts.
          </p>
        </div>
      </div>

      {/* Use case tabs */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_1.4fr] gap-6">
        {/* Left: tab list */}
        <div className="flex flex-col gap-3">
          {useCases.map((uc, i) => (
            <button
              key={uc.number}
              onClick={() => setActive(i)}
              className={`text-left rounded-2xl px-6 py-5 border transition-all duration-300 ${
                active === i
                  ? 'bg-orange-500/10 border-orange-500 text-white'
                  : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-600'
              }`}
            >
              <span className={`text-xs font-bold tracking-widest uppercase ${active === i ? 'text-orange-500' : 'text-gray-600'}`}>
                {uc.number}
              </span>
              <p className="text-base font-semibold mt-1">{uc.title}</p>
            </button>
          ))}
        </div>

        {/* Right: active panel */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 flex flex-col justify-between gap-8">
          <div>
            <span className="text-orange-500 text-xs font-bold tracking-widest uppercase">
              {useCases[active].number} — {useCases[active].title}
            </span>
            <p className="text-white text-xl leading-relaxed mt-4">
              {useCases[active].description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {useCases[active].tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
