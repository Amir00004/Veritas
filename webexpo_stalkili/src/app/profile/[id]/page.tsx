'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, BookOpen, Quote, ExternalLink } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Researcher } from '@/components/ui/researcher-card';

// Mock publication snippets keyed by researcher id
const PUBLICATIONS: Record<string, { title: string; journal: string; year: number; citations: number; abstract: string }[]> = {
  'sarah-chen': [
    {
      title: 'EfficientViT: Multi-Scale Linear Attention for High-Resolution Dense Prediction',
      journal: 'NeurIPS 2023',
      year: 2023,
      citations: 412,
      abstract: 'We propose a multi-scale linear attention mechanism that achieves state-of-the-art accuracy on dense prediction tasks while reducing FLOPs by 3×.',
    },
    {
      title: 'Neural Architecture Search Without Training',
      journal: 'ICML 2022',
      year: 2022,
      citations: 289,
      abstract: 'A training-free NAS approach that estimates architecture performance using gradient-based proxies, cutting search time from days to minutes.',
    },
    {
      title: 'Sparse Mixture-of-Experts for Vision Transformers',
      journal: 'ICLR 2022',
      year: 2022,
      citations: 197,
      abstract: 'Introduces conditional computation to ViT models, enabling capacity scaling with sub-linear compute growth across image classification benchmarks.',
    },
  ],
  'james-okafor': [
    {
      title: 'Algorithmic Accountability in Public Sector AI',
      journal: 'ACM FAccT 2023',
      year: 2023,
      citations: 341,
      abstract: 'A framework for auditing government-deployed AI systems, drawing on EU regulatory cases and proposing a tiered accountability model.',
    },
    {
      title: 'Fairness Under Distribution Shift',
      journal: 'NeurIPS 2022',
      year: 2022,
      citations: 256,
      abstract: 'We show that group-fairness constraints break under covariate shift and propose invariant risk minimization as a robust alternative.',
    },
    {
      title: 'Toward a Global AI Governance Framework',
      journal: 'Science & Policy, 2023',
      year: 2023,
      citations: 189,
      abstract: 'Comparative analysis of AI governance approaches across 22 jurisdictions, identifying convergence points for an international baseline standard.',
    },
  ],
  'priya-nair': [
    {
      title: 'Low-Resource Neural Machine Translation via Cross-Lingual Transfer',
      journal: 'ACL 2023',
      year: 2023,
      citations: 278,
      abstract: 'Fine-tuning mT5 with less than 5 000 sentence pairs achieves near-supervised performance on 14 low-resource language pairs.',
    },
    {
      title: 'IndicBERT: A Pre-trained Language Model for Indic Languages',
      journal: 'EMNLP 2022',
      year: 2022,
      citations: 214,
      abstract: 'Multilingual model trained on 12 Indian languages that outperforms XLM-R on 8 of 10 downstream tasks with 40% fewer parameters.',
    },
    {
      title: 'Dialect-Aware Tokenisation for South Asian NLP',
      journal: 'EMNLP 2023',
      year: 2023,
      citations: 143,
      abstract: 'A tokenisation strategy that preserves morphological markers in agglutinative South Asian languages, improving NLU performance by up to 9 points.',
    },
  ],
};

const COVER_IMAGES: Record<string, string> = {
  'sarah-chen': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&h=280&fit=crop',
  'james-okafor': 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&h=280&fit=crop',
  'priya-nair': 'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=900&h=280&fit=crop',
};

const matchConfig = (score: number) => {
  if (score >= 80) return { label: 'High Match', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
  if (score >= 50) return { label: 'Average Match', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
  return { label: 'Low Match', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
};

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [researcher, setResearcher] = useState<Researcher | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`researcher_${id}`);
    if (raw) setResearcher(JSON.parse(raw));
  }, [id]);

  if (!researcher) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-500 text-sm">
        Profile not found.
      </div>
    );
  }

  const match = matchConfig(researcher.matchScore);
  const publications = PUBLICATIONS[researcher.id] ?? [];
  const coverUrl = COVER_IMAGES[researcher.id] ?? 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=900&h=280&fit=crop';
  const initials = researcher.name.split(' ').map((n) => n[0]).join('');

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Glows — z-0 keeps them below the orb (z-50) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Top centre */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-100 opacity-20"
          style={{
            background: 'radial-gradient(ellipse at top center, rgba(249,115,22,0.45) 0%, transparent 65%)',
            filter: 'blur(70px)',
          }}
        />
        {/* Left side */}
        <div
          className="absolute -left-20 top-1/4 w-96 h-160 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at left center, rgba(249,115,22,0.35) 0%, transparent 65%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Right side */}
        <div
          className="absolute -right-20 top-1/3 w-96 h-160 opacity-25"
          style={{
            background: 'radial-gradient(ellipse at right center, rgba(249,115,22,0.28) 0%, transparent 65%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-16">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to results
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* ── Main card (cover + avatar overlap) ── */}
          <Card className="overflow-hidden gap-0 py-0 border-white/10 bg-white/5 backdrop-blur-xl">
            {/* Cover */}
            <div className="relative h-44 sm:h-52 overflow-hidden">
              <img
                src={coverUrl}
                alt="cover"
                className="w-full h-full object-cover"
              />
              {/* Darken overlay so white card edge reads cleanly */}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            </div>

            <CardContent className="px-6 pb-6">
              {/* Avatar overlaps cover */}
              <div className="flex items-end justify-between -mt-12 mb-4">
                <Avatar className="size-24 border-4 border-black shadow-xl rounded-2xl">
                  <AvatarImage src={researcher.image} alt={researcher.name} />
                  <AvatarFallback className="text-xl rounded-2xl">{initials}</AvatarFallback>
                </Avatar>

                {/* Match pill */}
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${match.bg} ${match.border} ${match.color}`}>
                  {match.label} · {researcher.matchScore}%
                </span>
              </div>

              {/* Name + title */}
              <h1 className="text-2xl font-bold text-white leading-tight">{researcher.name}</h1>
              <p className="text-gray-400 text-sm mt-1">{researcher.title}</p>

              {/* Meta row */}
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin size={11} className="text-orange-500" /> {researcher.university}
                </span>
                <span className="text-gray-700">·</span>
                <span>{researcher.location}</span>
                <span className="text-gray-700">·</span>
                <span className="flex items-center gap-1">
                  <BookOpen size={11} className="text-orange-500" /> {researcher.publications} publications
                </span>
              </div>

              {/* Topics */}
              <div className="flex flex-wrap gap-2 mt-4">
                {researcher.topics.map((topic) => (
                  <Badge key={topic} variant="research">{topic}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── AI Summary ── */}
          <Card className="mt-4 gap-0 py-5 bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="px-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">AI Summary</p>
              <div className="flex gap-3">
                <Quote size={16} className="text-orange-500 shrink-0 mt-0.5" />
                <p className="text-gray-300 text-sm leading-relaxed italic">{researcher.summary}</p>
              </div>
            </CardContent>
          </Card>

          {/* ── Research snippets ── */}
          {publications.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 px-1">
                Recent Work
              </p>
              <div className="flex flex-col gap-3">
                {publications.map((pub, i) => (
                  <motion.div
                    key={pub.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 + i * 0.08 }}
                  >
                    <Card className="gap-0 py-0 bg-white/5 backdrop-blur-xl border-white/10 hover:border-orange-500/30 hover:bg-white/8 transition-all cursor-default">
                      <CardContent className="px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
                              {pub.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <span className="text-orange-400 text-xs font-medium">{pub.journal}</span>
                              <span className="text-gray-700 text-xs">·</span>
                              <span className="text-gray-500 text-xs">{pub.year}</span>
                              <span className="text-gray-700 text-xs">·</span>
                              <span className="text-gray-500 text-xs">{pub.citations} citations</span>
                            </div>
                            <p className="text-gray-500 text-xs mt-2 leading-relaxed line-clamp-2">
                              {pub.abstract}
                            </p>
                          </div>
                          <ExternalLink size={13} className="text-gray-600 shrink-0 mt-0.5" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ── Stats footer ── */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { value: researcher.publications, label: 'Publications' },
              { value: publications.reduce((s, p) => s + p.citations, 0) || '—', label: 'Total Citations' },
              { value: researcher.topics.length, label: 'Research Areas' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
                <span className="text-2xl font-bold text-white block">{value}</span>
                <span className="text-xs text-gray-500 mt-1 block">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
